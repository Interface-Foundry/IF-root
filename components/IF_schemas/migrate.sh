#!/bin/bash
mongo localhost/foundry --eval "`cat multiMigration.js`"
