FROM docker.io/node:25-slim

WORKDIR /app/jedzenie

COPY package*.json ./

RUN npm --omit=dev install

ENV PLAYWRIGHT_BROWSERS_PATH=/app/jedzenie/playwright 

RUN npx playwright install --with-deps chromium --only-shell

COPY . .

CMD [ "node", "." ]
