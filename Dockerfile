# Fase de Build
FROM node:18 AS build

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de configuração e de dependências para o container
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todo o restante dos arquivos da aplicação
COPY . .

# Compila a aplicação TypeScript para JavaScript
RUN npm run build

# Fase de Produção
FROM node:18 AS production

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas as dependências instaladas e o diretório build
COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Exponha a porta usada pelo NestJS (normalmente 3000)
EXPOSE 3001

# Comando para iniciar a aplicação NestJS
CMD ["node", "dist/main.js"]