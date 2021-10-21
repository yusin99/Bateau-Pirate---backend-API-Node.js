const express = require("express");
const helper = require("../config/helpers");
const router = express.Router();
const { database } = require("../config/helpers");
/* GET users listing. */
// router.get("/", function (req, res, next) {
//   // res.send("respond with a resource");
// });
// Get all orders
router.get("/", function (req, res) {
  database
    .table("commandes as com")
    .join([
      {
        table: "clients as c",
        on: "com.idClient = c.idClient",
      },
      {
        table: "articles_commande as ac",
        on: "com.idCommande = ac.idCommande ",
      },
      {
        table: "vinyl as v",
        on: "ac.idVinyl = v.idVinyl",
      },
    ])
    .withFields([
      "com.date_commande",
      "com.status_commande",
      "c.prenom",
      "c.nom",
      "v.nomVinyl",
    ])
    .getAll()
    .then((orders) => {
      if (orders.length > 0) {
        res.status(200).json(orders);
      } else {
        res.json({ message: "No orders found" });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

// Get order by user logged in
router.get("/client/:idClient", async (req, res) => {
  try {
    const clientId = req.params.idClient;
    database
      .table("commandes as com")
      .join([
        {
          table: "clients as c",
          on: "com.idClient = c.idClient",
        },
        {
          table: "articles_commande as ac",
          on: "com.idCommande = ac.idCommande",
        },
        {
          table: "vinyl as v",
          on: "ac.idVinyl = v.idVinyl",
        },
      ])
      .withFields([
        "ac.idCommande",
        "com.date_commande",
        "com.status_commande",
        "c.prenom",
        "v.nomVinyl",
        "v.photo",
        "ac.quantite",
      ])
      .filter({ "c.idClient": clientId })
      .getAll()
      .then((orders) => {
        if (orders.length >= 0) {
          res.status(200).json(orders);
        } else {
          res.json({ message: `No orders found with user id ${clientId}` });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
  }
});

// Get single order
router.get("/:idCommande", async (req, res) => {
  try {
    const orderId = req.params.idCommande;
    database
      .table("commandes as com")
      .join([
        {
          table: "clients as c",
          on: "com.idClient = c.idClient",
        },
        {
          table: "articles_commande as ac",
          on: "com.idCommande = ac.idCommande",
        },
        {
          table: "vinyl as v",
          on: "ac.idVinyl = v.idVinyl",
        },
      ])
      .withFields([
        "ac.idCommande",
        "com.date_commande",
        "com.status_commande",
        "c.prenom",
        "v.nomVinyl",
        "v.photo",
        "ac.quantite",
      ])
      .filter({ "ac.idCommande": orderId })
      .getAll()
      .then((orders) => {
        if (orders.length >= 0) {
          res.status(200).json(orders);
        } else {
          res.json({ message: `No orders found with order id ${orderId}` });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
  }
});

router.post("/new", async (req, res) => {
  let { userId } = req.body;
  let { products } = req.body;
  if (userId !== null && userId > 0) {
    database
      .table("commandes")
      .insert({
        idClient: userId,
      })
      .then((newOrderId) => {
        if (newOrderId > 0) {
          console.log(req.body);
          products.forEach(async (p) => {
            try {
              let data = await database
                .table("vinyl")
                .withFields(["quantite_dispo", "prixHT", "nomVinyl", "photo"])
                .get();
              let inCart = parseInt(p.incart);
              let prixTotal = p.incart * data.prixHT;
              // console.log(p.id + " idididiididididiididi");
              // Deduct the number of pieces ordered from the quantity in database

              if (data.quantite_dispo > 0) {
                data.quantite_dispo = data.quantite_dispo - inCart;

                if (data.quantite_dispo < 0) {
                  data.quantite_dispo = 0;
                }
              } else {
                data.quantite_dispo = 0;
              }

              // Insert order details w.r.t the newly created order Id
              database
                .table("articles_commande")
                .insert({
                  idCommande: newOrderId,
                  idVinyl: p.id,
                  quantite: inCart,
                  montantHT: prixTotal,
                })
                .then((newId) => {
                  database
                    .table("vinyl")
                    .filter({ idVinyl: p.id })
                    .update({ quantite_dispo: data.quantite_dispo })
                    .then((successNum) => {
                      // database
                      //   .table("commandes")
                      //   .filter({ idCommande: newOrderId })
                      //   .insert({ montant_HT: prixTotal })
                      //   .then(() => {})
                      //   .catch((err) => {
                      //     console.log(err);
                      //   });
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                })
                .catch((err) => {
                  console.log(err);
                });
            } catch (error) {
              console.log(error);
            }
          });
        } else {
          res.json({
            message: "New order failed while adding order details",
            success: false,
          });
        }
        res.json({
          message: `Order successfully placed with order id ${newOrderId}`,
          success: true,
          order_id: newOrderId,
          products: products,
        });
      })
      .catch((err) => res.json(err));
  } else {
    res.json({ message: "New order failed", success: false });
  }
});

// Payment Gateway fake
router.post("/payment", function (req, res) {
  setTimeout(() => {
    res.status(200).json({ success: true });
  }, 4000);
});

module.exports = router;
