# Imagem base leve com Python e Linux Alpine
FROM python:3.11-alpine

# Instalar Nginx e Supervisor (para gerenciar Nginx + Robô Python juntos)
RUN apk add --no-cache nginx supervisor tzdata curl \
    && cp /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime \
    && echo "America/Sao_Paulo" > /etc/timezone

# Instalar dependências Python necessárias para o rastreador
RUN pip install --no-cache-dir requests urllib3 beautifulsoup4

# Criar pastas da aplicação
WORKDIR /app
COPY . /app/

# Configurar Nginx para servir o site estático na porta 80
RUN mkdir -p /run/nginx /var/www/html \
    && cp -r /app/* /var/www/html/ \
    && ln -s /var/www/html /app_web

# Configuração do Nginx
RUN echo 'events { worker_connections 1024; }' > /etc/nginx/nginx.conf \
    && echo 'http {' >> /etc/nginx/nginx.conf \
    && echo '    include /etc/nginx/mime.types;' >> /etc/nginx/nginx.conf \
    && echo '    default_type application/octet-stream;' >> /etc/nginx/nginx.conf \
    && echo '    sendfile on;' >> /etc/nginx/nginx.conf \
    && echo '    gzip on;' >> /etc/nginx/nginx.conf \
    && echo '    gzip_types text/plain text/css application/json application/javascript text/xml;' >> /etc/nginx/nginx.conf \
    && echo '    server {' >> /etc/nginx/nginx.conf \
    && echo '        listen 80;' >> /etc/nginx/nginx.conf \
    && echo '        server_name localhost;' >> /etc/nginx/nginx.conf \
    && echo '        root /var/www/html;' >> /etc/nginx/nginx.conf \
    && echo '        index index.html;' >> /etc/nginx/nginx.conf \
    && echo '        location / {' >> /etc/nginx/nginx.conf \
    && echo '            try_files $uri $uri/ =404;' >> /etc/nginx/nginx.conf \
    && echo '        }' >> /etc/nginx/nginx.conf \
    && echo '    }' >> /etc/nginx/nginx.conf \
    && echo '}' >> /etc/nginx/nginx.conf

# Script de execução contínua dos agentes Python dentro do container
RUN echo '#!/bin/sh' > /app/run_agente.sh \
    && echo 'while true; do' >> /app/run_agente.sh \
    && echo '  echo "[$(date)] Executando agente de noticias..."' >> /app/run_agente.sh \
    && echo '  python /var/www/html/noticias/agente_noticias.py' >> /app/run_agente.sh \
    && echo '  echo "[$(date)] Executando agente de politica..."' >> /app/run_agente.sh \
    && echo '  python /var/www/html/conteudo/agente_politica.py' >> /app/run_agente.sh \
    && echo '  sleep 1800' >> /app/run_agente.sh \
    && echo 'done' >> /app/run_agente.sh \
    && chmod +x /app/run_agente.sh

# Configuração do Supervisor para subir Nginx e Agente juntos
RUN echo '[supervisord]' > /etc/supervisord.conf \
    && echo 'nodaemon=true' >> /etc/supervisord.conf \
    && echo '[program:nginx]' >> /etc/supervisord.conf \
    && echo 'command=nginx -g "daemon off;"' >> /etc/supervisord.conf \
    && echo 'autorestart=true' >> /etc/supervisord.conf \
    && echo '[program:agente_noticias]' >> /etc/supervisord.conf \
    && echo 'command=/bin/sh /app/run_agente.sh' >> /etc/supervisord.conf \
    && echo 'autorestart=true' >> /etc/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
