var express = require("express");
var router = express.Router();
const { database } = require("../config/helpers");
const { check, validationResult, body } = require("express-validator");
const helper = require("../config/helpers");
const bcrypt = require("bcrypt");
router.get("/", function (req, res) {
  database
    .table("clients as clients")
    .withFields([
      "clients.idClient",
      "clients.idParrain",
      "clients.nom",
      "clients.prenom",
      "clients.pseudo",
      "clients.mdp",
      "clients.role",
      "clients.adresse",
      "clients.code_postal",
      "clients.ville",
      "clients.email",
      "clients.tel",
      "clients.date_inscription",
      "clients.photoUrl",
      "clients.type",
    ])
    .getAll()
    .then((users) => {
      if (users.length > 0) {
        res.status(200).json({ count: users.length, users: users });
      } else {
        res.json({ message: "No users found" });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});
router.get("/:idClient", function (req, res) {
  const clientId = req.params.idClient;
  database
    .table("clients as clients")
    .withFields([
      "clients.idClient",
      "clients.idParrain",
      "clients.nom",
      "clients.prenom",
      "clients.pseudo",
      "clients.mdp",
      "clients.role",
      "clients.adresse",
      "clients.code_postal",
      "clients.ville",
      "clients.email",
      "clients.tel",
      "clients.date_inscription",
      "clients.photoUrl",
      "clients.type",
    ])
    .filter({ idCLient: clientId })
    .getAll()
    .then((users) => {
      if (users.length > 0) {
        res.status(200).json({ count: users.length, users: users });
      } else {
        res.json({ message: "No users found" });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});
router.put(
  "/updateUser/:idClient",
  [
    check("email")
      .isEmail()
      .not()
      .isEmpty()
      .withMessage("Field can't be empty")
      .normalizeEmail({ all_lowercase: true }),
    check("mdp")
      .escape()
      .trim()
      .not()
      .isEmpty()
      .withMessage("Field can't be empty")
      .isLength({ min: 8, max: 16 })
      .withMessage(
        "Password must be 8 characters atleast long and no more than 16"
      )
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
      .withMessage(
        "The password should contain atleast 1 Uppercase, 1 Lowercase and 1 special character"
      ),
    // body("email").custom((value) => {
    //   console.log(value);
    //   return helper.database
    //     .table("clients")
    //     .filter({
    //       $or: [{ email: value }],
    //     })
    //     .getAll()
    //     .then((user) => {
    //       console.log(user.length);
    //       if (user.length >= 1) {
    //         console.log(user);
    //         return Promise.reject(
    //           "Email / Username already exists, choose another one."
    //         );
    //       }
    //     });
    // }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const clientId = req.params.idClient;
    if (!errors.isEmpty()) {
      // console.log(errors);
      return res.status(422).json({ errors: errors.array() });
    } else {
      let email = req.body.email;
      let pseudo = req.body.pseudo;
      let mdp = await bcrypt.hash(req.body.mdp, 10);
      let prenom = req.body.prenom;
      let nom = req.body.nom;
      let photoUrl = req.body.photoUrl;
      let emailExists = helper.database
        .table("clients")
        .filter({
          $or: [{ email: email }],
        })
        .getAll()
        .then((user) => {
          console.log(user.length);
          if (user.length >= 1) {
            console.log(user);
            return Promise.reject(
              "Email / Username already exists, choose another one."
            );
          }
        })
        .catch((err) => {
          console.log(err);
        });
      console.log(emailExists);
      if (mdp && emailExists) {
        helper.database
          .table("clients")
          .filter({ idClient: clientId })
          .update({
            pseudo: pseudo,
            mdp: mdp || null,
            email: email,
            // role: 555 || null,
            nom: nom || null,
            prenom: prenom || null,
            photoUrl: photoUrl || null,
          })
          .then((lastId) => {
            console.log(lastId);
            if (lastId > 0) {
              res
                .status(201)
                .json({ message: "Update of the user successful." });
            } else {
              res
                .status(501)
                .json({ message: "Update of the user has failed." });
            }
          })
          .catch((err) => res.status(433).json({ error: err }));
      } else {
        helper.database
          .table("clients")
          .filter({ idClient: clientId })
          .update({
            pseudo: pseudo,
            // email: email,
            // role: 555 || null,
            nom: nom || null,
            prenom: prenom || null,
            photoUrl: photoUrl || null,
          })
          .then((lastId) => {
            console.log(lastId);
            if (lastId > 0) {
              res
                .status(201)
                .json({ message: "Update of the user successful." });
            } else {
              res
                .status(501)
                .json({ message: "Update of the user has failed." });
            }
          })
          .catch((err) => res.status(433).json({ error: err }));
      }
      // console.log(email, pseudo, mdp, prenom, nom, photoUrl);
    }
  }
);

// Delete single user
router.delete("/:idClient", async (req, res) => {
  try {
    const clientId = req.params.idClient;
    console.log(clientId);
    database
      .table("clients")
      .filter({ idClient: clientId })
      .remove()
      .then((clients) => {
        if (clients.length >= 0) {
          res.status(200).json(clients);
        } else {
          res.json({ message: `No users found with client id ${clientId}` });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
