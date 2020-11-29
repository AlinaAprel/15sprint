const { Joi, celebrate } = require('celebrate');
const routerCards = require('express').Router();
const { getCards, createCard, deleteCard } = require('../controllers/cards');

routerCards.get('/', getCards);

routerCards.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string(),
    owner: Joi.string(),
  }),
}), createCard);
routerCards.delete('/:cardId', celebrate({
  body: Joi.object().keys({
    id: Joi.string().hex(),
  }),
}), deleteCard);

module.exports = routerCards;
