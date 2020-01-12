import express from 'express';
import dotenv from 'dotenv';
dotenv.config({ path: 'app/.env' });

import CardsController from './controllers/cards-controller.js';
import DecksController from './controllers/decks-controller.js';
import UsersController from './controllers/users-controller.js';
import ToolsController from './controllers/tools-controller.js';
import SelfController from './controllers/self-controller.js';
import RecipesController from './controllers/recipes-controller.js';
import ElasticsearchClient from './client/elasticsearch-client.js';
import ElasticSearchGatheringService from './services/elasticsearch-gathering-service.js';

// We don't have a CRON to execute this yet.  We can sync dynamo with our search index by uncommenting
// and rebooting app:
// ElasticSearchGatheringService.syncElasticWithDynamoRecipeData();

const app = express();
app.use(express.json());
const port = 3000; // TODO: Used COMPOSED_API_PORT from /app/config/conf.json

ToolsController(app);
CardsController(app);
RecipesController(app);
DecksController(app);
UsersController(app);
SelfController(app);

app.listen(port, () => console.log(`Composed-API listening on port ${port}!`));
