FROM ants/nodejs:v1
MAINTAINER Romain Crestey <romain.crestey@ants.builders>

ADD .tmp/ /bordeaux3d/

RUN cd bordeaux3d && npm install
RUN cd bordeaux3d && npm run build
EXPOSE 9100
CMD cd bordeaux3d && forever server.js