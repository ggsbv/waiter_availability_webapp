"use strict";

module.exports = function(AvailableShift, Waiter){

  //FUNCTION    : createWaiter
  //PARAMETERS  : [1] username  => the waiter's name
  //                # Type : String
  //              [2] name      => the waiter's input password
  //                # Type : String
  //RETURN      : Type  => Object
  //DESCRIPTION : Takes a waiter' name and password, then creates a document
  //              in the Mongo Database for the waiter. An object containing
  //              a success or error message is returned.

  const createWaiter = function(username, password){
    var status = {};

    var newUser = new Waiter({
      name: username,
      password: password
    });

    return newUser.save()
    .then(function(result){
      //make output display "Registration Complete"
      status = {
        output: "Registration complete."
      };
      return status;
    })
    .catch(function(err) {
      return {
        output: err
      };
    });
  };

  //FUNCTION    : createShift
  //PARAMETERS  : [1] waiter  => MongoDB shiftless waiter document/object
  //                # Type : Object
  //RETURN      : Type  => Object
  //DESCRIPTION : Takes a mongo waiter document, and creates a separate shift
  //              document for that waiter. The shift document is then linked to
  //              the waiter document.The function then returns a waiter document
  //              that has a shift in the form of a promise.

  const createShift = function(waiter) {
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
      }).catch(function(err){
        if (err) console.log(err);
      });
  };

  //FUNCTION    : waiterWithShift
  //PARAMETERS  : [1] waiterName  => name of the waiter we want to work with
  //                # Type : String
  //RETURN      : Type  => Object
  //DESCRIPTION : Takes a waiter's name as an argument, and searches the Database
  //              for the document that has the matching name.
  //
  //              If that waiter does have a shift, his/her shift is populated
  //              and returned in the form of a promise.
  //
  //              Otherwise the waiter does not have a shift, a shift is
  //              created using the createShift function, the waiter's shift is
  //              then populated and the waiter is returned along with a populated
  //              shift in the form of a promise.

  const waiterWithShift = function(waiterName) {

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

  //FUNCTION    : updateShift
  //PARAMETERS  : [1] waiter    =>  a MongoDB waiter document
  //                # Type : String
  //              [2] shiftData =>  an array of day strings that were checked
  //                                in the DOM checkbox element
  //                # Type : Array
  //RETURN      : Type  => Object
  //DESCRIPTION : Takes a waiter document along with the days of the week on which
  //              the waiter wants to work. The function then updates the waiter's
  //              shift to "true" on the days which he/she has chosen to work, and
  //              "false" for the days on which they did not choose to work.
  //
  //              The function finally returns a WriteResult object which contains
  //              the status of the save() operation.

  const updateShift = function(waiter, shiftData) {
    var currentShift = waiter._shift;

    //find all the weekday fields
    var weekDayFields = Object
      .keys(currentShift.toJSON())
      .filter((field) => field.endsWith('day'))

    //look at each day in weekDayFields
    weekDayFields.forEach((weekDay) => {
      //look in shiftData to find which days were checked
      let shiftForWeekDay = shiftData.find((day) => day === weekDay);
      //if shiftForWeekDay has a value, workOnThisDay will be true, if not, it will be
      //false
      var workOnThisDay = false;
      if (shiftForWeekDay){
        workOnThisDay = true;
      }
      //since we have the boolean stored in workOnThisDay, we can set each weekDay
      //at currentShift to the value stored in workOnThisDay
      currentShift[weekDay] = workOnThisDay;

    });

    return currentShift.save();
  };

  //FUNCTION    : waitersAvailableForEachDay
  //PARAMETERS  : [1] waiterCollection  => an array of waiter documents
  //                # Type : Array
  //RETURN      : Type  => Object
  //DESCRIPTION : Takes a collection of waiters, populates their shifts, then
  //              checks each waiter's shifts. For the days which are set to "true",
  //              the waiter's name is added to the corresponding day in the output
  //              object.
  //
  //              The function finally returns an output object that shows all
  //              the waiters that are working for each day of the week.

  const waitersAvailableForEachDay = function(waiterCollection){
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
          let currentWaiterShift = {};

          if(currentWaiterDoc._shift){
            currentWaiterShift = currentWaiterDoc._shift.toJSON();
          };

          //find all days that are true
          for(let key in currentWaiterShift){
            if(key.endsWith("day")){
              let day = key;
              //if the current day is set to true
              if(currentWaiterShift[day] === true){
                //push the waiter's name to the output objlist where the key in waiter shift is
                //the same as the key in the output
                output[day].waiters.push(currentWaiterName);
              }
            }
          };
        })
        return output;
      })
  };

  //FUNCTION    : checkedDays
  //PARAMETERS  : [1] waiterName  => a waiter's username
  //                # Type : String
  //RETURN      : Type  => Object
  //DESCRIPTION : Takes a waiter's name as an argument, finds that waiter's
  //              document in the database, then populates its shift. The function
  //              the shift for the days which are set to true. Those days are set
  //              as keys mapped to the value "checked" in the output object.
  //              The output object is then returned in the form of a promise.

  const checkedDays = function(waiterName){
    var output = {};

    return Waiter
      .findOne({name : waiterName})
      .populate("_shift")
      .then(function(waiterDoc){
        let currentWaiterShift = waiterDoc._shift;

        for(let key in currentWaiterShift){
          if(key.endsWith("day")){
            let day = key;

            if(currentWaiterShift[day] === true){
              output[day] = "checked";
            };
          };
        };
        return output;
      });
  };

  return {
    createWaiter                : createWaiter,
    createShift                 : createShift,
    waiterWithShift             : waiterWithShift,
    updateShift                 : updateShift,
    waitersAvailableForEachDay  : waitersAvailableForEachDay,
    checkedDays                 : checkedDays
  }
}
