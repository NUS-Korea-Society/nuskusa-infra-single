FROM nuskusa/nuskusa:latest
RUN apt-get update && apt-get -y upgrade
# Install nginx, certbot
RUN apt-get install -y nginx

# Copy nginx config file, initialization script
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
EXPOSE 443
EXPOSE 22

CMD ["nginx", "-g", "daemon off;"]