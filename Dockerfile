FROM python:3.10-slim-buster

# Configurar variables de entorno para evitar preguntas interactivas
ENV DEBIAN_FRONTEND=noninteractive

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    unixodbc \
    unixodbc-dev \
    build-essential \
    curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Crear un entorno de trabajo
WORKDIR /app

# Copiar dependencias
COPY requirements.txt /app/

# Instalar dependencias de Python
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copiar la aplicación
COPY . /app

# Exponer el puerto
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["python", "app.py"]
