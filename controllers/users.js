const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .orFail(new Error('NotFound', 'CastError'))
    .then((users) => {
      res.status(200).json({ data: users });
    })
    .catch((err) => {
      if (err.message === 'CastError') {
        res.status(400).send({ message: 'Переданы некорректные данные' });
      } else if (err.message === 'NotFound') {
        res.status(404).send({ message: 'Объект не найден' });
      } else {
        res.status(500).send({ message: 'Ошибка сервера' });
      }
    });
};

module.exports.getUserId = (req, res) => {
  User.findById(req.params.userId)
    .orFail(new Error('NotFound', 'CastError'))
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Невалидный id' });
      } else if (err.message === 'NotFound') {
        res.status(404).send({ message: 'id не найден' });
      } else {
        res.status(500).send({ message: 'Ошибка сервера' });
      }
    });
};
// eslint-disable-next-line consistent-return
module.exports.createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  const userpassword = password.replace(/\s/g, '');

  if (userpassword.length < 6) {
    return res.status(400).send({ message: 'Пароль меньше 6 символов' });
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
        res.status(400).send({ message: `Переданы некорректные данные ${err}` });
      } else if (err.name === 'MongoError' && err.code === 11000) {
        res.status(409).send({ message: 'Пользователь уже зарегистрирован' });
      } else {
        res.status(500).send({ message: 'Ошибка при создании user' });
      }
    });
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    // eslint-disable-next-line consistent-return
    .then((user) => {
      if (!user) {
        return res.status(401).send({ message: 'Неправильные почта или пароль 1' });
      }
      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        res.status(401).send({ message: 'Неправильные пароль или почта' });
      }
      const token = jwt.sign({
        _id: User._id,
      }, 'secret-key', { expiresIn: '7d' });
      return res.status(201).send({ token });
    })
    .catch((err) => {
      res.status(401).send({ message: `Что-то пошло не так ${err}` });
    });
};
