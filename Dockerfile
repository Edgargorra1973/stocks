FROM ubuntu:20.04

# Evitar preguntas interactivas
ENV DEBIAN_FRONTEND=noninteractive

# Actualizar repositorios y preparar el entorno
RUN apt-get update && apt-get install -y --no-install-recommends \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    software-properties-common \
    unixodbc \
    unixodbc-dev \
    build-essential \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Agregar manualmente el repositorio de Python 3.10
RUN curl -fsSL https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x3B4FE6ACC0B21F32 | gpg --dearmor -o /usr/share/keyrings/ubuntu-archive-keyring.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/ubuntu-archive-keyring.gpg] http://archive.ubuntu.com/ubuntu focal main universe" > /etc/apt/sources.list.d/python.list && \
    apt-get update && apt-get install -y --no-install-recommends \
    python3.10 \
    python3.10-venv \
    python3.10-dev \
    python3-distutils \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Establecer Python 3.10 como predeterminado
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.10 1

# Instalar pip
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.10

# Crear directorio de trabajo
WORKDIR /app

# Copiar dependencias
COPY requirements.txt /app/

# Instalar dependencias de Python
RUN python3 -m venv venv && \
    . venv/bin/activate && \
    pip install --upgrade pip && \
    pip install -r requirements.txt

# Copiar la aplicación
COPY . /app

# Exponer el puerto
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["/app/venv/bin/python", "app.py"]
