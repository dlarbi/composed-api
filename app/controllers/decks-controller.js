import DecksService from './../services/decks-service.js';
const DecksController = function(app) {
  /*
  * Find one deck by id
  */
  app.get('/decks/:deckId', async (req, res) => {
    try {
      const result = await DecksService.getDeckById(req.params.deckId);
      res.send(result);
    } catch (err) {
      res.send({
        error: String(err),
        status: 400
      });
    }
  });

  /*
  * Query for decks
  */
  app.get('/decks', async (req, res) => {
    try {
      let result;
      if (Object.keys(req.query).length) {
        result = await DecksService.findDecks(req.query);
      } else {
        result = await DecksService.getAllDecks();
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
  * Create or update deck
  */
  app.post('/decks', async (req, res) => {
    const deck = req.body.deck;
    try {
      const result = await DecksService.saveDeck(deck);
      res.send(result);
    } catch (err) {
      res.send({
        error: String(err),
        status: 400
      });
    }
  });
}

export default DecksController;
