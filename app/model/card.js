import DynamodbClient from '../client/dynamodb-client.js';

const CARDS_COLLECTION_NAME = 'cards';
class Card {
  constructor(card = {}) {
    Object.keys(card).forEach((key) => {
      this[key] = card[key];
    });
  };

  async save(card) {
    let result;
    if (this.text && this.decks && this.decks.length) {
      await DynamodbClient.saveItem(CARDS_COLLECTION_NAME, this);
      result = this;
    } else if (card.text && card.decks && card.decks.length) {
      await DynamodbClient.saveItem(CARDS_COLLECTION_NAME, card);
      result = card;
    } else {
      throw new Error('Cannot save invalid card model.')
    }
    return result;
  };

  static async getById(cardId) {
    return DynamodbClient.getItemById(CARDS_COLLECTION_NAME, cardId);
  };

  static async getAll() {
    const cards = await DynamodbClient.getAllItems(CARDS_COLLECTION_NAME);
    return cards;
  };

  static async find(query) {
    const cards = await DynamodbClient.query(CARDS_COLLECTION_NAME, query);
    return cards;
  };

  static async findByDeckName(deckName) {
    const cards = await DynamodbClient.queryItemsByArrayValue(CARDS_COLLECTION_NAME, 'decks', deckName);
    return cards;
  };
}

export default Card;
