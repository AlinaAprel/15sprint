const routerUser = require('express').Router();
const { getUsers, getUserId } = require('../controllers/users');

routerUser.get('/', getUsers);
routerUser.get('/:userId', getUserId);

module.exports = routerUser;
