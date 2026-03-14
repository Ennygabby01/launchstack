FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]

# ─── Development stage ────────────────────────────────────────────────────────
FROM base AS dev
RUN npm ci
CMD ["npm", "run", "dev"]
