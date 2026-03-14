import { execa } from 'execa';
import { logger } from './utils/logger.js';

const TOOLS = [
  { key: 'node', cmd: 'node', args: ['--version'] },
  { key: 'npm', cmd: 'npm', args: ['--version'] },
  { key: 'git', cmd: 'git', args: ['--version'] },
  { key: 'docker', cmd: 'docker', args: ['--version'] },
  { key: 'redis', cmd: 'redis-server', args: ['--version'] },
  { key: 'ollama', cmd: 'ollama', args: ['--version'], fallbackPaths: [
    '/opt/local/bin/ollama',       // MacPorts
    '/opt/homebrew/bin/ollama',    // Homebrew (Apple Silicon)
    '/usr/local/bin/ollama',       // Homebrew (Intel) / manual install
  ]},
];

async function checkTool(tool) {
  try {
    await execa(tool.cmd, tool.args, { reject: true });
    return true;
  } catch {
    if (tool.fallbackPaths) {
      for (const fullPath of tool.fallbackPaths) {
        try {
          await execa(fullPath, tool.args, { reject: true });
          return true;
        } catch {
          // try next
        }
      }
    }
    return false;
  }
}

export async function detectEnvironment() {
  const results = {};

  for (const tool of TOOLS) {
    results[tool.key] = await checkTool(tool);
  }

  return results;
}

export function displayEnvironment(env) {
  logger.blank();
  logger.header('Environment Check');
  logger.blank();

  const labels = {
    node: 'Node',
    npm: 'npm',
    git: 'Git',
    docker: 'Docker',
    redis: 'Redis',
    ollama: 'Ollama',
  };

  for (const [key, detected] of Object.entries(env)) {
    if (detected) {
      logger.detected(labels[key] || key);
    } else {
      logger.notDetected(labels[key] || key);
    }
  }

  logger.blank();
}
