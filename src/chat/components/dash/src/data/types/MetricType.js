/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
var Metric = db.Metric;
// var Metricz = require('../../../../../db/')
import {getSchema} from '@risingstack/graffiti-mongoose';

const schema = getSchema([Metric], {});


// import {
//   GraphQLObjectType as ObjectType,
//   GraphQLString as StringType,
//   GraphQLNonNull as NonNull,
// } from 'graphql';

// const MetricType = new ObjectType({
//   name: 'Metric',
//   fields: {
//     metric: { type: new NonNull(StringType) },
//     data: { type: new NonNull(StringType) },
//     author: { type: StringType },
//     publishedDate: { type: new NonNull(StringType) },
//     contentSnippet: { type: StringType },
//   },
// });

export default schema;
