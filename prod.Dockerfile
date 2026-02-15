FROM node:20-slim

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos do projeto para o container
COPY package.json ./
COPY package-lock.json* ./

# Instala TODAS as dependências (incluindo devDependencies para build)
RUN npm install

# Copia o restante dos arquivos
COPY . .

# FAZ O BUILD DO VITE (gera pasta dist/)
RUN npm run build

# Remove devDependencies para reduzir tamanho
RUN npm prune --production

# Garante que o container possa escrever no diretório (necessário para db.json)
RUN chmod -R 777 /app

# Expõe a porta 3000
EXPOSE 3000

# Comando para iniciar o servidor Node
CMD ["node", "server.js"]
