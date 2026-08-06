import { execFileSync } from "node:child_process";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const ignored = new Set([".git", "node_modules", ".wrangler"]);

async function collectJavaScript(dir, relative = "") {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const relativePath = join(relative, entry.name);
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectJavaScript(fullPath, relativePath));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(relativePath);
    }
  }
  return files;
}

const files = (await collectJavaScript(root)).sort();

for (const file of files) execFileSync(process.execPath, ["--check", join(root, file)], { stdio: "inherit" });
console.log(`Node syntax check passed: ${files.length} files`);
