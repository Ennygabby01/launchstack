import 'dotenv/config';

const REQUIRED = [
  // Uncomment vars that your app requires at startup:
  // 'DATABASE_URL',
  // 'JWT_SECRET',
];

for (const key of REQUIRED) {
  if (!process.env[key]) {
    console.error(`[config] Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

export const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
};
