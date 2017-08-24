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

//GET /
//show the login page
app.get("/", router.loginGET);

//POST /login
//Attempt to log user in
app.post("/login", router.loginPOST);

//GET /registration
//Registration page
app.get("/registration", router.regGET);

//POST /registration
//Create a new waiter based on registration input details
app.post("/registration", router.regPOST);

//GET /waiters/:username
//Display a checkbox for each day of the week so the waiter can choose
//their shifts
app.get("/waiters/:username", router.waiterGET);

//POST /waiters/:username
//Create a shift linked to the current waiter and save the state of the
//days that have been checked
app.post("/waiters/:username", router.waiterPOST);

//GET /days
//Show the admin which waiters are working on each day of the week
app.get("/days", router.daysGET);

var port = app.get("port");

app.listen(port , function() {
  console.log("The frontend server is running on port : " + port);
});
