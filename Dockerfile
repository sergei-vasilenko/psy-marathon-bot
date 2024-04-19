FROM node:latest

ENV URL="https://telegram-psy-bot.onrender.com" \
    PORT="8443" \ 
    TOKEN="6921334657:AAGJ0ZL9U1sv4C-cxoz_21qf2mY5_lJwuEg" \
    CERT_PHRASE="Gouranga" \
    LOGIN="admin" \
    PASSWORD="Qwerty_108"

WORKDIR /bot

COPY package*.json rollup.config.js ./
RUN npm install

COPY . .
RUN npm run build

RUN chmod +r ./certificate/cert.pem
RUN chmod +r ./certificate/key.pem
RUN chmod -R u+rwx ./app_storage

CMD ["node", "./src/index.js"]
