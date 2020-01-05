import AWS from 'aws-sdk';
import uuid from 'uuid';
import Utils from '../utils/utils.js';

// TODO: Why process.env.AWS_REGION doesn't work? It should already be available when this module is initialized
AWS.config.update({
  region: 'us-east-2',
  endpoint: 'https://dynamodb.us-east-2.amazonaws.com',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

async function describeTable(tableName) {
  const params = {
    TableName: tableName,
  };
  return new Promise((resolve, reject) => {
    dynamodb.describeTable(params, function(err, data) {
      if (err) {
        console.error("Unable to describe table. Error JSON:", JSON.stringify(err, null, 2));
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

async function saveItem(tableName, item) {
  const itemToSave = item.id ? { ...item } : { id: uuid.v4(), ...item };
  const params = {
    TableName: tableName,
    Item: itemToSave
  };
  return new Promise((resolve, reject) => {
    docClient.put(params, function(err, data) {
        if (err) {
          console.error("Unable to create item. Error JSON:", JSON.stringify(err, null, 2));
          reject(err);
        } else {
          resolve(data);
        }
    });
  })
};

async function getItemById(tableName, id) {
  const params = {
    TableName: tableName,
    Key: {
      id: id
    }
  };
  return new Promise((resolve, reject) => {
    docClient.get(params, function(err, data) {
        if (err) {
          console.error("Unable to find item. Error JSON:", JSON.stringify(err, null, 2));
          reject(err);
        } else {
          resolve(data);
        }
    });
  });
};

async function getAllItems(tableName, start = 0, count = 100) {
  const params = {
    TableName: tableName
  };
  return new Promise((resolve, reject) => {
    docClient.scan(params, function(err, data) {
        if (err) {
          console.error("Unable to find item. Error JSON:", JSON.stringify(err, null, 2));
          reject(err);
        } else {
          resolve(data);
        }
    });
  })
}

function buildDynamodbFilterExpressionFromKeyValueQuery(query) {
  return Object.keys(query).reduce((acc, key, i) => {
    const keysLength = Object.keys(query).length;
    if ((keysLength - 1) === i) {
      acc += `#${Utils.hashString(key)} = :${key}`;
    } else if (keysLength > 1) {
      acc += `#${Utils.hashString(key)} = :${key} AND `;
    } else {
      acc += `#${Utils.hashString(key)} = :${key} `;
    }
    return acc;
  }, '');
}

function buildDymamodbExpressionAttributeNamesFromKeyValueQuery(query) {
  return Object.keys(query).reduce((acc, key) => {
    acc[`#${Utils.hashString(key)}`] = key;
    return acc;
  }, {});
}

function buildDynamodbExpressionAttributeValuesFromKeyValueQuery(query) {
  return Object.keys(query).reduce((acc, key) => {
    acc[`:${key}`] = query[key];
    return acc;
  }, {});
}

async function query(tableName, query) {
  const params = {
    TableName: tableName,
    FilterExpression: buildDynamodbFilterExpressionFromKeyValueQuery(query),
    ExpressionAttributeNames: buildDymamodbExpressionAttributeNamesFromKeyValueQuery(query),
    ExpressionAttributeValues: buildDynamodbExpressionAttributeValuesFromKeyValueQuery(query),
  };

  return new Promise((resolve, reject) => {
    docClient.scan(params, function(err, data) {
        if (err) {
          console.error("Unable to query items. Error JSON:", JSON.stringify(err, null, 2));
          reject(err);
        } else {
          resolve(data.Items);
        }
    });
  });
};

// finds elements that have an array-typed property containing a value
async function queryItemsByArrayValue(tableName, arrayField, value) {
  const params = {
    TableName: tableName,
    FilterExpression: `contains (${arrayField}, :${arrayField})`,
    ExpressionAttributeValues : {
      [`:${arrayField}`] : value,
    }
  };
  return new Promise((resolve, reject) => {
    docClient.scan(params, function(err, data) {
        if (err) {
          console.error("Unable to query items. Error JSON:", JSON.stringify(err, null, 2));
          reject(err);
        } else {
          resolve(data);
        }
    });
  })
};

export default {
  describeTable,
  saveItem,
  getItemById,
  getAllItems,
  query,
  queryItemsByArrayValue
};
