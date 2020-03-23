FROM node:12

WORKDIR /

add package.json .
add package-lock.json .

RUN npm install

add handler.js .

CMD ["node", "handler.js"]