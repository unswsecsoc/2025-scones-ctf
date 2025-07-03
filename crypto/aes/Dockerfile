FROM python:3-alpine

EXPOSE 9999

RUN apk add socat && \
    pip install pycryptodome

WORKDIR /app

COPY ./src/challenge.py ./
COPY ./src/secrets.py ./

CMD socat TCP4-LISTEN:9999,fork EXEC:"python challenge.py"