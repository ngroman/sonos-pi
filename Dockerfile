FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml /app/
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base
WORKDIR /app
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY . /app
CMD [ "pnpm", "start" ]
