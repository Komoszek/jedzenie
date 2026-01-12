FROM docker.io/node:25-alpine

WORKDIR /app/niech-ktos

COPY package*.json ./

RUN npm --omit=dev install


COPY . .

CMD [ "node", "." ]
