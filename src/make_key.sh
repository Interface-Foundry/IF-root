NAME=$1

openssl genrsa -out $NAME-key.pem 2048
openssl req -new -sha256 -key $NAME-key.pem -out $NAME-csr.pem
openssl x509 -req -in $NAME-csr.pem -signkey $NAME-key.pem -out $NAME-cert.pem
openssl pkcs12 -export -in $NAME-cert.pem -inkey $NAME-key.pem -certfile $NAME-cert.pem -out $NAME.pfx

echo generated $NAME.pfx
