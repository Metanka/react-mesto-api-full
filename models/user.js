const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => isEmail(v),
      message: 'Неправильный формат почты',
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  avatar: {
    type: String,
    required: true,
    validate: {
      validator(v) { // validator - функция проверки данных. v - значение свойства avatar
        // eslint-disable-next-line no-useless-escape
        return /^((http|https)\:\/\/)(www\.)?([a-zA-Z0-9\-]{0,50}\.?){1,5}\/?([a-zA-Z0-9\=\?\.\-\#\/]{0,50}){0,50}?\.?$/.test(v);
      },
    },
  },
},
  {versionKey: false});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({email}).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Неправильные почта или пароль'));
          }
          return user;
        });
    })
}

module.exports = mongoose.model('users', userSchema);
