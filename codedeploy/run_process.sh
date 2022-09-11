#!/bin/bash

cd /home/ubuntu/nuskusa-backend;
sudo git pull origin main;
cd /home/ubuntu/nuskusa-infra-single;
sudo git pull origin main;

cd /home/ubuntu;

rm nuskusa-backend/docker-compose.yml;
rm -r nuskusa-backend/codedeploy;
mv nuskusa-infra-single/docker-compose.yml nuskusa-backend/;
mv -r nuskusa-infra-single/mysql nuskusa-backend/;
mv -r nuskusa-infra-single/codedeploy nuskusa-backend/;

docker compose build;
docker compose up -d;
