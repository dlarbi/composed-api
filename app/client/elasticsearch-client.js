import AWS from 'aws-sdk';
import elasticsearch from 'elasticsearch';
import awsHttpClient from 'http-aws-es';
import Utils from '../utils/utils.js';

let client = elasticsearch.Client({
    host: 'https://search-composed-search-3vwgie2ly42nn3jple5tclgxuu.us-east-2.es.amazonaws.com',
    connectionClass: awsHttpClient,
    amazonES: {
        region: 'us-east-2',
        credentials: new AWS.Credentials(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY)
    }
});

async function createIndex(index) {
  return new Promise((resolve, reject) => {
    client.indices.create({
      index
    }).then((res) => {
      resolve(res);
    }).catch(err => reject(err));
  });
}

async function deleteIndex(index) {
  return new Promise((resolve, reject) => {
    client.indices.delete({
      index
    }).then((res) => {
      resolve(res);
    }).catch(err => reject(err));
  });
}

async function saveRecord(index, record) {
  return new Promise((resolve, reject) => {
    client.index({
      index,
      body: record
    }).then(function(res) {
      resolve(res);
    }).catch(err => reject(err));
  });
}

async function deleteRecord(index, id) {
  return new Promise((resolve, reject) => {
    client.delete({
      id,
      index
    }).then(res => {
      resolve(res);
    }).catch(err => reject(err));
  });
}

async function search(index, query) {
  return new Promise((resolve, reject) => {
    client.search({
      index: index,
      body: {
        query: query
      }
    }).then(function(res) {
      resolve(res);
    }).catch(err => reject(err));
  });
}

export default {
  createIndex,
  deleteIndex,
  saveRecord,
  deleteRecord,
  search
};
