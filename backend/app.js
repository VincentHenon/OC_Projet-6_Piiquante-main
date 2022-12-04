const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Sauce = require("./models/Sauce");
const User = require("./models/User");
const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");
const path = require("path");
const helmet = require("helmet");
const dotenv = require("dotenv");
dotenv.config();

const MY_ID = process.env.MY_ID;
const MY_PW = process.env.MY_PW;
const PATH_DB = process.env.PATH_DB;

const app = express();
const router = express.Router();

//Connexion à MongoDB
mongoose
  .connect(
    `mongodb+srv://${process.env.MY_ID}:${process.env.MY_PW}@${process.env.PATH_DB}/?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// Extraire le corps JSON d'une requête
app.use(express.json());

// Parser JSON
app.use(bodyParser.json());

//Pour protéger l'app des vulnérabilités de base.
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Headers CORS pour les authorisations d'accès des requests
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );

  res.setHeader("Content-Security-Policy", "default-src 'self'");
  next();
});

// Constructions des routes

// Route "sauce"
app.use("/api/sauces", sauceRoutes);
// Route "user"
app.use("/api/auth", userRoutes);
// Route dossier /images
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
