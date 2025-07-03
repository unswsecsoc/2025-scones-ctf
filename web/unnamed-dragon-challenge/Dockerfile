# Modified from CTF-XSS-BOT
FROM node:21 as deps
WORKDIR /app
COPY src/package.json .
RUN npm install

FROM node:21

RUN apt-get update -y
RUN npx playwright install-deps

RUN adduser bot

USER bot
ARG BROWSER=chromium
ENV BROWSER ${BROWSER}
RUN npx playwright install $BROWSER

EXPOSE 9999

WORKDIR /home/bot
COPY --from=deps /app/node_modules /home/bot/node_modules
COPY src /home/bot
USER bot
CMD ["node", "/home/bot/index.js"]
