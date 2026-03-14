import { input, select, checkbox, confirm } from '@inquirer/prompts';
import { runAIMode } from './ai.js';

// ─── Shared prompts ──────────────────────────────────────────────────────────

async function askDatabase() {
  return select({
    message: 'Database?',
    choices: [
      { name: 'PostgreSQL', value: 'postgresql' },
      { name: 'MySQL', value: 'mysql' },
      { name: 'MongoDB', value: 'mongodb' },
      { name: 'SQLite', value: 'sqlite' },
      { name: 'None', value: 'none' },
    ],
  });
}

async function askORM(database) {
  if (database === 'none') return 'none';

  const ormChoices = {
    postgresql: [
      { name: 'Prisma', value: 'prisma' },
      { name: 'Drizzle', value: 'drizzle' },
      { name: 'Sequelize', value: 'sequelize' },
      { name: 'None', value: 'none' },
    ],
    mysql: [
      { name: 'Prisma', value: 'prisma' },
      { name: 'Drizzle', value: 'drizzle' },
      { name: 'Sequelize', value: 'sequelize' },
      { name: 'None', value: 'none' },
    ],
    mongodb: [
      { name: 'Mongoose', value: 'mongoose' },
      { name: 'Prisma', value: 'prisma' },
      { name: 'None', value: 'none' },
    ],
    sqlite: [
      { name: 'Prisma', value: 'prisma' },
      { name: 'Drizzle', value: 'drizzle' },
      { name: 'Sequelize', value: 'sequelize' },
      { name: 'None', value: 'none' },
    ],
  };

  return select({
    message: 'ORM?',
    choices: ormChoices[database] || [{ name: 'None', value: 'none' }],
  });
}

async function askAuth() {
  return select({
    message: 'Authentication?',
    choices: [
      { name: 'JWT', value: 'jwt' },
      { name: 'OAuth', value: 'oauth' },
      { name: 'None', value: 'none' },
    ],
  });
}

async function askModules() {
  return checkbox({
    message: 'Optional modules (space to select):',
    choices: [
      { name: 'Rate limiting', value: 'rate-limit' },
      { name: 'Logging', value: 'logging' },
      { name: 'Email service', value: 'email' },
      { name: 'Redis caching', value: 'redis' },
      { name: 'Background jobs', value: 'queue' },
      { name: 'File storage', value: 'file-storage' },
    ],
  });
}

async function askPayments() {
  const wantsPayments = await confirm({
    message: 'Does this SaaS require payments?',
    default: false,
  });

  if (!wantsPayments) return 'none';

  return select({
    message: 'Payment provider?',
    choices: [
      { name: 'Stripe', value: 'stripe' },
      { name: 'PayPal', value: 'paypal' },
      { name: 'Paystack', value: 'paystack' },
      { name: 'Flutterwave', value: 'flutterwave' },
      { name: 'None', value: 'none' },
    ],
  });
}

// ─── Backend prompts ─────────────────────────────────────────────────────────

async function askBackendPrompts() {
  const backendType = await select({
    message: 'What are you building?',
    choices: [
      { name: 'SaaS backend', value: 'saas' },
      { name: 'REST API', value: 'rest' },
      { name: 'GraphQL API', value: 'graphql' },
      { name: 'Internal service', value: 'internal' },
      { name: 'AI API server', value: 'ai-api' },
    ],
  });

  const backendFramework = await select({
    message: 'Backend framework?',
    choices: [
      { name: 'Express', value: 'express' },
      { name: 'Fastify', value: 'fastify' },
      { name: 'NestJS', value: 'nestjs' },
      { name: 'Django', value: 'django' },
      { name: 'Flask', value: 'flask' },
    ],
  });

  const database = await askDatabase();
  const orm = await askORM(database);
  const auth = await askAuth();
  const modules = await askModules();

  let payments = 'none';
  if (backendType === 'saas') {
    payments = await askPayments();
  }

  return { backendType, backendFramework, database, orm, auth, modules, payments };
}

// ─── Frontend prompts ─────────────────────────────────────────────────────────

