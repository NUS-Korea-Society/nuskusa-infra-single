#!/bin/bash

cd /home/kjaehyeok21
export AWS_PROFILE=nuskusa
sudo docker exec mysql sh -c 'exec mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" nuskusa' > /home/ubuntu/dbBackup.sql
aws s3 cp /home/ubuntu/dbBackup.sql s3://nuskusa-db-backup/dbBackup.sql
