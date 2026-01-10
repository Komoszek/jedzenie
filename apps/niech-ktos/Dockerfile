FROM docker.io/node:25-alpine

WORKDIR /app/niech-ktos

COPY dist/apps/niech-ktos/package*.json ./

RUN npm --omit=dev install

COPY dist/apps/niech-ktos .

CMD [ "node", "." ]
