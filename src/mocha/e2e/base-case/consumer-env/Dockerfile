FROM node:6.11.4-slim

RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install git -y

RUN npm install -g bit-bin@dev
COPY . /tmp/consumer-environment/
WORKDIR /tmp/consumer-environment/

RUN bit config set analytics_reporting false
RUN bit config set error_reporting false
