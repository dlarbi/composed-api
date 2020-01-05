import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from './../middleware/config.js';
import DynamodbClient from '../client/dynamodb-client.js';

const TOOLS_COLLECTION_NAME = 'tools';

class Tool {
  constructor(tool = {}) {
    Object.keys(tool).forEach((key) => {
      this[key] = tool[key];
    });
  };

  static async save(tool) {
    let result;
    if (this.name && this.content) {
      await DynamodbClient.saveItem(TOOLS_COLLECTION_NAME, this);
      result = this;
    } else if (tool.name && tool.content) {
      await DynamodbClient.saveItem(TOOLS_COLLECTION_NAME, tool);
      result = tool;
    } else {
      throw new Error('Cannot save invalid tool model.')
    }
    return result;
  };

  static async getById(toolId) {
    return DynamodbClient.getItemById(TOOLS_COLLECTION_NAME, toolId);
  };

  static async getAll() {
    const tools = await DynamodbClient.getAllItems(TOOLS_COLLECTION_NAME);
    return tools;
  };

  static async find(query) {
    const tools = await DynamodbClient.query(TOOLS_COLLECTION_NAME, query);
    return tools;
  };
}

export default Tool;
