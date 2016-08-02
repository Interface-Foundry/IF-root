mv ~/letsencrypt ~/letsencrypt-old

PATH=$PATH:./node/bin
./node/bin/letsencrypt certonly --standalone --domains "$1" --email peter.m.brandt@gmail.com --agree-tos
openssl pkcs12 -export -in /home/ubuntu/letsencrypt/etc//live/$1/cert.pem -inkey /home/ubuntu/letsencrypt/etc//live/$1/privkey.pem -certfile /home/ubuntu/letsencrypt/etc//live/$1/fullchain.pem -out $1.pfx



