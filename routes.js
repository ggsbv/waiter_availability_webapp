"use strict";

const WaiterDatabaseService = require('./js/WaiterDatabaseService.js');

module.exports = function(models){

  AvailableShift = models.AvailableShift;
  Waiter = models.Waiter;

  var waiterDatabaseService = new WaiterDatabaseService();

  const loginGetReq = function(req, res){
    res.render("login");
  };

  const loginPostReq = function(req, res) {
    var username = req.body.usernameInput;
    var password = req.body.passwordInput;
    var registerButton = req.body.registerButton1;
    var data = "";

    if(registerButton){
      res.redirect("/registration");
    } else {
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
            if(username !== "admin"){
              res.redirect("/waiters/" + username);
            } else {
              res.redirect("/days");
            }
          };
        };
      })
      .catch(function(err) {
        data = {
          output: err
        };
        res.render("login", data);
      });
    };
  });

  const regGetReq = function(req, res) {
    res.render("registration");
  };

  const regPostReq = function(req, res) {
    var username = req.body.usernameRegistration;
    var password = req.body.passwordRegistration;
    var data = "";

    if(username === ""){
      data = { output : "Please enter a valid username."};
      res.render("registration", data);
    } else if(password === ""){
      data = { output : "Please enter a valid password."};
      res.render("registration", data);
    } else {
      //if name does not exist in the db, save it
      Waiter.findOne({
        name: username
      })
      .then(function(result) {
        if (!result) {
          data = waiterDatabaseService.createWaiter(username, password);
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
    };
  };

  const waiterGetReq = function(req, res) {
    //when a checkbox is checked, the cell that contains the checkbox
    //should change yellow if there are less than 3 people listed, green if there
    //are 3 people listed, and red if there are more than 3 people listed.

    var waiterName = req.params.username;
    var output = waiterDatabaseService.checkedDays(waiterName);
    res.render("home", output);
  };

  const waiterPostReq = function(req, res) {
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
          waiterDatabaseService.waiterWithShift(waiterName)
          .then(function(waiterWithShift){
            waiterDatabaseService.updateShift(waiterWithShift, daysAvailable);
            res.redirect("/waiters/" + waiterName);
          });
      } else {
        res.render("home", {error: "No days were checked."})
      };
  };

  const daysGetReq = function(req, res){
    var outputPromise = waiterDatabaseService.waitersAvailableForEachDay(Waiter);

    outputPromise
      .then((output) => {
        for(let weekday in output){
          let currentDayDetails = output[weekday];
          let waiterListForDay = currentDayDetails.waiters;

          if(waiterListForDay.length < 3){
            currentDayDetails["status"] = "underSubscribed";
          } else if(waiterListForDay.length > 3) {
            currentDayDetails["status"] = "overSubscribed"; // colour : red
          } else {
            currentDayDetails["status"] = "sufficient"; // colour : green
          };
        };
        res.render("days", output);
      })
  };

  return {
    loginGET  : loginGetReq,
    loginPOST : loginPostReq,
    regGET    : regGetReq,
    regPOST   : regPostReq,
    waiterGET : waiterGetReq,
    waiterPOST: waiterPostReq,
    daysGET   : daysGetReq
  }
};
