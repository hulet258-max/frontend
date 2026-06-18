FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# CRA dev server uses this PORT; EasyPanel should map to it
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
