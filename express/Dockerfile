FROM ubuntu:latest
COPY . ./express

RUN apt-get update && apt-get -y upgrade
RUN apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_16.x -o /tmp/node_setup.sh
RUN bash /tmp/node_setup.sh
RUN apt-get install -y nodejs

WORKDIR /express

RUN npm install
CMD node express.js
