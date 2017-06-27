#!/usr/bin/env bash

docker build \
  -t mint:latest \
  -f src/mint/Dockerfile \
  .
