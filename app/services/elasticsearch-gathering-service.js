/**
* This class gets data from our dynamodb and syncs it with elasticsearch to support good search capabilities
*/

import DynamodbClient from '../client/dynamodb-client.js';
import ElasticsearchClient from '../client/elasticsearch-client.js';
import RecipesService from '../services/recipes-service.js';

const RECIPE_INDEX_NAME = 'recipes';

class ElasticSearchGatheringService {
  static async gatherRecipesFromDynamodb() {
    const recipes = await RecipesService.getAllRecipes();
    return recipes.Items || [];
  }

  static async syncElasticWithDynamoRecipeData() {
    await ElasticsearchClient.deleteIndex(RECIPE_INDEX_NAME);
    await ElasticsearchClient.createIndex(RECIPE_INDEX_NAME);
    const dynamodbRecipes = await ElasticSearchGatheringService.gatherRecipesFromDynamodb();
    dynamodbRecipes.map(recipe =>
      ElasticsearchClient.saveRecord(RECIPE_INDEX_NAME, recipe)
    );
  }
}

export default ElasticSearchGatheringService;
