"use strict";

//require necessary node packages
const express = require("express");
const serve = require("express-static");
const mongoose = require("mongoose");
const format = require("util").format;
const expressHandlebars = require("express-handlebars");
const bodyParser = require("body-parser");

//start express server instance
var app = express();

var mongoUrl = process.env.MONGO_DB_URL || "mongodb://localhost/waiter_webapp";

//mongoose models
const Models = require('./models.js');
const models = Models(mongoUrl);

//router
const Router = require('./routes.js');
const router = Router(models);

//configure port env
app.set("port", (process.env.PORT || 5001));

//set express handlebars as view engine
app.engine("handlebars", expressHandlebars({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");

//configure middleware
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

//configure express-static
app.use(serve("public"));

//home/login page
app.get("/", router.loginGET);

app.post("/login", router.loginPOST);

app.get("/registration", router.regGET);

app.post("/registration", router.regPOST);

app.get("/waiters/:username", router.waiterGET);

app.post("/waiters/:username", router.waiterPOST);

app.get("/days", router.daysGET);

var port = app.get("port");

app.listen(port , function() {
  console.log("The frontend server is running on port : " + port);
});
