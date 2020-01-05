import Deck from './../model/deck.js';

async function saveDeck(deck) {
  const existingDeck = await findDecks({ name: deck.name });
  if (existingDeck.length) { // TODO: Check for duplicates in the model using a schema definition
    throw new Error('A deck with this name already exists.');
  }
  return Deck.save(deck);
};

async function getDeckById(deckId) {
  return Deck.getById(deckId);
};

async function getAllDecks() {
  return Deck.getAll();
};

async function findDecks(query) {
  return Deck.find(query);
};

export default {
  saveDeck,
  getDeckById,
  getAllDecks,
  findDecks
};
