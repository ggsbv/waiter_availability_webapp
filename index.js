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
  week: Number,
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
    });
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
        return Waiter;
      }
    });
};

function updateShift(waiterPromise, shiftData) {
  //loop through daysAvailable
  for (let i = 0; i < shiftData.length; i++) {
    let chosenDay = shiftData[i];
    //invoke the waiterPromise which allows us access to the waiterDocument
    waiterPromise
      .then(function(waiterDoc){
        //loop through the waiter document's _shift key, which is mapped to
        //an object that contains the days of the week
        for(currentKey in waiterDoc._shift){
          //find all the keys that with day, for those are the days of the week
          //that we will need to update
          if(currentKey.endsWith("day")){
            if(currentKey === chosenDay){
              waiterDoc._shift
                .update(
                  {name: waiterDoc.name},
                  {
                    currentKey: true
                  },
                  function(err){
                    if(err){
                      console.log("Error updating " + currentKey + " to true.");
                    }
                  }
                )
            } else {
              waiterDoc._shift
                .update(
                  {name: waiterDoc.name},
                  {
                    currentKey: false
                  },
                  function(err){
                    if(err){
                      console.log("Error updating " + currentKey + " to false.");
                    }
                  }
                )
            };
          }
        }
      })
      .catch(function(err){
        if(err){
          console.log(err);
        }
      });
  };
};


// function oldStuff() {
//
//   return AvailableShift
//     .findOne({
//       name: waiterName
//     })
//     .then(function(currentShift) {
//         //if there are no entries in AvailableShift collection
//         //then find the waiterName in the Waiter collection
//         if (!currentShift) {
//           return Waiter
//             .findOne({
//               name: waiterName
//             })
//             .then(function(currentWaiter) {
//               //store the current doc in "currentWaiter"
//
//               return AvailableShift.create({
//                   _waiter_id: currentWaiter._id,
//                   Monday: false,
//                   Tuesday: false,
//                   Wednesday: false,
//                   Thursday: false,
//                   Friday: false,
//                   Saturday: false,
//                   Sunday: false
//                 })
//                 .then(function(shift) {
//                   // you have Shift and a Waiter...
//                   return {
//                     shift,
//                     waiter
//                   }
//                 })
//                 .catch(function(err) {
//                   console.log(err);
//                 });
//             })
//
//           //create a new shift doc with a ref to the Waiter coll
//           //save the new shift
//         } else {
//           return {
//             shift: currentShift,
//
//           }
//         }
//
//       }


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
            var waiterWithShiftPromise = waiterWithShift(waiterName);
            updateShift(waiterWithShiftPromise, daysAvailable);
          }
          res.render("home");
      });

app.listen(app.get("port"), function() {
  console.log("The frontend server is running on port 5000!");
});
