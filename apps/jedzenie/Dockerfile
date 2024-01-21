FROM docker.io/node:20-slim

WORKDIR /app

RUN addgroup --system jedzenie && \
    adduser --system -G jedzenie jedzenie

COPY dist/apps/jedzenie jedzenie
RUN chown -R jedzenie:jedzenie .

WORKDIR /app/jedzenie

ENV PLAYWRIGHT_BROWSERS_PATH=/app/jedzenie/playwright 

RUN npm --omit=dev install
RUN npx playwright install --with-deps chromium

CMD [ "node", "." ]
