/**
* This class gets data from our dynamodb and syncs it with elasticsearch to support good search capabilities
*/

import DynamodbClient from '../client/dynamodb-client.js';
import ElasticsearchClient from '../client/elasticsearch-client.js';
import RecipesService from '../services/recipes-service.js';
import { RECIPES_ES_INDEX_NAME, TOOLS_ES_INDEX_NAME } from '../constants/constants.js';

class ElasticSearchGatheringService {
  static async gatherRecipesFromDynamodb() {
    const recipes = await RecipesService.getAllRecipes();
    return recipes.Items || [];
  }

  static async syncElasticWithDynamoRecipeData() {
    await ElasticsearchClient.deleteIndex(RECIPES_ES_INDEX_NAME);
    await ElasticsearchClient.createIndex(RECIPES_ES_INDEX_NAME);
    const dynamodbRecipes = await ElasticSearchGatheringService.gatherRecipesFromDynamodb();
    dynamodbRecipes.map(recipe =>
      ElasticsearchClient.saveRecord(RECIPES_ES_INDEX_NAME, recipe)
    );
  }

  static async syncElasticWithDynamoToolsData() {
    await ElasticsearchClient.deleteIndex(RECIPES_ES_INDEX_NAME);
    await ElasticsearchClient.createIndex(RECIPES_ES_INDEX_NAME);
    const dynamodbRecipes = await ElasticSearchGatheringService.gatherRecipesFromDynamodb();
    dynamodbRecipes.map(recipe =>
      ElasticsearchClient.saveRecord(RECIPES_ES_INDEX_NAME, recipe)
    );
  }
}

export default ElasticSearchGatheringService;