async function askFrontendPrompts() {
  const frontendFramework = await select({
    message: 'Frontend framework?',
    choices: [
      { name: 'Next.js', value: 'next' },
      { name: 'React (Vite)', value: 'react-vite' },
      { name: 'Vue (Vite)', value: 'vue' },
      { name: 'Svelte', value: 'svelte' },
      { name: 'Astro', value: 'astro' },
      { name: 'Alpine.js', value: 'alpine' },
      { name: 'Static HTML', value: 'static' },
    ],
  });

  let templateSystem = null;
  if (frontendFramework === 'alpine') {
    templateSystem = await select({
      message: 'Template system?',
      choices: [
        { name: 'Plain HTML', value: 'plain-html' },
        { name: 'EJS', value: 'ejs' },
        { name: 'Pug', value: 'pug' },
        { name: 'Handlebars', value: 'handlebars' },
      ],
    });
  }

  const styling = await select({
    message: 'Styling?',
    choices: [
      { name: 'Tailwind', value: 'tailwind' },
      { name: 'CSS', value: 'css' },
      { name: 'SCSS', value: 'scss' },
    ],
  });

  const extras = await checkbox({
    message: 'Extras (space to select):',
    choices: [
      { name: 'ESLint', value: 'eslint' },
      { name: 'Prettier', value: 'prettier' },
      { name: 'Testing', value: 'testing' },
    ],
  });

  return { frontendFramework, templateSystem, styling, extras };
}

// ─── Fullstack prompts ────────────────────────────────────────────────────────

async function askFullstackPrompts() {
  const frontendFramework = await select({
    message: 'Frontend framework?',
    choices: [
      { name: 'Next.js', value: 'next' },
      { name: 'React (Vite)', value: 'react-vite' },
      { name: 'Vue (Vite)', value: 'vue' },
      { name: 'Svelte', value: 'svelte' },
      { name: 'Alpine.js', value: 'alpine' },
    ],
  });

  const backendFramework = await select({
    message: 'Backend framework?',
    choices: [
      { name: 'Express', value: 'express' },
      { name: 'Fastify', value: 'fastify' },
      { name: 'NestJS', value: 'nestjs' },
      { name: 'Django', value: 'django' },
    ],
  });

  const database = await askDatabase();
  const orm = await askORM(database);
  const auth = await askAuth();
  const modules = await askModules();
  const payments = await askPayments();

  return { frontendFramework, backendFramework, database, orm, auth, modules, payments };
}

// ─── Simple prompts for CLI/Microservice/Worker ───────────────────────────────

async function askSimplePrompts() {
  const backendFramework = await select({
    message: 'Base framework?',
    choices: [
      { name: 'Express', value: 'express' },
      { name: 'Fastify', value: 'fastify' },
      { name: 'None', value: 'none' },
    ],
  });

  return {
    backendFramework,
    modules: [],
    database: 'none',
    orm: 'none',
    auth: 'none',
    payments: 'none',
  };
}

// ─── Docker prompt ────────────────────────────────────────────────────────────

async function askDocker() {
  return confirm({
    message: 'Docker detected on this machine. Generate Docker setup?',
    default: true,
  });
}

// ─── Main prompt flow ─────────────────────────────────────────────────────────

export async function runPrompts(env) {
  const projectType = await select({
    message: 'What type of project do you want to create?',
    choices: [
      { name: 'Backend', value: 'backend' },
      { name: 'Frontend', value: 'frontend' },
      { name: 'Fullstack', value: 'fullstack' },
      { name: 'CLI Tool', value: 'cli' },
      { name: 'Microservice', value: 'microservice' },
      { name: 'Worker Service', value: 'worker' },
    ],
  });

  const projectName = await input({
    message: 'Project name:',
    default: 'my-app',
    validate: (v) => /^[a-z0-9-_]+$/i.test(v) || 'Use only letters, numbers, hyphens, underscores',
  });

  const useAI = await confirm({
    message: 'Describe your app using AI?',
    default: false,
  });

  let config = { projectType, projectName };

  if (useAI) {
    const aiConfig = await runAIMode(env, projectType);
    if (aiConfig) {
      // User's project type always wins — AI cannot override it
      if (projectType === 'backend') {
        delete aiConfig.frontendFramework;
      } else if (projectType === 'frontend') {
        delete aiConfig.backendFramework;
      }
      Object.assign(config, aiConfig);
      config.projectName = projectName;
      config.projectType = projectType;
    } else {
      config = await applyManualPrompts(config, projectType);
    }
  } else {
    config = await applyManualPrompts(config, projectType);
  }

  if (env.docker && config.docker === undefined) {
    config.docker = await askDocker();
  } else if (!env.docker) {
    config.docker = false;
  }

  return config;
}

async function applyManualPrompts(config, projectType) {
  let typeConfig;

  if (projectType === 'backend') {
    typeConfig = await askBackendPrompts();
  } else if (projectType === 'frontend') {
    typeConfig = await askFrontendPrompts();
  } else if (projectType === 'fullstack') {
    typeConfig = await askFullstackPrompts();
  } else {
    typeConfig = await askSimplePrompts();
  }

  return { ...config, ...typeConfig };
}
