FROM node:18-buster

ENV PUBLIC_DOMAIN_BACK=$PUBLIC_DOMAIN_BACK
ENV PUBLIC_PORT_BACK=$PUBLIC_PORT_BACK
ENV PUBLIC_PROTOCAL_WS=$PUBLIC_PROTOCAL_WS

COPY . /var/tmp

WORKDIR /var/tmp

RUN apt-get update && apt-get install nginx -y
RUN npm install && npm run build
RUN mv ./build/* /var/www/html
RUN rm -rf ./*

WORKDIR /var/www/html

RUN rm index.nginx-debian.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
