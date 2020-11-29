const UnauthorizedError = require('../errors/unauthorized-err');
const ForbiddenError = require('../errors/forbidden-err');

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
      }
    })
    .catch((err) => next(err));
};

module.exports.deleteCard = (req, res, next) => {
  const cardOwner = req.user._id;
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(new Error('NotFound', 'CastError'))
    .then((card) => {
      if (cardOwner !== card.owner.toString()) {
        throw new ForbiddenError('Вы не можете удалять чужие карточки');
      }
      res.send({ message: 'Карточка удалена!' });
    })
    .catch((err) => next(err));
};
