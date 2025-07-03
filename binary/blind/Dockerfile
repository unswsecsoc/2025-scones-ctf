FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && apt install -y \
    gcc \
    gdb \
    socat \
    git \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    vim \
    locales \
    tzdata \
    && ln -fs /usr/share/zoneinfo/Etc/UTC /etc/localtime \
    && dpkg-reconfigure --frontend noninteractive tzdata \
    && rm -rf /var/lib/apt/lists/*


RUN locale-gen en_US.UTF-8
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8


RUN git clone https://github.com/pwndbg/pwndbg /pwndbg && \
    cd /pwndbg && \
    git checkout 2023.07.17 && \
    ./setup.sh


RUN pip3 install pwntools


WORKDIR /ctf

COPY src/blind.c .
COPY src/flag .


RUN gcc blind.c -o chall -no-pie 


EXPOSE 9999
CMD ["socat", "TCP-LISTEN:9999,reuseaddr,fork", "EXEC:stdbuf -i0 -o0 -e0 ./chall,stderr"]
