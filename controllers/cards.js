const BadRequestError = require('../errors/bad-request-err');
const UnauthorizedError = require('../errors/unauthorized-err');
const ForbiddenError = require('../errors/forbidden-err');
const NotFoundError = require('../errors/not-found-err');

const Card = require('../models/card');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((err) => next(err));
};

module.exports.createCard = (req, res, next) => {
  const { name, link, owner } = req.body;
  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new UnauthorizedError('Переданы некорректные данные');
        // res.status(401).send({ message: 'Переданы некорректные данные' });
      }
    })
    .catch((err) => next(err));
};

module.exports.deleteCard = (req, res, next) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(new Error('NotFound', 'CastError'))
    .then((card) => {
      if (req.user._id !== card.owner._id.toString()) {
        throw new ForbiddenError('Вы не можете удалять чужие карточки');
        // res.status(403).send({ message: 'Вы не можете удалять чужие карточки' });
      }
      res.send({ message: 'Карточка удалена!' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные');
        // res.status(400).send({ message: 'Переданы некорректные данные' });
      }
      if (err.message === 'NotFound') {
        throw new NotFoundError('Объект не найден');
        // res.status(404).send({ message: 'Объект не найден' });
      }
    })
    .catch((err) => next(err));
};
