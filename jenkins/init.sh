#!/bin/bash

service jenkins start;
echo MYSQL_DATABASE=$MYSQL_DATABASE >> /etc/environment;
echo MYSQL_USER=$MYSQL_USER >> /etc/environment;
echo MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD >> /etc/environment;
echo MYSQL_PASSWORD=$MYSQL_PASSWORD >> /etc/environment;
tail -f /dev/null;
