#!/bin/sh

NODE_ENV=test mocha $1 --config=../../delivery.com/dsx_init_peter.local.yml
