const Card = require('../models/card');

const getCards = (req, res) => Card.find({})
  .populate('user')
  .then((cards) => res.status(200).send(cards))
  .catch((err) => res.status(err.message ? 400 : 500)
    .send({ message: err.message || 'На сервере произошла ошибка' }));

const deleteCard = (req, res) => Card.findByIdAndRemove(req.params.cardId)
  .then((card) => {
    if (card == null) {
      res.status(404).send({ message: 'Такой карточки не существует' });
      return;
    }
    res.status(200).send(card);
  })
  .catch((err) => res.status(err.message ? 400 : 500)
    .send({ message: err.message || 'На сервере произошла ошибка' }));

const createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => res.status(err.message ? 400 : 500)
      .send({ message: err.message || 'На сервере произошла ошибка' }));
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.params.cardId } }, // добавить _id в массив, если его там нет
    { new: true },
  ).then((card) => res.status(201).send(card))
    .catch((err) => res.status(err.message ? 400 : 500)
      .send({ message: err.message || 'На сервере произошла ошибка' }));
};

const dislikeCard = (req, res) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } }, // убрать _id из массива
  { new: true },
).then((card) => res.status(201).send(card))
  .catch((err) => res.status(err.message ? 400 : 500)
    .send({ message: err.message || 'На сервере произошла ошибка' }));

module.exports = {
  getCards, deleteCard, createCard, likeCard, dislikeCard,
};
