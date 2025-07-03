FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && apt install -y \
    gcc \
    socat \
    gdb


WORKDIR /ctf


COPY src/chall.c .
COPY src/flag .

RUN gcc chall.c -o chall -no-pie -fno-stack-protector

EXPOSE 9999

CMD ["socat", "TCP-LISTEN:9999,reuseaddr,fork", "EXEC:stdbuf -i0 -o0 -e0 /ctf/chall,stderr"]