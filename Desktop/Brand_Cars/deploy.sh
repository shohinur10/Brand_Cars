#!/bin/bash

#production
git reset --hard
git checkout master
git pull origin master

docker compose up -d
docker compose down
docker compose build
docker compose up -d