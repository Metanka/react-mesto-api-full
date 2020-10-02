const routerCards = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getCards, deleteCard, createCard, likeCard, dislikeCard,
} = require('../controllers/cards');

routerCards.get('/', getCards);

routerCards.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(), 
    link: Joi.string().uri().required()
  })
}), createCard);

routerCards.delete('/:cardId', deleteCard);

routerCards.put('/:cardId/likes', likeCard);

routerCards.delete('/:cardId/likes', dislikeCard);

module.exports = routerCards;
