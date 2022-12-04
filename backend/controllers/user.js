const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

//POST SIGNUP
exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() =>
          res.status(201).json({
            message: "Nouvel utilisateur enregistré !",
          })
        )
        .catch((error) =>
          res.status(400).json({
            error,
          })
        );
    })
    .catch((error) =>
      res.status(500).json({
        error,
      })
    );
};

//POST LOGIN
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        console.log("L'utilisateur n'existe pas !");
        return res
          .status(401)
          .json({ message: "L'email et/ou le mot de passe incorrect !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            console.log("Le mot de passe n'est pas valide !");
            return res
              .status(401)
              .json({ message: "L'email et/ou le mot de passe incorrect !" });
          }
          console.log("Le mot de passe est valide !");
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.SECRET, {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
