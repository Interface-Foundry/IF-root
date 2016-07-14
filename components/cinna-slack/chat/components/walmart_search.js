'use strict'

const axios = require('axios');
const baseUrl = 'http://api.walmartlabs.com/v1/';
const apiKey = 'gr5jc3j3d55tuyjwv4n9rgtz';
const resultModel = require('../../db/item_schema.js');

let query;
let categoryNode;

const walmartParams = {
  query: 'query',
  skip: 'start',
  search_index: 'categoryId',
}

const mapParams = params => {
  const mappedParams = {};
  for (const prop in params) {
    mappedParams[walmartParams[prop]] = prop === 'skip' ?
      params[prop] + 1 : params[prop];
  }
  mappedParams.apiKey = apiKey;
  mappedParams.lsPublisherId = 'kipsearch';

  if (!params.min_price && !params.max_price) {
    return mappedParams;
  }

  mappedParams.facet = 'on';
  const min = params.min_price ? params.min_price : '*';
  const max = params.max_price ? params.max_price : '*';
  mappedParams['facet.range'] = `price:[${min} TO ${max}]`;
  return mappedParams;
}

const mapResults = results =>
  results.map(result => {
    const model = new resultModel();
    model.title = result.name;
    model.link = result.productUrl;
    model.image = result.imageEntities.length ?
      result.imageEntities[0].mediumImage : null;
    model.images = result.imageEntities.map(image => image.mediumImage);
    model.description = result.shortDescription;
    model.price = result.salePrice;
    model.upc = result.upc;
    model.rating = result.customerRating;
    model.reviewCount = result.numReviews;
    model.source_json = JSON.stringify(result);
    model.category = result.categoryNode;
    return model;
  })

const basicSearch = params =>
  new Promise((resolve, reject) => {
    const url = `${baseUrl}search`;
    axios.get(url, {
      params: mapParams(params)
    })
    .then(function (response) {
      resolve(mapResults(response.data.items.slice(0,3)));
    })
    .catch(function (error) {
      reject(error)
    });
  });

module.exports = { basicSearch };
