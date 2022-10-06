FROM nuskusa/nuskusa:latest
RUN apt-get update && apt-get -y upgrade
RUN apt-get install -y nginx

COPY nginx.conf /etc/nginx/nginx.conf
ADD build /var/www/nuskusa.org

WORKDIR /home/ubuntu

EXPOSE 80
EXPOSE 443
EXPOSE 22

CMD ["nginx", "-g", "daemon off;"]