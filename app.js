const express = require('express');

const PORT = 3000;
const app = express();
const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const bodyParser = require('body-parser');
const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
})
  // eslint-disable-next-line no-console
  .then(() => console.log('Mongo has started'))
  // eslint-disable-next-line no-console
  .catch((err) => console.log(err));

app.post('/signin', login);
app.post('/signup', createUser);

app.use(auth);

app.use('/cards', require('./routes/card'));
app.use('/users', require('./routes/user'));

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});

app.use('/', (req, res) => {
  res.status(404).json({ message: 'Запрашиваемый ресурс не найден' });
});
