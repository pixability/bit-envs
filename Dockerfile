FROM node:6.11.4-slim

ENV  DEVELOPMENT=false
ENV BITPATH=/bit-bin

# Install ssh and bit dependencies
RUN apt-get update
RUN apt-get install -y vim nano openssh-server curl && mkdir /var/run/sshd
RUN apt-get install -y  apt-transport-https gcc make python g++
RUN apt-get install git -y

# Install latest (stable) Bit version
RUN npm install -g bit-bin@dev
RUN bit config set analytics_reporting false
RUN bit config set error_reporting false
RUN mkdir -p /root/.ssh

# create publisher environment
RUN mkdir /tmp/publisher
WORKDIR /tmp/publisher
COPY . /tmp/publisher
RUN bit config set registry https://node-stg.bitsrc.io
RUN bit config set analytics_domain https://analytics-stg.bitsrc.io/
RUN bit config set hub_domain_login https://stg.bitsrc.io/bit-login
RUN bit config set hub_domain hub-stg.bitsrc.io

# create component scope
RUN mkdir /tmp/scope
WORKDIR /tmp/scope
RUN bit init --bare

# create env scope
RUN mkdir /tmp/bit.test-envs
WORKDIR /tmp/bit.test-envs
RUN bit init --bare
RUN rm -r components
RUN rm -r objects
RUN ln -s /tmp/publisher/.git/bit/objects objects
RUN ln -s /tmp/publisher/.git/bit/components components

WORKDIR /tmp/publisher
