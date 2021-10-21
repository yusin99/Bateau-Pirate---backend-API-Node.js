const { json } = require("body-parser");
var express = require("express");
var router = express.Router();
const { database } = require("../config/helpers");
const { check, validationResult, body } = require("express-validator");
const helper = require("../config/helpers");

/* GET home page. */

router.get("/", helper.validJWTNeeded, function (req, res, next) {
  let page =
    req.query.page !== undefined && req.query.page !== 0 ? req.query.page : 1; // set current page number
  const limit =
    req.query.limit !== undefined && req.query.limit !== 0
      ? req.query.limit
      : 10; // setting limit of items per page

  let startValue;
  let endValue;

  if (page > 0) {
    startValue = page * limit - limit; //10,20,30
    endValue = page * limit;
  } else {
    startValue = 0;
    endValue = 10;
  }
  database
    .table("vinyl as v")
    .join([
      {
        table: "categories_musique as c",
        on: "v.idCategorie = c.idCategorie",
      },
    ])
    .slice(startValue, endValue)
    .sort({ idVinyl: 0.1 })
    .getAll()
    .then((prods) => {
      if (prods.length > 0) {
        res.status(200).json({
          count: prods.length,
          products: prods,
        });
      } else {
        res.json({
          message: "No products found",
        });
      }
    })
    .catch((err) => console.log(err));
});
// Delete single vinyl
router.delete("/delete/:idVinyl", helper.validJWTNeeded, async (req, res) => {
  try {
    const vinylId = req.params.idVinyl;
    console.log(vinylId);
    database
      .table("vinyl")
      .filter({ idVinyl: vinylId })
      .remove()
      .then((vinyls) => {
        if (vinyls.length >= 0) {
          res.status(200).json(vinyls);
        } else {
          res.json({ message: `No vinyls found with vinyl id ${vinylId}` });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
  }
});

router.get("/category", helper.validJWTNeeded, function (req, res, next) {
  database
    .table("categories_musique as c")
    .getAll()
    .then((categories) => {
      if (categories.length > 0) {
        res.status(200).json({
          count: categories.length,
          categories: categories,
        });
      } else {
        res.json({
          message: "No categories found",
        });
      }
    })
    .catch((err) => console.log(err));
});

router.get("/groupes", helper.validJWTNeeded, function (req, res, next) {
  database
    .table("groupes as g")
    .getAll()
    .then((groupes) => {
      if (groupes.length > 0) {
        res.status(200).json({
          count: groupes.length,
          groupes: groupes,
        });
      } else {
        res.json({
          message: "No groupes found",
        });
      }
    })
    .catch((err) => console.log(err));
});

router.get("/search/:search", function (req, res, next) {
  let searchName = req.params.searchName;

  database
    .table("vinyl as v")
    .join([
      {
        table: "categories_musique as c",
        on: "c.idCategorie = v.idCategorie",
      },
    ])
    .filter({ "v.nomVinyl": searchName })
    .getAll()
    .then((prods) => {
      console.log(prods);
      if (prods) {
        res.status(200).json(prods);
      } else {
        res.json({
          message: "No products found matching this name",
        });
      }
    })
    .catch((err) => console.log(err));
});

router.get("/:vinylId", helper.validJWTNeeded, function (req, res, next) {
  let vinylId = req.params.vinylId;

  database
    .table("vinyl as v")
    .join([
      {
        table: "categories_musique as c",
        on: "c.idCategorie = v.idCategorie",
      },
    ])
    .filter({ "v.idVinyl": vinylId })
    .get()
    .then((prods) => {
      console.log(prods);
      if (prods) {
        res.status(200).json(prods);
      } else {
        res.json({
          message: "No product found matching this",
        });
      }
    })
    .catch((err) => console.log(err));
});
// Get All songs
router.get("/piste/:vinylId", helper.validJWTNeeded, function (req, res, next) {
  let vinylId = req.params.vinylId;

  database
    .table("pistes as p")
    .join([
      {
        table: "vinyl as v",
        on: "v.idVinyl = p.idVinyl",
      },
    ])
    .filter({ "p.idVinyl": vinylId })
    .getAll()
    .then((prods) => {
      console.log(prods);
      if (prods) {
        res.status(200).json({
          count: prods.length,
          songs: prods,
        });
      } else {
        res.json({
          message: "No product found matching thiss",
        });
      }
    })
    .catch((err) => console.log(err));
});
// All products from a particular category
router.get("/category/:catName", helper.validJWTNeeded, function (req, res) {
  let page =
    req.query.page !== undefined && req.query.page !== 0 ? req.query.page : 1; // set current page number
  const limit =
    req.query.limit !== undefined && req.query.limit !== 0
      ? req.query.limit
      : 10; // setting limit of items per page

  let startValue;
  let endValue;
  if (page > 0) {
    startValue = page * limit - limit; //10,20,30
    endValue = page * limit;
  } else {
    startValue = 0;
    endValue = 10;
  }
  // Fetch the category name from the url
  const cat_nom = req.params.catName;
  database
    .table("vinyl as v")
    .join([
      {
        table: "categories_musique as c",
        on: `v.idCategorie = c.idCategorie WHERE c.nom LIKE '%${cat_nom}%'`,
      },
    ])
    .slice(startValue, endValue)
    .sort({ idVinyl: 0.1 })
    .getAll()
    .then((prods) => {
      if (prods.length > 0) {
        res.status(200).json({
          count: prods.length,
          products: prods,
        });
      } else {
        res.json({
          message: `No products found from category ${cat_nom} category`,
        });
      }
    })
    .catch((err) => console.log(err));
});
router.post(
  "/addVinyl",
  [
    check("nomVinyl").not().isEmpty().withMessage("Field can't be empty"),
    check("annee_sortie")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Field can't be empty")
      .isLength({ min: 4, max: 4 }),
    check("prixHT").not().isEmpty().withMessage("Field can't be empty"),
    check("quantite_dispo")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Field can't be empty"),
    check("description").not().isEmpty().withMessage("Field can't be empty"),
    body("nomVinyl").custom((value) => {
      return helper.database
        .table("vinyl")
        .filter({ nomVinyl: value })
        .get()
        .then((vinyl) => {
          console.log(vinyl);
          if (vinyl) {
            console.log(vinyl);
            return Promise.reject(
              "Vinyl name " + vinyl + " already exists, choose another one."
            );
          }
        });
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    // try {
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(422).json({ errors: errors.array() });
    } else {
      let { annee_sortie } = req.body;
      let { nomVinyl } = req.body;
      let { idCategorie } = req.body;
      let { idGroupe } = req.body;
      let { photo } = req.body;
      let { quantite_dispo } = req.body;
      let { prixHT } = req.body;
      let { description } = req.body;
      console.log(photo);
      database
        .table("vinyl")
        .insert({
          nomVinyl: nomVinyl,
          annee_sortie: annee_sortie,
          idCategorie: idCategorie,
          idGroupe: idGroupe || null,
          photo: photo || null,
          quantite_dispo: quantite_dispo || null,
          prixHT: prixHT,
          description: description || null,
        })
        .then((lastId) => {
          console.log(lastId);
          if (lastId > 0) {
            res
              .status(201)
              .json({ message: "Registration of new vinyl is successful." });
          } else {
            res
              .status(501)
              .json({ message: "Registration  of new vinyl has failed." });
          }
        })
        .catch((err) => {
          res.status(433).json({ error: err });
          console.log(err);
        });
    }

    // } catch (error) {
    //   console.log(error);
    // }

    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   console.log(errors);
    //   return res.status(422).json({ errors: errors.array() });
    // } else {
  }
  // }
);

module.exports = router;
