import pdf2html from 'pdf2html';
import PNGCrop from 'png-crop';
import fs from 'fs';
import uuid from 'uuid';
import S3Client from '../client/s3-client.js';
import Utils from './utils.js';

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

function cleanPDFHtml(html) {
  // We don't need page breaks, empty els, etc.
  let result = html.replaceAll('<p/>', '');
  result = result.replaceAll('<div></div>', '');
  result = result.replaceAll('<p></p>', '');

  // We only want the body
  result = result.substring(
    result.indexOf('<body>') + '<body>'.length,
    result.indexOf('</body>')
  );

  return result;
}

function getHTMLPagesFromPDFHTML(html) {
  html = cleanPDFHtml(html);

  const htmlPages = [];
  let startIdxs = Utils.getAllIndexes(html, '<div class="page">'); // marks beginning of a page in the PDF
  const endIdxs = Utils.getAllIndexes(html, '<p>Krista King'); // marks end of a page

  // Dirty checking that fixes a bug where uploads break if there is a title page which doesnt start and end in our defined
  // start/end indexes
  const isPDFHaveTitlePage = startIdxs.length - endIdxs.length === 1;
  if (isPDFHaveTitlePage) {
    startIdxs = startIdxs.slice(1);
  }

  startIdxs.forEach((idx, i) => {
    const htmlPage = html.substring(idx + '<div class="page">'.length, endIdxs[i]);
    htmlPages.push(htmlPage);
  });
  return htmlPages;
}

function getTitleRecipeHTML(html) {
  const titlePrefixString = '<p>';
  const startIdx = html.indexOf(titlePrefixString);

  const endIdx = html.search(/\d/); // title ends with a number, which indicates end of title.  This searches for that number
  return html.substring(startIdx + titlePrefixString.length, endIdx);
}

function getRecipeStatsHTML(html) {
  const startIdx = html.search(/\d/); // finds first index of a number, which will say e.g "8 ingredients"
  const endIdx = html.indexOf('</p>');
  return html.substring(startIdx, endIdx);
}

function getDirectionsRecipeHTML(html) {
  const startIdx = html.indexOf('<p>Directions');
  const endIdx = html.indexOf('Notes</p>');
  return html.substring(startIdx, endIdx);
}

function getNotesRecipeHTML(html) {
  const startIdx = html.indexOf('<p>Notes');
  const endIdx = html.indexOf('Ingredients</p>');
  return html.substring(startIdx, endIdx);
}

function getIngredientsRecipeHTML(html) {
  const startIdx = html.indexOf('<p>Ingredients');
  return html.substring(startIdx, html.length-1);
}

function buildRecipeTitlesFromHtmlRecipePages(htmlRecipePages) {
  return htmlRecipePages.map(html => getTitleRecipeHTML(html).trim());
}

function buildRecipeStatsFromHTMLRecipePages(htmlRecipePages) {
  const stats = htmlRecipePages.map(html => getRecipeStatsHTML(html).split('&middot;').map(stat => stat.trim()));
  return stats.map(stat => ({
    ingredients: stat[0],
    time: stat[1],
    servings: stat[2]
  }));
}

function buildDirectionsArraysFromHtmlRecipePages(htmlRecipePages) {
  const directionsHtml = htmlRecipePages.map(html => getDirectionsRecipeHTML(html));
  return directionsHtml.map(html => {
    return html.replaceAll('<p>', '').split('</p>')
      .filter(function (el) {
        return el !== '';
      }).slice(1);
  });
}

function buildNotesArraysFromHtmlRecipePages(htmlRecipePages) {
  const notesHtml = htmlRecipePages.map(html => getNotesRecipeHTML(html));
  return notesHtml.map(html => {
    return html.replaceAll('<p>', '').split('</p>')
      .filter(function (el) {
        return el !== '';
      }).slice(1);
  });
}

function buildIngredientsArraysFromHtmlRecipePages(htmlRecipePages) {
  const ingredientsHtml = htmlRecipePages.map(html => getIngredientsRecipeHTML(html));
  return ingredientsHtml.map(html => {
    return html.replaceAll('<p>', '').split('</p>')
      .filter(function (el) {
        return el !== '';
      }).slice(1);
  });
}

function recombineRecipeSections(titles, stats, directions, notes, ingredients, s3ImagePaths) {
  const directionsLength = directions.length;
  if (notes.length !== directionsLength || ingredients.length !== directionsLength || stats.length !== directionsLength) {
    throw new Error('Can not build recipes because there are different number of each section');
  }
  return directions.map((directionsArray, i) => {
    return {
      title: titles[i],
      stats: stats[i],
      directions: directionsArray,
      notes: notes[i],
      ingredients: ingredients[i],
      image: s3ImagePaths[i]
    }
  }).filter(recipe => {
    // Removes potentially bad/sparse data from our array of recipes.
    return recipe.directions.length && recipe.ingredients.length;
  });
}

async function buildRecipeImageFromPDFPage(pdfPath, pageNumber) {
  return new Promise((resolve, reject) => {
    const options = { page: pageNumber, imageType: 'png', width: 160, height: 226 };
    pdf2html.thumbnail(pdfPath, options, (err, thumbnailPath) => {
      if (err) {
        console.error('Conversion error: ' + err);
        reject(err);
      } else {
        var config = {width: 700, height: 300, top: 135, left: 100};
        // pass a path, a buffer or a stream as the input
        const croppedImageId = uuid.v4();
        const recipeImagePath = `app/tmp/images/recipe-${croppedImageId}.png`;
        PNGCrop.crop(thumbnailPath, recipeImagePath, config, function(err) {
          if (err) {
            reject(err);
          }
          resolve(recipeImagePath);
        });
      }
    });
  });
}

async function buildS3UrlsForRecipeImagesFromHTMLRecipePages(htmlRecipePages, pdfPath) {
  const recipeImageLocalPaths = [];
  for (let i=1;i<=htmlRecipePages.length;i++) {
    const recipeImageLocalPath = await buildRecipeImageFromPDFPage(pdfPath, i);
    const s3Url = await S3Client.uploadFile(recipeImageLocalPath);
    recipeImageLocalPaths.push(s3Url);
    fs.unlinkSync(recipeImageLocalPath);
  }
  return recipeImageLocalPaths;
}

async function pdfToRecipeModels(pdfPath) {
  return new Promise((resolve, reject) => {
    // TODO: By using pdf2html.pages('sample.pdf', (err, htmlPages) => { we can have pages automatically separate
    pdf2html.html(pdfPath, async (err, html) => {
      if (err) {
        reject(err);
      } else {
        const htmlNoLineBreaks = html.replace(/\n|\r/g, "");
        const htmlRecipePages = getHTMLPagesFromPDFHTML(htmlNoLineBreaks);

        // TODO: Not the best that we build separately and recombine these entities.
        // think about refactor one day
        const titles = buildRecipeTitlesFromHtmlRecipePages(htmlRecipePages);
        const stats = buildRecipeStatsFromHTMLRecipePages(htmlRecipePages);
        const directions = buildDirectionsArraysFromHtmlRecipePages(htmlRecipePages);
        const notes = buildNotesArraysFromHtmlRecipePages(htmlRecipePages);
        const ingredients = buildIngredientsArraysFromHtmlRecipePages(htmlRecipePages);
        const s3ImagePaths = await buildS3UrlsForRecipeImagesFromHTMLRecipePages(htmlRecipePages, pdfPath);

        const recipes = recombineRecipeSections(titles, stats, directions, notes, ingredients, s3ImagePaths);
        resolve(recipes);
      }
    });
  })
};

export default {
  pdfToRecipeModels
};
