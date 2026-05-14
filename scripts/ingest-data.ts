import { ChromaOperator } from '@/operators/chromaOperator';

/* Default directory to retrieve your files from */
const filePath = process.argv[2] ?? 'docs';
const reset = !process.argv.includes('--keep');

export const run = async () => {
  try {
    const operator = await ChromaOperator.getInstance();
    await operator.ingestDirectory(filePath, reset);
    console.log('ingestion complete');
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  await run();
  console.log('ingestion script finished');
})();
