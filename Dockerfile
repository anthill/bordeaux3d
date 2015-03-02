FROM ants/nodejs:v1

MAINTAINER Romain Crestey <romain.crestey@ants.builders>

COPY . /bordeaux3d.ants.builders/

WORKDIR /bordeaux3d.ants.builders

RUN npm install
RUN npm run build

EXPOSE 9100

CMD forever server.js