'use strict'

const axios = require('axios');
const baseUrl = 'http://api.walmartlabs.com/v1/';
const apiKey = 'gr5jc3j3d55tuyjwv4n9rgtz';
let query;
let categoryNode;

const basicSearch = queryString =>
  query = queryString;
  new Promise((resolve, reject) => {
    const url = `${baseUrl}search`;
    axios.get(url, {
      params: {
        apiKey,
        query,
      }
    })
    .then(function (response) {
      categoryNode = response.data.items[0].categoryNode;
      resolve(response.data.items);
    })
    .catch(function (error) {
      reject(error)
    });
  });

const similarSearch = itemId =>
  new Promise((resolve, reject) => {
    const url = `${baseUrl}nbp`;
    console.log(url);
    axios.get(url, {
      params: {
        apiKey,
        itemId,
      }
    })
    .then(function (response) {
      resolve(response.data);
    })
    .catch(function (error) {
      reject(error)
    });
  });

const findCheaper = () =>
  new Promise((resolve, reject) => {
    const url = `${baseUrl}search`;
    axios.get(url, {
      params: {
        apiKey,
        categoryNode,
        query: query,
        sort: 'price',
      }
    })
    .then(function (response) {
      resolve(response.data.items);
    })
    .catch(function (error) {
      reject(error)
    });
  });

module.exports = { basicSearch, similarSearch };
basicSearch('ipod');
similarSearch(27873088);
