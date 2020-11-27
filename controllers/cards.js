const {
  BadRequestError, UnauthorizedError,
  ForbiddenError, NotFoundError,
 } = require('../errors/err');

const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send({ data: cards }))
    .catch(() => res.status(500).json({ message: 'Ошибка при чтении файла' }));
};

module.exports.createCard = (req, res, next) => {
  const { name, link, owner } = req.body;
  Card.create({ name, link, owner })
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new UnauthorizedError('Переданы некорректные данные')
        // res.status(401).send({ message: 'Переданы некорректные данные' });
      } else {
        res.status(500).send({ message: 'Ошибка при создании карточки' });
      }
    })
    .catch(err => next(err))
};

module.exports.deleteCard = (req, res, next) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(new Error('NotFound', 'CastError'))
    .then((card) => {
      if (req.user._id !== card.owner._id.toString()) {
        throw new ForbiddenError('Вы не можете удалять чужие карточки')
        // res.status(403).send({ message: 'Вы не можете удалять чужие карточки' });
      }
      res.status(200).send({ message: 'Карточка удалена!' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные')
        // res.status(400).send({ message: 'Переданы некорректные данные' });
      } else if (err.message === 'NotFound') {
        throw new NotFoundError('Объект не найден')
        // res.status(404).send({ message: 'Объект не найден' });
      } else {
        res.status(500).send({ message: 'Ошибка сервера' });
      }
    })
    .catch(err => next(err))
};
