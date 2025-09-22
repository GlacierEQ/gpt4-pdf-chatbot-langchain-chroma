import 'dotenv/config';
import { OpenAI } from 'langchain/llms/openai';
import { Chroma } from 'langchain/vectorstores/chroma';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { COLLECTION_NAME } from '@/config/chroma';

const MAX_CONTEXT_DOCS = 4;

const embeddings = new OpenAIEmbeddings();
const llm = new OpenAI({ temperature: 0 });
const vectorStorePromise = Chroma.fromExistingCollection(embeddings, {
  collectionName: COLLECTION_NAME,
});

type AgentTrace = {
  agent: 'retrieval' | 'answer' | 'verifier';
  output: string;
};

function logTrace(traces: AgentTrace[]): void {
  traces.forEach((trace) => {
    console.log(`\n[${trace.agent.toUpperCase()} AGENT]\n${trace.output}`);
  });
}

async function retrievalAgent(question: string): Promise<string> {
  const vectorStore = await vectorStorePromise;
  const docs = await vectorStore.similaritySearch(question, MAX_CONTEXT_DOCS);
  return docs.map((doc) => doc.pageContent).join('\n\n');
}

async function answerAgent(question: string, context: string): Promise<string> {
  if (!context) {
    return "I don't have any relevant context to answer that question.";
  }

  const prompt = `You are an AI assistant. Use the context below to answer the question.\n\nContext:\n${context}\n\nQuestion: ${question}\nAnswer:`;
  const response = await llm.call(prompt);
  return response.trim();
}

async function verifierAgent(question: string, context: string, answer: string): Promise<string> {
  const prompt = `Verify that the proposed answer is fully supported by the context. If it is, return the answer unchanged. Otherwise, respond with 'I don't know'.\n\nContext:\n${context}\n\nQuestion: ${question}\nProposed Answer: ${answer}\nVerified Answer:`;
  const response = await llm.call(prompt);
  return response.trim();
}

async function run(question: string): Promise<void> {
  const traces: AgentTrace[] = [];

  const context = await retrievalAgent(question);
  traces.push({ agent: 'retrieval', output: context || '[no relevant context retrieved]' });

  const answer = await answerAgent(question, context);
  traces.push({ agent: 'answer', output: answer });

  const verified = await verifierAgent(question, context, answer);
  traces.push({ agent: 'verifier', output: verified });

  console.log(`Question: ${question}`);
  logTrace(traces);
}

const question = process.argv.slice(2).join(' ');

if (!question) {
  console.error('Please provide a question to ask the agents.');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY environment variable is missing.');
  console.error('Please add your OpenAI key to the .env file.');
  process.exit(1);
}

if (!process.env.COLLECTION_NAME) {
  console.error('COLLECTION_NAME environment variable is missing.');
  console.error('Please create a .env file with COLLECTION_NAME=<your collection>.');
  process.exit(1);
}

run(question).catch((error) => {
  console.error(error);
  process.exit(1);
});
