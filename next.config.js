import path from 'path';
import { config as dotenvConfig } from 'dotenv';

// Load the monorepo root .env so that OPENAI_API_KEY, PINECONE_API_KEY, etc. are
// available during build as well as at runtime.  This assumes dev scripts are
// executed from the sub-project directory (e.g. `npm run dev`).
dotenvConfig({ path: path.resolve(__dirname, '..', '.env'), override: false });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack(config) {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
};

export default nextConfig;
