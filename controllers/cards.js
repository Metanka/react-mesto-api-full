const Card = require('../models/card');
const BadRequestError = require('../errors/badRequest');
const NotFoundError = require('../errors/notFound');
const ForbiddenError = require('../errors/forbidden');

const getCards = (req, res, next) => Card.find({})
  .populate('user')
  .then((cards) => res.status(200).send(cards))
  .catch(next);

const deleteCard = (req, res, next) => {
  Card.findById(req.params._id)
    .then((card) => {
      if (card.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Недостаточно прав');
      }
      Card.findByIdAndRemove(req.params.cardId)
        .then((item) => {
          if (item == null) {
            throw new NotFoundError('Такой карточки не существует');
          }
          res.status(200).send(item);
        });
    })
    .catch(next);
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Указаны некорректные данные при создании карточки');
      }
    })
    .catch(next);
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.params.cardId } }, // добавить _id в массив, если его там нет
    { new: true },
  ).then((card) => res.status(201).send(card))
    .catch((err) => {
      if (err.name === 'NotValidId') {
        throw new NotFoundError('Нет карточки с таким id');
      }
    })
    .catch(next);
};

const dislikeCard = (req, res, next) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } }, // убрать _id из массива
  { new: true },
).then((card) => res.status(201).send(card))
  .catch((err) => {
    if (err.name === 'NotValidId') {
      throw new NotFoundError('Нет карточки с таким id');
    }
  })
  .catch(next);

module.exports = {
  getCards, deleteCard, createCard, likeCard, dislikeCard,
};
