#!/bin/bash

nginx -g daemon off;
certbot --nginx --non-interactive --agree-tos --email nuskusa@gmail.com --domain nuskoreasociety.org