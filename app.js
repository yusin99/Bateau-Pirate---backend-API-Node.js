const createError = require("http-errors");
const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "PUT", "DELETE", "PATCH", "POST"],
    allowedHeaders:
      "Content-Type, Authorization, Origin, X-Requested-With, Accept",
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(logger("dev"));
app.use(express.json());
// Input routes

const productRouter = require("./routes/index");
const userRouter = require("./routes/users");
const ordersRouter = require("./routes/orders");
const captchaRouter = require("./routes/captcha");
const authRouter = require("./routes/auth");
// Use routes

app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/captcha", captchaRouter);
app.use("/api/auth", authRouter);
// app.use("/api/users", userRouter);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
