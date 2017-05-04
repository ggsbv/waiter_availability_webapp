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
var AvailableShift = mongoose.model("AvailableShift", {
  _waiter_id: {
    type: String,
    ref: "Waiter"
  },
  Monday: Boolean,
  Tuesday: Boolean,
  Wednesday: Boolean,
  Thursday: Boolean,
  Friday: Boolean,
  Saturday: Boolean,
  Sunday: Boolean,
});

var Waiter = mongoose.model("Waiter", {
  name      : String,
  password  : String,
  _shift    : {
    type  : mongoose.Schema.Types.ObjectId,
    ref   : "AvailableShift"
  }
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

  console.log("Connected to MongoDB");
  // we're connected!
});

//configure port env
app.set("port", (process.env.PORT || 5000));

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
app.get("/", function(req, res) {
  res.render("login");
});

app.post("/login", function(req, res) {
  var username = req.body.usernameInput;
  var password = req.body.passwordInput;
  var data = "";
  //find the document that has a name similar to the input name
  Waiter
    .findOne({
      name: username
    })
    .then(function(result) {
      if (!result) {
        data = {
          output: "This user does not exist. Please register."
        };
        res.render("login", data);
      } else {
        if (password !== result.password) {
          data = {
            output: "You have entered incorrect username/password."
          };
          res.render("login", data);
        } else {
          res.redirect("/waiters/" + username);
        };
      };
    })
    .catch(function(err) {
      data = {
        output: err
      };
      res.render("login", data);
    });
});

app.get("/registration", function(req, res) {
  res.render("registration");
});

app.post("/registration", function(req, res) {
  var username = req.body.usernameRegistration;
  var password = req.body.passwordRegistration;
  var data = "";
  //if name does not exist in the db, save it
  Waiter.findOne({
      name: username
    })
    .then(function(result) {
      if (!result) {
        var newUser = new Waiter({
          name: username,
          password: password
        });

        newUser.save()
          .then(
            //make output display "Registration Complete"
            data = {
              output: "Registration complete."
            }
          )
          .catch(function(err) {
            data = {
              output: err
            };
          });
      } else {
        data = {
          output: "This user already exists."
        };
      };
      res.render("registration", data);
    })
    .catch(function(err) {
      data = {
        output: err
      };
      res.render("registration", data);
    });
});

app.get("/waiters/:username", function(req, res) {
  //when a checkbox is checked, the cell that contains the checkbox
  //should change yellow if there are less than 3 people listed, green if there
  //are 3 people listed, and red if there are more than 3 people listed.

  //var waiter = req.params.username;

  res.render("home");
});

//

function createShift(waiter) {
  return AvailableShift
    .create({
      _waiter_id: waiter._id,
      Monday: false,
      Tuesday: false,
      Wednesday: false,
      Thursday: false,
      Friday: false,
      Saturday: false,
      Sunday: false
    }).then(function(shift){
        waiter._shift = shift._id;
        return waiter
          .save()
          .then(function(){
            return shift;
          });
    })
};

//after executing the following function, we know that we have a waiter that is
//linked to a shift collection
function waiterWithShift(waiterName) {

  return Waiter //returns a promise that returns a waiter along with his shift
  //find the waiter
    .findOne({
      name: waiterName
    })
    //populate _shift
    .populate('_shift')
    .then(function(waiter) {//a waiter with a shift is returned
      //if no shift exists
      if (!waiter._shift) {
        // create a shift
        return createShift(waiter)
          .then(function() {
            //now we know the waiter does have a shift
            return Waiter //this will return a waiter with a shift
            //therefore find waiter again
              .findOne({
                name: waiterName
              })
              //and populate his shift
              .populate('_shift');
              //and bubble the return up
          })
      } else {
        //otherwise a waiter does exist and he does have a shift
        return waiter;
      }
    });
};

function updateShift(waiter, shiftData) {
  var currentShift = waiter._shift;
  console.log(currentShift);

  // var test = Object
  //   .keys(currentShift.paths)

    // console.log(test);

  //find al lthe weekday fields
  var weekDayFields = Object
    .keys(currentShift.toJSON())
    .filter((field) => field.endsWith('day'))

  //look at each day in weekDayFields
  weekDayFields.forEach((weekDay) => {
    //look in shiftData to find which days were checked
    let shiftForWeekDay = shiftData.find((day) => day === weekDay);
    console.log(shiftForWeekDay);
    //if shiftForWeekDay has a value, workOnThisDay will be true, if not, it will be
    //false
    var workOnThisDay = false;
    if (shiftForWeekDay){
      workOnThisDay = true;
    }
    //since we have the boolean stored in workOnThisDay, we can set each weekDay
    //at currentShift to the value stored in workOnThisDay
    currentShift[weekDay] = workOnThisDay; //shiftForWeekDay ? true : false;

  });

  return currentShift.save();
}

function waitersAvailableForEachDay(waiterCollection){
  var output = {
      Monday    : {waiters : []},
      Tuesday   : {waiters : []},
      Wednesday : {waiters : []},
      Thursday  : {waiters : []},
      Friday    : {waiters : []},
      Saturday  : {waiters : []},
      Sunday    : {waiters : []}
  };

  //query for all waiters
  return waiterCollection
    .find({})
    .populate("_shift")
    //find({}), returns an array of all waiter objects
    .then(function(myCursor){
      //loop through each object that represents a waiter, and populate his/her shift

      myCursor.forEach((currentWaiterDoc) => {
        let currentWaiterName = currentWaiterDoc.name;
        let currentWaiterShift = currentWaiterDoc._shift.toJSON();
        //find all days that are true
        for(let key in currentWaiterShift){
          if(key.endsWith("day")){
            let day = key;
            //if the current day is set to true
            if(currentWaiterShift[day] === true){
              //push the waiter's name to the output objlist where the key in waiter shift is
              //the same as the key in the output
              output[day].waiters.push(currentWaiterName);
              console.log(output[day].waiters.length);
            }
          }
        };
      })
      return output;
    })
};

      app.post("/waiters/:username", function(req, res) {
          var waiterName = req.params.username;
          var wasChecked = req.body.dayCheck;
          var currentWaiterDoc = "";
          var daysAvailable = [];

          if (typeof(wasChecked) !== "object") {
            daysAvailable.push(wasChecked);
          } else {
            daysAvailable = wasChecked;
          };
          //if at least one day was checked
          if (daysAvailable.length > 0) {

              waiterWithShift(waiterName)
              .then(function(waiterWithShift){
                updateShift(waiterWithShift, daysAvailable);
                res.render("home");
              });
          } else {
            res.render("home", {error: "No days were checked."})
          }
      });

app.get("/days", function(req, res){
  var outputPromise = waitersAvailableForEachDay(Waiter);

  outputPromise
    .then((output) => {
      for(let weekday in output){
        let currentDayDetails = output[weekday];
        //console.log(currentDayDetails);
        let waiterListForDay = currentDayDetails.waiters;

        if(waiterListForDay.length < 3){
          currentDayDetails["status"] = "underSubscribed";
        } else if(waiterListForDay.length > 3) {
          currentDayDetails["status"] = "overSubscribed"; // colour : red
        } else {
          currentDayDetails["status"] = "sufficient"; // colour : green
        };
      };
      console.log(output);
      res.render("days", output);
    })
  /***
  [
    {day: 'Monday', waiters : [], status : 'under'}

  ]

  */
});

app.listen(app.get("port"), function() {
  console.log("The frontend server is running on port 5000!");
});
