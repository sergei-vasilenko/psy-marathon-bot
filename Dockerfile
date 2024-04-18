FROM node:latest

ENV URL=https://176.123.165.208
ENV PORT=8443
ENV TOKEN=6921334657:AAGJ0ZL9U1sv4C-cxoz_21qf2mY5_lJwuEg
ENV CERT_PHRASE=Gouranga
ENV LOGIN=admin
ENV PASSWORD=Qwerty_108

WORKDIR /usr/src/bot

COPY package*.json ./

RUN npm install

COPY . .

CMD ["node", "./src/index.js"]
