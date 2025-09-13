#!/bin/bash

#PRODUCTION
git reset --hard 
git checkout master
git pull origin master 

# Stop existing containers
docker compose down

# Start with production configuration
docker compose -f docker-compose.prod.yml up -d --build