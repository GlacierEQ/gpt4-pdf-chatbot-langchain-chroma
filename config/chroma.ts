/**
 * Configuration for Chroma vector store connection.
 */

if (!process.env.COLLECTION_NAME) {
  throw new Error('Missing collection name in .env file');
}

const COLLECTION_NAME = process.env.COLLECTION_NAME;
const CHROMA_URL = process.env.CHROMA_URL ?? 'http://localhost:8000';

export { COLLECTION_NAME, CHROMA_URL };
