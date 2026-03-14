FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

EXPOSE 3000

CMD ["npm", "start"]

# ─── Development stage ────────────────────────────────────────────────────────
FROM base AS dev
RUN npm ci
CMD ["npm", "run", "dev"]
