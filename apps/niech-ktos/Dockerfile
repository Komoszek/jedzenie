FROM docker.io/node:20-alpine

WORKDIR /app

RUN addgroup --system niech-ktos && \
    adduser --system -G niech-ktos niech-ktos

COPY dist/apps/niech-ktos niech-ktos
RUN chown -R niech-ktos:niech-ktos .

WORKDIR /app/niech-ktos

RUN npm --omit=dev install

CMD [ "node", "." ]
