require('dotenv').config();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const NotFoundError = require('../errors/notFound');

const {NODE_ENV, JWT_SECRET} = process.env;

const getUsers = (req, res) => User.find({})
  .then((users) => res.status(200).send(users))
  .catch(() => res.status(500).send({message: 'Ошибка считывания файла'}));

const getUser = (req, res) => User.findById(req.params.userId)
  .then((user) => {
    if (user == null) {
      throw new NotFoundError('Нет пользователя с таким id');
    }
    res.status(200).send(user);
  })
  .catch((err) => res.status(err.message ? 400 : 500)
    .send({message: err.message || 'На сервере произошла ошибка'}));

const createUser = (req, res) => {

  const {name, about, avatar, email} = req.body;
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      User.create({name, about, avatar, email, password: hash})
        .then((user) => {
          res.status(201).send({
            _id: user._id,
            email: user.email,
            name: user.name,
            about: user.about,
            avatar: user.avatar,
          });
        })
        .catch((err) => res.status(err.message ? 400 : 500)
          .send({message: err.message || 'На сервере произошла ошибка'}));
    })
    .catch((err) => res.status(err.message ? 400 : 500)
      .send({message: err.message || 'На сервере произошла ошибка'}));
}

const login = (req, res) => {
  const {email, password} = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        {_id: user._id},
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        {expiresIn: '7d'}
      );
      res.send({token})
    })
    .catch((err) => {
      res.status(401).send({message: err.message});
    });
}

const updateUser = (req, res) => {
  const {name, about} = req.body;

  User.findByIdAndUpdate(req.user._id, {name, about}, {new: true, runValidators: true})
    .then((user) => {
      if (user) {
        res.status(200).send(user);
      }
      res.status(404).send({message: 'Такого пользователя не существует'});
    })
    .catch((err) => res.status(err.message ? 400 : 500)
      .send({message: err.message || 'На сервере произошла ошибка'}));
};

const updateAvatar = (req, res) => {
  const {avatar} = req.body;

  User.findByIdAndUpdate(req.user._id, {avatar}, {new: true, runValidators: true})
    .then((user) => {
      if (user) {
        res.status(200).send(user);
      }
      res.status(404).send({message: 'Такого пользователя не существует'});
    })
    .catch((err) => res.status(err.message ? 400 : 500)
      .send({message: err.message || 'На сервере произошла ошибка'}));
};

module.exports = {
  getUsers, getUser, createUser, updateUser, updateAvatar, login
};
