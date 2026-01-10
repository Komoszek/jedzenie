FROM docker.io/node:25-slim

WORKDIR /app/jedzenie

ENV PLAYWRIGHT_BROWSERS_PATH=/app/jedzenie/playwright 

RUN npx playwright install --with-deps chromium --only-shell

COPY dist/apps/jedzenie .

CMD [ "node", "main.js" ]
