const mongoose = require('mongoose');

const cardSchema = mongoose.Schema({
  // name — имя карточки, строка от 2 до 30 символов, обязательное поле;
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  // link — ссылка на картинку, строка, обязательно поле.
  link: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        // eslint-disable-next-line no-useless-escape
        return /^((http|https)\:\/\/)(www\.)?([a-zA-Z0-9\-]{0,50}\.?){1,5}\/?([a-zA-Z0-9\=\?\.\-\#\/]{0,50}){1,50}?\.?$/.test(v);
      },
    },
  },
  // owner — ссылка на модель автора карточки, тип ObjectId, обязательное поле;
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  // likes — список лайкнувших пост пользователей
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'user',
    default: [],
  },
  // createdAt — дата создания, тип Date, значение по умолчанию Date.now
  createAt: {
    type: Date,
    default: Date.now,
  },
},
{ versionKey: false });

module.exports = mongoose.model('card', cardSchema);
