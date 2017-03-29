# Bringing up the postgres database

As of 3/6/2017, the sales dashboard uses a graphql api server backed by postgres (with sequelize as an orm). A tool called mosql is used to copy data from mongodb to postgres. 

The existing instructions for getting setup weren't very thorough, so in the process of trying to get the dashboard backend running today, I recorded the steps I took, so I hope this saves somebody some time.

## Background

I typically prefer to use docker images for testing out "heavy" system applications, because it's easier to remove docker images than it is to go through the install/uninstall process.

In order to get started, you'll need the following images available:
```
docker pull mongo:3.2.4
docker pull postgres
docker pull ubuntu
```

## Steps

### Download a dump of the production mongodb

Download the latest [mongo backup from google cloud storage](https://console.cloud.google.com/storage/browser/kip-db-dump/latest/?project=kip-styles&authuser=0):
It will be a file that is named something like slack_foundry_[MONTH]_[DAY]_[YEAR].tar.gz
Uncompress it into tmp (e.g. /tmp/slack_foundry_03_04_2017/foundry)

### Restore into a local mongodb

First, start a mongo instance to load into:
```
$ docker run --rm -i -p 27017:27017 --name kip-mongo mongo:3.2.4
```

Second, start a mongorestore session to load up the mongo instance with the backup.
```
$ docker run --rm -it -v /tmp:/tmp mongo:3.2.4 mongorestore --h 172.17.0.1:27017 --db foundry /tmp/slack_foundry_03_04_2017/foundry
```

Note: that 172.17.0.1 IP address is the host IP on the docker bridge. You can use `ifconfig` to get the correct IP for your system.

Verify that the data loads with no errors. You can run a count on the messages table to validate sanity:
```
docker run --rm -it -v /tmp:/tmp mongo:3.2.4 mongo 172.17.0.1:27017/foundry --eval "db.messages.count()"
```
It should report at least 100k 

### Start a local postgres

```
$ docker run --rm -i -p 5432:5432 --name kip-postgres -e POSTGRES_PASSWORD=postgres postgres
```

### Copy the data from mongo to postgres

```
$ docker run --rm -it -v /code/kip/IF-root/src/chat/components/dash:/src/chat/components/dash ubuntu /bin/bash
```

Within this docker container, run the following commands:
```
$ apt-get update
$ apt-get install -y ruby-dev emacs mongodb-clients curl build-essential libpq-dev
$ gem install mosql
$ curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh -o install_nvm.sh
$ bash install_nvm.sh
$ source ~/.profile
$ nvm install v6.10.0
$ emacs /etc/hosts --> change localhost to docker host IP (for some reason it ignores the mongo url in run.js)
$ cd /src/chat/components/dash
$ emacs ./src/data/run.js 
  change psql url to postgres://postgres:postgres@172.17.0.1:5432/postgres
  change mongo url to mongodb://172.17.0.1:27017/foundry
$ emacs ./src/data/yml/delivery.yml - comment out the delivery table, it has rows that are too big for mosql to translate.
$ ./node_modules/.bin/babel-node ./src/data/run.js src/data/yml/delivery.yml
```

### Dumping the database to a file

Write a compressed file.
```
docker run --rm -it -v /tmp:/tmp postgres /bin/bash
$ pg_dump -h 172.17.0.1 -p 5432 -Fc -U postgres -W postgres > /tmp/postgres.sql
```

### Restoring the database from the file
```
docker run --rm -it -v /tmp:/tmp postgres /bin/bash
$ time pg_restore -j 4 -h 172.17.0.1 -p 5432 -U postgres -W -c -d postgres /tmp/mosql_import_03_07_2017.sql.c
```

# NOTES:

## Known issues

After about 35 minutes of loading, I got the following error.
```
`serialize': Document too large: This BSON document is limited to 4194304 bytes. (BSON::InvalidDocument)
```

Update: it was the issue described [here](https://github.com/stripe/mosql/issues/101). Modifying the schema.rb in the way suggested seems to fix the problem.

---

Most of the TEXT ARRAY fields for the delivery table need to be commented out of the delivery.yml file in order to get the copy to work.

The bug [here](https://github.com/brainspec/enumerize/issues/245) is the error we were seeing during the copy for each of those fields, but I never got to the bottom of why those fields were mis-typed.

---

Even if you specify a mongo url (e.g. mongodb://172.17.0.1:27017) it still tries to connect to localhost. Unclear if that means we're going to need to hack etc/hosts on production machines?

---

Mosql is no longer being actively maintained. We'd be flying without ground support, which is risky to put into a critical production path.
