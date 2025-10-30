#usar a imagem do node.js
FROM node:18-alpine

#definir o diretorio de trabalho
WORKDIR /app

#copiar os arquivos de dependencias
COPY package*.json ./

#instalar as dependencias
RUN npm install

#copiar o restante dos arquivos
COPY . .

#gerar o prisma
RUN npx prisma generate

#fazer a build do next.js
RUN npm run build

#expor a porta 300 para o container
EXPOSE 3000

#comando para rodar a aplicacao
CMD ["npm", "start"]