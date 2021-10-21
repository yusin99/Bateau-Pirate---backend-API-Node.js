const express = require("express");
const { check, validationResult, body } = require("express-validator");
const router = express.Router();
const helper = require("../config/helpers");
const jwt = require("jsonwebtoken");
const request = require("request");

const bcrypt = require("bcrypt");
var session = require("express-session");

router.post("/token_validate", (req, res) => {
  let token = req.body.recaptcha;
  const secretkey = "6LfYWoAcAAAAAAjVyQC4chUICKzJ0LEScFtQYurf"; //the secret key from your google admin console;

  //token validation url is URL: https://www.google.com/recaptcha/api/siteverify
  // METHOD used is: POST

  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretkey}&response=${token}&remoteip=${req.connection.remoteAddress}`;

  //note that remoteip is the users ip address and it is optional
  // in node req.connection.remoteAddress gives the users ip address

  if (token === null || token === undefined) {
    res
      .status(201)
      .send({ success: false, message: "Token is empty or invalid" });
    return console.log("token empty");
  }

  request(url, (err, response, body) => {
    //the body is the data that contains success message
    body = JSON.parse(body);
    console.log(body);

    //check if the validation failed
    if (body.success !== undefined && !body.success) {
      res.send({ success: false, message: "recaptcha failed" });
      return console.log("failed");
    }

    //if passed response success message to client
    res.send({ success: true, message: "recaptcha passed" });
  });
});
module.exports = router;
