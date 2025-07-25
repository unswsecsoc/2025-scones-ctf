FROM node:alpine

WORKDIR /app

COPY . .

RUN apk add build-base && \
    mkdir -p /app/uploads/cpp && \
    adduser --system --no-create-home galois && \
    chown galois /app/uploads/cpp/

RUN npm install

USER "galois"

CMD ["npm", "start"]
