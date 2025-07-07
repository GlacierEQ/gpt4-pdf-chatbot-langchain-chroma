import fs from 'fs/promises';
import path from 'path';

interface CaseMap {
  [caseName: string]: string[];
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function organize(dir: string, mapPath: string): Promise<void> {
  const mapContent = await fs.readFile(mapPath, 'utf8');
  const caseMap: CaseMap = JSON.parse(mapContent);

  const entries = await fs.readdir(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) continue;
    if (!entry.toLowerCase().endsWith('.pdf')) continue;

    let moved = false;
    for (const [caseName, patterns] of Object.entries(caseMap)) {
      if (patterns.some((p) => entry.includes(p))) {
        const targetDir = path.join(dir, caseName);
        await ensureDir(targetDir);
        const newName = slugify(entry);
        await fs.rename(fullPath, path.join(targetDir, newName));
        console.log(`Moved ${entry} -> ${path.join(caseName, newName)}`);
        moved = true;
        break;
      }
    }

    if (!moved) {
      console.log(`No case match for ${entry}`);
    }
  }
}

const dir = process.argv[2] ?? 'docs';
const mapPath = process.argv[3] ?? 'case-map.json';

organize(dir, mapPath).catch((err) => {
  console.error(err);
  process.exit(1);
});
