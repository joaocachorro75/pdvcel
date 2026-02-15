# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Copia package.json e instala dependências
COPY package.json ./
RUN npm install

# Copia o resto dos arquivos
COPY . .

# Faz o build do Vite
RUN npm run build

# Stage 2: Production
FROM node:20-slim

WORKDIR /app

# Copia arquivos do build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/db.json ./
COPY --from=builder /app/server.js ./

# Garante permissão de escrita
RUN chmod -R 777 /app

# Expõe a porta
EXPOSE 3000

# Inicia o servidor
CMD ["node", "server.js"]
