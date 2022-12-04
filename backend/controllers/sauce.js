const Sauce = require("../models/Sauce");
const fs = require("fs");

//Création d'une nouvelle sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    // Pour générer l'URL de l'image de l'objet crée
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() =>
      res.status(201).json({ message: "La sauce a été enregistrée !" })
    )
    .catch((error) => res.status(400).json({ error }));
};

//Modification de la sauce sélectionnée
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),

        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Utilisateur non authorisé !" });
      } else {
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() =>
            res.status(200).json({ message: "La sauce a été modifiée !" })
          )
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Suppression de la sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Utilisateur non authorisé !" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({
            _id: req.params.id,
          })
            .then(() =>
              res.status(200).json({
                message: "La sauce est désormais supprimée !",
              })
            )
            .catch((error) =>
              res.status(400).json({
                error,
              })
            );
        });
      }
    })
    .catch((error) =>
      res.status(500).json({
        error,
      })
    );
};

// Gestion du like
exports.likeSauce = (req, res, next) => {
  const isLike = req.body.like;
  const userId = req.body.userId;

  switch (isLike) {
    case 1:
      Sauce.updateOne(
        { _id: req.params.id },
        { $inc: { likes: 1 }, $push: { usersLiked: userId } }
      )
        .then(() =>
          res.status(200).json({ message: "+1 Like ajouté à la sauce !" })
        )
        .catch((error) => res.status(400).json({ error }));
      break;

    case -1:
      Sauce.updateOne(
        { _id: req.params.id },
        { $inc: { dislikes: 1 }, $push: { usersDisliked: userId } }
      )
        .then(() =>
          res.status(200).json({ message: "+1 Dislike ajouté à la sauce !" })
        )
        .catch((error) => res.status(400).json({ error }));
      break;

    case 0:
      Sauce.findOne({ _id: req.params.id })
        .then((currentSauce) => {
          if (currentSauce.usersLiked.includes(userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              { $inc: { likes: -1 }, $pull: { usersLiked: userId } }
            )
              .then(() =>
                res
                  .status(200)
                  .json({ message: "Vous avez enlevé votre like !" })
              )
              .catch((error) => res.status(400).json({ error }));
          } else if (currentSauce.usersDisliked.includes(userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              { $inc: { dislikes: -1 }, $pull: { usersDisliked: userId } }
            )
              .then(() =>
                res
                  .status(200)
                  .json({ message: "Vous avez enlevé votre dislike !" })
              )
              .catch((error) => res.status(400).json({ error }));
          }
        })
        .catch((error) => res.status(400).json({ error }));
      console.log(isLike);
      break;
  }
};

// Affichage de la sauce sélectionnée
exports.getOneSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => res.status(404).json({ error }));
};

// Affichage de toutes les sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(404).json({ error });
    });
};
