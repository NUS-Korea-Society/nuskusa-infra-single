FROM nuskusa/nuskusa:latest
RUN apt-get update && apt-get -y upgrade

# Configure Timezone for HTTPS Certification
RUN DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC apt-get -y install tzdata
RUN echo "Asia/Singapore" > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata

# Install nginx, certbot
RUN apt-get install -y nginx certbot python3-certbot-nginx

# Configure for certbot
RUN mkdir -p /var/www/letsencrypt/.well-known/acme-challenge
RUN chmod 776 /var/www/letsencrypt/.well-known/acme-challenge
# Attain Certificate from certbot
#RUN certbot --nginx --non-interactive --agree-tos --email nuskusa@gmail.com --domain nuskoreasociety.org

# Copy nginx config file, initialization script
COPY nginx.conf /etc/nginx/nginx.conf
COPY init.sh init.sh
RUN chmod 777 init.sh

EXPOSE 80
EXPOSE 443
EXPOSE 22

CMD ["nginx", "-g", "daemon off;"]