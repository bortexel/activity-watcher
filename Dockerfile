FROM node:14
WORKDIR /home/container
ADD . .
CMD node index.js