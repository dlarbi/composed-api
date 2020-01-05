import DynamodbClient from '../client/dynamodb-client.js';

const DECKS_COLLECTION_NAME = 'decks';
class Deck {
  constructor(deck = {}) {
    Object.keys(deck).forEach((key) => {
      this[key] = deck[key];
    });
  };

  static async save(deck) {
    let result;
    if (this.name && this.label) {
      await DynamodbClient.saveItem(DECKS_COLLECTION_NAME, this);
      result = this;
    } else if (deck.name && deck.label) {
      await DynamodbClient.saveItem(DECKS_COLLECTION_NAME, deck);
      result = deck;
    } else {
      throw new Error('Cannot save invalid deck model.')
    }
    return result;
  };

  static async getById(deckId) {
    return DynamodbClient.getItemById(DECKS_COLLECTION_NAME, deckId);
  };

  static async getAll() {
    const decks = await DynamodbClient.getAllItems(DECKS_COLLECTION_NAME);
    return decks;
  };

  static async find(query) {
    const decks = await DynamodbClient.query(DECKS_COLLECTION_NAME, query);
    return decks;
  };
}

export default Deck;
