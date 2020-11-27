const { Joi, celebrate } = require('celebrate');
const routerCards = require('express').Router();
const { getCards, createCard, deleteCard } = require('../controllers/cards');

routerCards.get('/', getCards);
routerCards.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/),
  }),
}), createCard);
routerCards.delete('/:cardId', celebrate({
  body: Joi.object().keys({
    id: Joi.string().hex(),
  }),
}), deleteCard);

module.exports = routerCards;
