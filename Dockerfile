FROM oven/bun:1.0.21 AS builder
WORKDIR /app
COPY package.json bun.lockb .
RUN bun install --frozen-lockfile
COPY . .
RUN bun build src/index.ts --compile --outfile=server

FROM gcr.io/distroless/base-debian12
WORKDIR /app
COPY --from=builder /app/server .
ENTRYPOINT [ "./server" ]
