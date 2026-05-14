/**
 * Configuration for Chroma vector store connection.
 */

if (!process.env.COLLECTION_NAME) {
  throw new Error('Missing collection name in .env file');
}

const COLLECTION_NAME = process.env.COLLECTION_NAME;
const CHROMA_URL = process.env.CHROMA_URL ?? 'http://localhost:8000';
const CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE ?? '1000', 10);
const CHUNK_OVERLAP = parseInt(process.env.CHUNK_OVERLAP ?? '200', 10);

export { COLLECTION_NAME, CHROMA_URL, CHUNK_SIZE, CHUNK_OVERLAP };
