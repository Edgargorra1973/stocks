FROM ubuntu:20.04

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    software-properties-common \
    unixodbc \
    unixodbc-dev \
    build-essential \
    python3.10 \
    python3.10-venv \
    python3.10-dev \
    python3-distutils \
    && rm -rf /var/lib/apt/lists/*

# Establecer Python 3.10 como predeterminado
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.10 1

# Instalar pip
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.10
