import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bundled templates (shipped with the CLI). Used as a fallback.
export const BUNDLED_TEMPLATES_DIR = path.resolve(__dirname, '../../templates');

// Active templates dir — updated at runtime by the generator via setTemplatesDir().
let _activeTemplatesDir = BUNDLED_TEMPLATES_DIR;

export function setTemplatesDir(dir) {
  _activeTemplatesDir = dir;
}

export function getTemplatesDir() {
  return _activeTemplatesDir;
}

// ─── File helpers ─────────────────────────────────────────────────────────────

export async function copyTemplate(templatePath, destPath) {
  await fs.ensureDir(destPath);
  await fs.copy(templatePath, destPath, { overwrite: false });
}

export async function copyModuleTemplate(moduleName, destPath) {
  const moduleSrc = path.join(_activeTemplatesDir, 'modules', moduleName);
  const modulesDest = path.join(destPath, 'src', 'modules', moduleName);

  if (await fs.pathExists(moduleSrc)) {
    await fs.ensureDir(modulesDest);
    await fs.copy(moduleSrc, modulesDest, { overwrite: false });
  }
}

export async function writeFile(filePath, content) {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf8');
}

export async function pathExists(filePath) {
  return fs.pathExists(filePath);
}

export async function ensureDir(dirPath) {
  return fs.ensureDir(dirPath);
}

export async function readFile(filePath) {
  return fs.readFile(filePath, 'utf8');
}

export async function readJson(filePath) {
  return fs.readJson(filePath);
}

export async function writeJson(filePath, data) {
  return fs.writeJson(filePath, data, { spaces: 2 });
}
