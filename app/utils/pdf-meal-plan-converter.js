import pdf2html from 'pdf2html';
/**
* Given a PDF meal plan book in a particular format, this util will create Recipe models for the
* composed-api and link them together into a meal plan, with other information about daily meals and nutrition
* TODO: Extend to support other import formats
*/
import PDFRecipeConverter from './pdf-recipe-converter.js';

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

function getMealPlanPagesFromPDFHTML(html) {
  html = cleanPDFHtml(html);
  const dailyPlanHtmlPage = null;
  const dailyNutritionHtmlPage = null;
  const groceryListHtmlPage = null;
}

async function pdfToMealPlanModel(pdfPath) {
  console.log('pdfToMea')
  return new Promise((resolve, reject) => {
    // const recipes = PDFRecipeConverter.pdfToRecipeModels(pdfPath);

    // TODO: By using pdf2html.pages('sample.pdf', (err, htmlPages) => { we can have pages automatically separate
    pdf2html.pages(pdfPath, async (err, html) => {
      if (err) {
        console.log(err)
        reject(err);
      } else {
        console.log(html)
        // const htmlNoLineBreaks = html.replace(/\n|\r/g, "");
        // const htmlMealPlanPages = getMealPlanPagesFromPDFHTML(htmlNoLineBreaks);

        // resolve(recipes);
      }
    });
  })
};

export default {
  pdfToMealPlanModel
};
