#!/bin/bash

wget https://nodejs.org/dist/v5.2.0/node-v5.2.0-linux-x64.tar.gz
tar xzf node-v5*
rm node-v5*.tar.gz
cd node-v5*
echo "export PATH="'$PATH'":$PWD/bin" >> ~/.bashrc
source ~/.bashrc
