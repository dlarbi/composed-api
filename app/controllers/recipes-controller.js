import RecipesService from './../services/recipes-service.js';
import converter from '../utils/pdf-recipe-converter.js';

const RecipesController = function(app) {
  /*
  * Find one recipe by id
  */
  app.get('/recipes/:recipeId', async (req, res) => {
    try {
      const result = await RecipesService.getRecipeById(req.params.recipeId);
      res.send(result);
    } catch (err) {
      res.send({
        error: String(err),
        status: 400
      });
    }
  });

  /*
  * Query for recipes
  */
  app.get('/recipes', async (req, res) => {
    try {
      let result;
      if (Object.keys(req.query).length) {
        result = await RecipesService.findRecipes(req.query);
      } else {
        result = await RecipesService.getAllRecipes();
      }
      res.send(result);
    } catch (err) {
      res.send({
        error: String(err),
        status: 400
      });
    }
  });

  /*
  * Search Elasticsearch for recipes
  */
  app.post('/recipes/search', async (req, res) => {
    try {
      let result = {};
      if (Object.keys(req.body).length) {
        result = await RecipesService.search(req.body);
      }
      res.send(result);
    } catch (err) {
      res.send({
        error: String(err),
        status: 400
      });
    }
  });

  /*
  * Create or update recipe
  */
  app.post('/recipes', async (req, res) => {
    const recipe = req.body.recipe;
    try {
      const result = await RecipesService.saveRecipe(recipe);
      res.send(result);
    } catch (err) {
      res.send({
        error: String(err),
        status: 400
      });
    }
  });

  app.post('/recipes/import-pdf', async (req, res) => {
    const recipe = req.body.recipe;
    try {
      var pdfPath = 'app/tmp/recipe-pdfs/glow-luteal.pdf';
      const result = await RecipesService.importRecipesFromPDF(pdfPath);
      res.send(result);
    } catch (err) {
      res.send({
        error: String(err),
        status: 400
      });
    }
  });
}

export default RecipesController;
