FROM docker.io/node:22-alpine

WORKDIR /app

COPY dist/apps/niech-ktos niech-ktos

WORKDIR /app/niech-ktos

RUN npm --omit=dev install

CMD [ "node", "." ]
