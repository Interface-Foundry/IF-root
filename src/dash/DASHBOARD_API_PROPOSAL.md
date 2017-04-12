# Dashboard API Proposal

Date: 3/9/2017

After a few days of diving into the current architecture of the Dashboard API server, I've formulated some opinions and have some suggestions for changes to (and rough implementation estimates) the technology stack. Namely the storage engine and related libraries.

## Background

The Sales Dashboard API server was built over the course of the last few weeks/months. It consists of the following layers:

1. NodeJS web server
2. GraphQL Query Endpoint (express-graphql)
3. Sequelize ORM
4. Postgres DB

The postgres database is essentially a copied subset of the mongodb 'foundry' collections. A mongodb streaming op-log replicator called [mosql](https://github.com/stripe/mosql) is currently being used (`src/data/run.js`) to copy the relevant fields/tables into a local postgres database for development.

It seems likely that the original creator of the API server imagined that a mosql process would similarly run in production, tailing the (google-cloud-hosted) mongo op-log and updating the postgres DB with relevant changes.

## Issues

It hasn't been smooth sailing trying to get the postgres copy script (`src/data/run.js`) to complete. I've run into a number of issues that portend trouble for long-term maintenance.

#### Mosql status

The 'mosql' utility currently being employed to copy mongo documents into relational postgres rows was developed by stripe. It's [github repo](https://github.com/stripe/mosql) states that it is no longer being maintained, and is looking for someone to take over the project. It seems unlikely that bugs we encounter with the software along the way are likely to be addressed (even if we were to propose code changes ourselves) in a timely manner.

Mosql is a Ruby application. So even if we were to fork the repo and maintain that fork with bug-fixes, I'm not sure if anyone on the team has sufficient experience with Ruby to feel comfortable getting into the guts of the tool to debug/fix problems.

Over the course of the last two days, I've encountered two bugs in mosql, some of which have required manual modification of the source code:

1. [document too large](https://github.com/stripe/mosql/issues/101) - rows of the delivery table are unable to be imported because mosql uses legacy mongodb row-size limits.
2. when importing nested mongodb documents as TEXT ARRAY, invalid type assumptions are made for sub-document fields causing imports to fail. various people have submitted bug reports related to this issue, but there is no official response for these issues. My solution has been to simply remove these nested fields from the postgres schema, so that they're not imported at all.
3. mosql seems to insist upon connecting to a localhost database, even if the configuration specifies a non-local hostname. The only way I've gotten around this is to reassign the localhost address in /etc/hosts of the machine that mosql runs on. 

The fact that I've encountered 3 bugs that have each required hours of research and subsequent hackery in my first 2 days using the software makes me worry that there will be many more headaches to come, especially if the requirements for the mongo->pg copy become more complex.

#### Deployment / Maintenance

Maintaining a duplicate copy of the mongodb data in postgres introduces two obvious challenges:

1. Schema (DDL) changes will need to be maintained in two different places. Developers wanting to change a field name or modify the structure of an existing mongodb document will need to remember to make reflective changes in the postgres schema.
2. Scaling could become problematic, as you're now constrained by the min(mongo, postgres) in terms of sharding, indexing, replicating, etc for any performance concerns. These database technologies excel in orthogonal areas, so trying to maintain one dataset in both is bound to create headaches down the road.

Additionally, even if we were able to get mosql working the way we want it to, there is additional operational complexity required to run it in production. The two additional services we'd need to run would be a postgres server and a mosql server. The postgres database is probably not too difficult to set up via Google Cloud Platform. And assuming that the mosql process could be dockerize and launched on kubernetes, it's probably not terribly difficult to stand up. But it is worth noting that neither would be necessary to setup or maintain if we could back the graphql endpoint with the existing mongodb instance already running.

## Proposal

For the reasons stated above, I feel strongly that it would be wise to ditch the 'postgres copy' step for the Dashboard API server. I believe that using either the mongoose orm employed by other areas of the kip infrastructure, or even just using the vanilla mongodb library to perform the storage-level lookups would result in a simpler, more-consistent, and easier-to-maintain application.

The resulting server would have the following layers:

1. NodeJS web server
2. GraphQL Query Endpoint (express-graphql)
3. Mongoose ORM _OR_ mongodb (no-orm)
4. (existing) mongodb

The steps necessary to get there (assuming the no-orm approach):

* Rewrite all of `queries/*.js` and `models/*.js` to use the 'mongodb' library rather than sequelize. **8 - 12hrs**
* Code review / feedback **4 hrs**
* Documentation and helping FE developers switch over to mongo **4 hrs**

It doesn't seem unreasonable to have a working API server prototype talking solely to mongodb with another ~20 hours of development time.

#### Risks

I haven't built a graphql API before, so I'm just assuming that based on the prototype I've messed around with and what I've read that I'm not missing anything big!?
