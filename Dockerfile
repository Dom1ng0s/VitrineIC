FROM node:24-bookworm-slim AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:24-bookworm-slim
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3001 TRUST_PROXY=1 PG_POOL_MAX=10
WORKDIR /app
RUN corepack enable && chown node:node /app
COPY --from=build --chown=node:node /app/package.json /app/pnpm-lock.yaml ./
# --ignore-scripts: o `prepare` da raiz roda `husky`, que é devDependency e não
# existe aqui. Nenhuma dependência precisa de script de build (o pnpm 10 só os
# roda com allowlist em `pnpm.onlyBuiltDependencies`, que o projeto não tem).
RUN pnpm install --prod --frozen-lockfile --ignore-scripts
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/build ./build
COPY --from=build --chown=node:node /app/server/db/migrations ./build/migrations
COPY --from=build --chown=node:node /app/scripts/pg-backup.mjs ./scripts/pg-backup.mjs
USER node
EXPOSE 3001
CMD ["node", "build/server.mjs"]
