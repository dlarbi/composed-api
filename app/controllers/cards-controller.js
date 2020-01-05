import CardsService from './../services/cards-service.js';
import middleware from './../middleware/middleware.js';
const CardsController = function(app) {
  /*
  * Find one card by id
  */
  app.get('/cards/:cardId', middleware.checkToken, async (req, res) => {
    try {
      const result = await CardsService.getCardById(req.params.cardId);
      res.send(result);
    } catch (err) {
      res.send({
        error: err,
        status: 400
      });
    }
  });

  /*
  * Query for cards
  */
  app.get('/cards', async (req, res) => {
    try {
      let result;
      if (req.query.deckName) {
        result = await CardsService.findCardsByDeckName(req.query.deckName);
      } else if (Object.keys(req.query).length) {
        result = await CardsService.findCards(req.query);
      } else {
        result = await CardsService.getAllCards();
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
  * Create or update card
  */
  app.post('/cards', async (req, res) => {
    const card = req.body.card;
    try {
      const result = await CardsService.saveCard(card);
      res.send(result);
    } catch (err) {
      res.send({
        error: String(err),
        status: 400
      });
    }
  });
}

export default CardsController;
