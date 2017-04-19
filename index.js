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

//connect to mongodb
mongoose.connect("mongodb://localhost/waiter_webapp");

//create our mongo schemas and models
var Waiter = mongoose.model("Waiter",
  {
    name: String,
    daysWorking: {
      Mon: Boolean,
      Tues: Boolean,
      Wed: Boolean,
      Thur: Boolean,
      Fri: Boolean,
      Sat: Boolean,
      Sun: Boolean
    }
  }
);

var Login = mongoose.model("Login",
  {
    name: String,
    password: String
  }
);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

  console.log("Connected to MongoDB");
  // we're connected!
});

//configure port env
app.set("port", (process.env.PORT || 5000));

//set express handlebars as view engine
app.engine("handlebars", expressHandlebars({defaultLayout: "main"}));
app.set("view engine", "handlebars");

//configure middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(serve("public"));

//home/login page
app.get("/", function(req, res){
  res.render("login");
});

app.post("/login", function(req, res){
  var username = req.body.usernameInput;
  var password = req.body.passwordInput;
  var data = "";
  //find the document that has a name similar to the input name
  Login
  .findOne({name: username})
    .then(function(result){
      if(!result){
        data = {output: "This user does not exist. Please register."};
      } else {
        if(password !== result.password){
          data = {output: "You have entered incorrect username/password."};
        } else {
          console.log("correct username and password");
          res.redirect("/waiters/" + username);
        };
      };
      res.render("login", data);
    })
    .catch(function(err){
      data = {output: err};
      res.render("login", data);
    });
});

app.get("/registration", function(req, res){
  res.render("registration");
});

app.post("/registration", function(req, res){
  var username = req.body.usernameRegistration;
  var password = req.body.passwordRegistration;
  var data = "";
  //if name does not exist in the db, save it
  Login.findOne({name: username})
    .then(function(result){
      if(!result){
        var newUser = new Login(
          {
            name: username,
            password: password
          }
        );

        newUser.save()
          .then(
            data = {output: "Registration complete."}
          )
          .catch(function(err){
            data = {output: err};
          });
      } else {
        data = {output: "This user already exists."};
      }
      res.render("registration", data);
    })
    .catch(function(err){
      data = {output: err};
      res.render("registration", data);
    });
});

app.get("/waiters/:username", function(req, res){
  //var username = req.params.name;

  res.render("home");
});

app.post("/waiters/:username", function(req, res){
  var waiter = req.body.username;
});

app.listen(app.get("port"), function(){
  console.log("The frontend server is running on port 5000!");
});
