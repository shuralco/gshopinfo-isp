# syntax=docker/dockerfile:1
FROM nginx:1.25-alpine

COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY frontend /usr/share/nginx/html

EXPOSE 80
