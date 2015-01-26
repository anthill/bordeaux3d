FROM ants/nodejs:v1
MAINTAINER Romain Crestey <romain.crestey@ants.builders>

ADD .tmp/ /bordeaux3d.ants.builders/

RUN cd bordeaux3d.ants.builders && npm install
RUN cd bordeaux3d.ants.builders && npm run build
EXPOSE 9100
CMD cd bordeaux3d.ants.builders && forever server.js