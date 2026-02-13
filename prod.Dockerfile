
FROM node:20-slim

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos do projeto para o container
COPY . .

# Inicializa o package.json se não existir e instala o express
RUN if [ ! -f package.json ]; then npm init -y; fi && \
    npm install express

# Garante que o container possa escrever no diretório (necessário para db.json no Easypanel)
RUN chmod -R 777 /app

# Expõe a porta 3000
EXPOSE 3000

# Comando para iniciar o servidor Node
CMD ["node", "server.js"]
