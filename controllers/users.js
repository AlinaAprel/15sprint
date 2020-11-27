const {
  BadRequestError, UnauthorizedError,
  ForbiddenError, ConflictError,
  NotFoundError,
 } = require('../errors/err');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .orFail(new Error('NotFound', 'CastError'))
    .then((users) => {
      res.status(200).json({ data: users });
    })
    .catch((err) => {
      if (err.message === 'CastError') {
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

module.exports.getUserId = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(new Error('NotFound', 'CastError'))
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Невалидный id')
        // res.status(400).send({ message: 'Невалидный id' });
      } else if (err.message === 'NotFound') {
        throw new NotFoundError('id не найден')
        // res.status(404).send({ message: 'id не найден' });
      } else {
        res.status(500).send({ message: 'Ошибка сервера' });
      }
    })
    .catch(err => next(err))
};
// eslint-disable-next-line consistent-return
module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  const userpassword = password.replace(/\s/g, '');

  if (userpassword.length < 6) {
    throw new BadRequestError('Пароль меньше 6 символов')
    // return res.status(400).send({ message: 'Пароль меньше 6 символов' });
  }

  bcrypt.hash(password, 10)
    // eslint-disable-next-line arrow-body-style
    .then((hash) => {
      return User.create({
        name, about, avatar, email, password: hash,
      });
    })
    .then(() => {
      res.status(200).send({
        data: {
          name, about, avatar, email,
        },
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные')
        // res.status(400).send({ message: `Переданы некорректные данные ${err}` });
      } else if (err.name === 'MongoError' && err.code === 11000) {
        throw new ConflictError('Пользователь уже зарегистрирован')
        // res.status(409).send({ message: 'Пользователь уже зарегистрирован' });
      } else {
        res.status(500).send({ message: 'Ошибка при создании user' });
      }
    })
    .catch(err => next(err))
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    // eslint-disable-next-line consistent-return
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неправильные почта или пароль')
        // return res.status(401).send({ message: 'Неправильные почта или пароль 1' });
      }
      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        throw new UnauthorizedError('Неправильные пароль или почта')
        // res.status(401).send({ message: 'Неправильные пароль или почта' });
      }
      const token = jwt.sign({
        _id: User._id,
      }, 'secret-key', { expiresIn: '7d' });
      return res.status(201).send({ token });
    })
    .catch((err) => {
      throw new UnauthorizedError('Что-то пошло не так')
      // res.status(401).send({ message: `Что-то пошло не так ${err}` });
    })
    .catch(err => next(err))
};
