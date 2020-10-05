const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const bodyParser = require('body-parser');
const auth = require('./middlewares/auth');
const {createUser, login} = require('./controllers/users');
const NotFoundError = require('./errors/notFound');
const {celebrate, Joi, errors} = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger'); 

// eslint-disable-next-line no-undef
const {PORT = 3000} = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(requestLogger); 

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сейчас сервер упадет');
  }, 0);
});

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
    avatar: Joi.string().required().uri(),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8)
  })
}), createUser);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8)
  })
})
, login);

app.use(auth);

app.use('/users/', require('./routes/users'));
app.use('/cards/', require('./routes/cards'));

// eslint-disable-next-line no-unused-vars
app.use('*', (req, res) => {
  throw new NotFoundError('Запрашиваемый ресурс не найден');
});

app.use(errorLogger); 

app.use(errors());

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const {statusCode = 500, message} = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500 ? 'На сервере произошла ошибка' : message
    });
});

app.listen(PORT, () => {
});
