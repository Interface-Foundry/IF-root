#!/bin/bash

echo Installing dependencies for tensorflow on a Mac 💻

if [ ! -f ./venv/bin/activate ]; then
    echo "virtualenv not found, creating new virtualenv"
    virtualenv venv
fi

source ./venv/bin/activate
sudo easy_install --upgrade six
sudo pip3 install --upgrade https://storage.googleapis.com/tensorflow/mac/tensorflow-0.6.0-py3-none-any.whl

echo done 🐑
