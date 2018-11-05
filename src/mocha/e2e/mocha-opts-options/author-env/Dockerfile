FROM node:6.11.4-slim

RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install git -y

RUN npm install -g bit-bin@dev
COPY . /tmp/author-environment/
WORKDIR /tmp/author-environment/

RUN bit config set analytics_reporting false
RUN bit config set error_reporting false
