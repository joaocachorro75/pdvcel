# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Instala dependências de compilação para o SQLite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copia package.json e instala TODAS as dependências
COPY package.json ./
RUN npm install

# Copia o resto dos arquivos
COPY . .

# Faz o build do Vite (gera pasta dist/)
RUN npm run build

# Stage 2: Production
FROM node:20-slim

WORKDIR /app

# Instala dependências de compilação para o SQLite3
RUN apt-get update && apt-get install -y python3 make g++ sqlite3 && rm -rf /var/lib/apt/lists/*

# Copia arquivos do build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/server.js ./

# Reinstala apenas as dependências de produção
RUN npm install --omit=dev better-sqlite3 sqlite3 express

# Cria diretório de dados persistente
RUN mkdir -p /data

# Volume para dados persistentes
VOLUME /data

# Expõe a porta
EXPOSE 3000

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/data

# Inicia o servidor
CMD ["node", "server.js"]
