import Card from './../model/card.js';
import DecksService from './decks-service.js';

async function saveCard(card) {
  // If only saving to one deck, make sure the deck exists first.
  if (card.decks.length === 1) {
    const cardsDeck = await DecksService.findDecks({ name: card.decks[0] });
    if (!cardsDeck.length) {
      throw new Error('No deck exists for this card.');
    }
  }

  const existingCard = await findCards({ text: card.text });
  if (existingCard.length) {
    throw new Error('A card already exists with this text.  Edit the existing card to add it to a new deck.');
  }

  const cardToSave = new Card(card);
  return cardToSave.save();
};

async function getCardById(cardId) {
  return Card.getById(cardId);
};

async function getAllCards() {
  return Card.getAll();
};

async function findCardsByDeckName(deckName) {
  return Card.findByDeckName(deckName);
}

async function findCards(query) {
  return Card.find(query);
};

export default {
  saveCard,
  getCardById,
  getAllCards,
  findCards,
  findCardsByDeckName
};
