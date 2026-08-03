# --- deps stage: install dependencies (needs build tools for native modules like bcrypt) ---
# and generate the Prisma client, which requires the `prisma` CLI (a devDependency),
# so this stage installs everything, then prunes dev deps afterwards.
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++ openssl
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
RUN npm prune --omit=dev

# --- runtime stage ---
FROM node:20-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 4000
CMD ["node", "server.js"]
