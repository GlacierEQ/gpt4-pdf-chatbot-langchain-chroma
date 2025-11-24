import { Chroma } from 'langchain/vectorstores/chroma';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { CustomPDFLoader } from '@/utils/customPDFLoader';
import {
  COLLECTION_NAME,
  CHROMA_URL,
  CHUNK_SIZE,
  CHUNK_OVERLAP,
} from '@/config/chroma';

export class ChromaOperator {
  private static instance: ChromaOperator | null = null;
  private vectorStore?: Chroma;
  private embeddings: OpenAIEmbeddings;

  private constructor(embeddings?: OpenAIEmbeddings) {
    this.embeddings = embeddings ?? new OpenAIEmbeddings();
  }

  static async getInstance(): Promise<ChromaOperator> {
    if (!this.instance) {
      const operator = new ChromaOperator();
      await operator.init();
      this.instance = operator;
    }
    return this.instance;
  }

  private async init(): Promise<void> {
    this.vectorStore = await Chroma.fromExistingCollection(this.embeddings, {
      collectionName: COLLECTION_NAME,
      url: CHROMA_URL,
    });
  }

  get store(): Chroma {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }
    return this.vectorStore;
  }

  async reset(): Promise<void> {
    await this.store.index?.reset();
  }

  async addDocuments(docs: Document[]): Promise<void> {
    for (let i = 0; i < docs.length; i += 100) {
      const batch = docs.slice(i, i + 100);
      await this.store.addDocuments(batch);
    }
  }

  /**
   * Ingest all PDF documents from the given directory.
   *
   * @param dirPath Path to the directory containing PDF files.
   * @param reset Whether to clear the existing collection before adding documents.
   */
  async ingestDirectory(dirPath: string, reset = true): Promise<void> {
    const directoryLoader = new DirectoryLoader(dirPath, {
      '.pdf': (path) => new CustomPDFLoader(path),
    });
    const rawDocs = await directoryLoader.load();
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP,
    });
    const docs = await textSplitter.splitDocuments(rawDocs);
    if (reset) {
      await this.reset();
    }
    await this.addDocuments(docs);
  }
}
