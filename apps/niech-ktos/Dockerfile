FROM docker.io/node:20-alpine

WORKDIR /app

COPY dist/apps/niech-ktos niech-ktos

WORKDIR /app/niech-ktos

RUN npm --omit=dev install

CMD [ "node", "." ]
