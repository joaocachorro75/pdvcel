FROM node:20

# Define o diretório de trabalho
WORKDIR /app

# Instala dependências de compilação para o SQLite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copia os arquivos do projeto
COPY . .

# Inicializa o projeto, define como módulo e instala as dependências
RUN if [ ! -f package.json ]; then \
      npm init -y && \
      sed -i 's/"main": "index.js"/"type": "module"/g' package.json; \
    fi && \
    npm install express sqlite3 sqlite

# Garante permissões de escrita para o banco de dados
RUN chmod -R 777 /app

# Expõe a porta 3000
EXPOSE 3000

# Inicia o servidor
CMD ["node", "server.js"]