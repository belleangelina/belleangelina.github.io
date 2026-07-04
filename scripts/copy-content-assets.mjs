import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';

const contentRoot = path.resolve(process.cwd(), process.env.WRITINGS_CONTENT_DIR ?? 'writings-content');
const targetRoot = path.resolve(process.cwd(), 'public/content');

async function main() {
  await fs.rm(targetRoot, { recursive: true, force: true });

  if (!existsSync(contentRoot)) {
    console.log(`[copy-content-assets] Skip: ${contentRoot} does not exist.`);
    return;
  }

  const files = await fg('**/*', {
    cwd: contentRoot,
    onlyFiles: true,
    dot: false,
    ignore: ['**/*.md', '**/*.mdx']
  });

  for (const file of files) {
    const source = path.join(contentRoot, file);
    const target = path.join(targetRoot, file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(source, target);
  }

  console.log(`[copy-content-assets] Copied ${files.length} asset(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
