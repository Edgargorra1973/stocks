FROM ubuntu:20.04

# Configurar variables de entorno para evitar preguntas interactivas durante la instalación
ENV DEBIAN_FRONTEND=noninteractive

# Actualizar y instalar dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    software-properties-common \
    unixodbc \
    unixodbc-dev \
    build-essential \
    curl \
    python3.10 \
    python3.10-venv \
    python3.10-dev \
    python3-distutils \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Establecer Python 3.10 como predeterminado
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.10 1

# Instalar pip
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.10

# Crear un directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios para el contenedor (ajusta si necesitas más o menos)
COPY requirements.txt /app/

# Instalar las dependencias de Python
RUN python3 -m venv venv && \
    . venv/bin/activate && \
    pip install --upgrade pip && \
    pip install -r requirements.txt

# Copiar el resto de la aplicación al contenedor
COPY . /app

# Exponer el puerto en el que se ejecutará tu aplicación
EXPOSE 5000

# Comando de inicio para la aplicación (ajusta según el framework usado, por ejemplo, Flask)
CMD ["/app/venv/bin/python", "app.py"]
