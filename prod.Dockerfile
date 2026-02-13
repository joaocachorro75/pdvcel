
FROM node:20-slim

WORKDIR /app

# Copia os arquivos do projeto
COPY . .

# Instala o express para o backend
RUN npm init -y && npm install express

# Expõe a porta do Easypanel
EXPOSE 3000

# Comando para rodar o servidor
CMD ["node", "server.js"]
