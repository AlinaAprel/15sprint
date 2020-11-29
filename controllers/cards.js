const UnauthorizedError = require('../errors/unauthorized-err');
const ForbiddenError = require('../errors/forbidden-err');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');

const Card = require('../models/card');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((err) => next(err));
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new UnauthorizedError(`Переданы некорректные данные ${err}`);
        // res.status(401).send({ message: 'Переданы некорректные данные' });
      }
    })
    .catch((err) => next(err));
};

module.exports.deleteCard = (req, res, next) => {
  const cardOwner = req.user._id;
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(new Error('NotFound'))
    .then((card) => {
      if (cardOwner !== card.owner.toString()) {
        throw new ForbiddenError('Вы не можете удалять чужие карточки');
        // res.status(403).send({ message: 'Вы не можете удалять чужие карточки' });
      }
      res.send({ message: 'Карточка удалена!' });
    })
    .catch((err) => {
      if (err.message === 'NotFound') {
        throw new NotFoundError('Такой карточки нет');
      }
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные');
      }
    })
    .catch((err) => next(err));
};
