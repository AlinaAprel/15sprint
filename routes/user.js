const { celebrate, Joi } = require('celebrate');
const routerUser = require('express').Router();
const { getUsers, getUserId } = require('../controllers/users');

routerUser.get('/', getUsers);
routerUser.get('/:userId', celebrate({
  body: Joi.object().keys({
    id: Joi.string().hex(),
  }),
}), getUserId);

module.exports = routerUser;
