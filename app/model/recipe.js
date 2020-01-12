import DynamodbClient from '../client/dynamodb-client.js';
import ElasticsearchClient from './../client/elasticsearch-client.js';
import {
  RECIPES_COLLECTION_NAME,
  RECIPES_ES_INDEX_NAME
} from './../constants/constants.js';

class Recipe {
  constructor(recipe = {}) {
    Object.keys(recipe).forEach((key) => {
      this[key] = recipe[key];
    });
  };

  static async save(recipe) {
    let result;
    if (this.title && this.directions) {
      await DynamodbClient.saveItem(RECIPES_COLLECTION_NAME, this);
      result = this;
    } else if (recipe.title && recipe.directions) {
      await DynamodbClient.saveItem(RECIPES_COLLECTION_NAME, recipe);
      result = recipe;
    } else {
      throw new Error('Cannot save invalid recipe model.')
    }
    return result;
  };

  static async getById(recipeId) {
    return DynamodbClient.getItemById(RECIPES_COLLECTION_NAME, recipeId);
  };

  static async getAll() {
    const recipes = await DynamodbClient.getAllItems(RECIPES_COLLECTION_NAME);
    return recipes;
  };

  static async find(query) {
    const recipes = await DynamodbClient.query(RECIPES_COLLECTION_NAME, query);
    return recipes;
  };

  // Goes to elasticsearch for bettery query capability
  static async search(query) {
    return ElasticsearchClient.search(RECIPES_ES_INDEX_NAME, {
      match: query
    });
  }

  // Goes to elasticsearch, queries multiple fields at once
  // example query structure: { query: "example search", fields: ["title", "description"]}
  static async searchMultipleFields(query) {
    return ElasticsearchClient.search(RECIPES_ES_INDEX_NAME, {
      multi_match: query
    });
  }
}

export default Recipe;
