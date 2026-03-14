import { execa } from 'execa';
import { input, confirm } from '@inquirer/prompts';
import ora from 'ora';
import { logger } from './utils/logger.js';

const AI_PROMPT_TEMPLATE = (description) => `
You are a software architecture assistant. Based on the following app description, return ONLY a valid JSON object with no extra text, markdown, or explanation.

App description: "${description}"

Return this exact JSON structure (fill in appropriate values):
{
  "projectType": "backend|frontend|fullstack",
  "backendFramework": "express|fastify|nestjs|django|flask|none",
  "frontendFramework": "next|react-vite|vue|svelte|alpine|static|none",
  "database": "postgresql|mysql|mongodb|sqlite|none",
  "orm": "prisma|drizzle|sequelize|mongoose|none",
  "auth": "jwt|oauth|none",
  "modules": ["logging", "rate-limit", "email", "redis", "queue", "file-storage"],
  "payments": "stripe|paypal|paystack|flutterwave|none"
}

Only include relevant modules in the array. Return ONLY the JSON.
`.trim();

async function queryOllama(description) {
  const prompt = AI_PROMPT_TEMPLATE(description);
  const { stdout } = await execa('ollama', ['run', 'llama3', prompt]);
  return stdout;
}

async function queryGitHubCopilot(description) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN not set');

  const prompt = AI_PROMPT_TEMPLATE(description);

  const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`GitHub Models API error: ${response.status}${body ? ` — ${body}` : ''}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function parseAIResponse(raw) {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in AI response');
  return JSON.parse(jsonMatch[0]);
}

export async function runAIMode(env) {
  const description = await input({
    message: 'Describe your app in one sentence:',
    validate: (v) => v.trim().length > 0 || 'Please enter a description',
  });

  const spinner = ora('Asking AI to analyze your app...').start();

  try {
    let raw;

    if (env.ollama) {
      spinner.text = 'Using Ollama (local AI)...';
      raw = await queryOllama(description);
    } else if (process.env.GITHUB_TOKEN) {
      spinner.text = 'Using GitHub Copilot...';
      raw = await queryGitHubCopilot(description);
    } else {
      spinner.fail('No AI provider available (Ollama not found, GITHUB_TOKEN not set)');
      return null;
    }

    const config = parseAIResponse(raw);
    spinner.succeed('AI analysis complete');

    logger.blank();
    logger.info('AI suggested configuration:');
    logger.dim(JSON.stringify(config, null, 2));
    logger.blank();

    const confirmed = await confirm({
      message: 'Use this configuration?',
      default: true,
    });

    if (!confirmed) return null;

    return config;
  } catch (err) {
    spinner.fail(`AI mode failed: ${err.message}`);
    logger.warn('Falling back to manual prompts...');
    return null;
  }
}
