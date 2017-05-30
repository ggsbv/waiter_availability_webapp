module.exports = function(){

  const createWaiter = function(username, password){

    var newUser = new Waiter({
      name: username,
      password: password
    });

    newUser.save()
    .then(
      //make output display "Registration Complete"
      return {
        output: "Registration complete."
      })
    .catch(function(err) {
      return {
        output: err
      };
    });
  };

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
      currentShift[weekDay] = workOnThisDay; //shiftForWeekDay ? true : false;

    });

    return currentShift.save();
  }

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

  const checkedDays = function(waiterName){
    var output = {};

    Waiter
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
