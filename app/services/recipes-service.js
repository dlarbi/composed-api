import Recipe from './../model/recipe.js';
import PDFRecipeConverter from './../utils/pdf-recipe-converter.js';

async function saveRecipe(recipe) {
  const existingRecipe = await findRecipes({ title: recipe.title });
  if (existingRecipe.length) { // TODO: Check for duplicates in the model using a schema definition
    throw new Error('A recipe with this name already exists.');
  }
  return Recipe.save(recipe);
};

async function getRecipeById(recipeId) {
  return Recipe.getById(recipeId);
};

async function getAllRecipes() {
  return Recipe.getAll();
};

async function findRecipes(query) {
  return Recipe.find(query);
};

async function importRecipesFromPDF(pdfPath, pdfFile) {
  const models = await PDFRecipeConverter.pdfToRecipeModels(pdfPath);
  const promises = models.map(model => saveRecipe(model))
  return Promise.all(promises);
}

async function search(query) {
  if (query.fields && query.query) {
    return Recipe.searchMultipleFields(query);
  } else {
    return Recipe.search(query);
  }
}

export default {
  saveRecipe,
  getRecipeById,
  getAllRecipes,
  findRecipes,
  importRecipesFromPDF,
  search
};
