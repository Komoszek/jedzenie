FROM docker.io/node:25-slim

WORKDIR /app/jedzenie

COPY dist/apps/jedzenie/package*.json ./

ENV PLAYWRIGHT_BROWSERS_PATH=/app/jedzenie/playwright 

RUN npm --omit=dev install
RUN npx playwright install --with-deps chromium --only-shell

COPY dist/apps/jedzenie .

CMD [ "node", "." ]
