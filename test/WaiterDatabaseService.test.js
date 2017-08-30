"use strict";

//url of test database
var mongoUrl = "mongodb://testing:testing@ds111124.mlab.com:11124/waiter-availability-webapp-testing";

//import packages
const assert = require('assert');

//import necessary modules
const Models = require('../models.js');
const WaiterDatabaseService = require('../js/WaiterDatabaseService.js');

const models = Models(mongoUrl);

var waiterDatabaseService = new WaiterDatabaseService(models.AvailableShift, models.Waiter);

describe("The WaiterDatabaseService", function(){

  before(function(done){
    models.AvailableShift
      .remove({})
      .then(function(shiftsRemoved){
        models.Waiter
          .remove({})
          .then(function(waitersRemoved){
            done();
          })
          .catch(function(err){
            done(err);
          })
      })
      .catch(function(err){
        done(err);
      })
  });

  const testName      = "Aristotle";
  const testPassword  = "password";

//FUNCTION BEING TESTED:
//  => createWaiter(username, password)

  it("should store Waiter in MongoDB", function(done){
    waiterDatabaseService
      .createWaiter(testName, testPassword)
      .then(function(result){

        models.Waiter
          .findOne({name : testName})
          .then(function(waiter){
            assert.equal(testName, waiter.name);
            assert.equal(testPassword, waiter.password);
            done();
          })
          .catch(function(err){
            done(err);
          });
      })
      .catch(function(err){
        done(err);
      });
  });

  //FUNCTION BEING TESTED:
  //  => createShift(username, password)

  it("should create a shift doc and link it to the waiter", function(done){
    models.Waiter
      .findOne({name : testName})
      .then(function(waiterDoc){
        waiterDatabaseService
          .createShift(waiterDoc)
          .then(function(shift){
            assert.ok(shift._waiter_id)
            assert.equal(false, shift.Monday);
            assert.equal(false, shift.Tuesday);
            assert.equal(false, shift.Wednesday);
            assert.equal(false, shift.Thursday);
            assert.equal(false, shift.Friday);
            assert.equal(false, shift.Saturday);
            assert.equal(false, shift.Sunday);
            done();
          })
          .catch(function(err){
            done(err);
          })
      })
      .catch(function(err){
        done(err);
      });
  })

  //FUNCTION BEING TESTED:
  //  => waiterWithShift(waiterName)
  it("should return a waiter with a populated shift", function(done){
    waiterDatabaseService
      .waiterWithShift(testName)
      .then(function(waiterWithShift){
        assert.equal(false, waiterWithShift._shift.Monday);
        assert.equal(false, waiterWithShift._shift.Tuesday);
        assert.equal(false, waiterWithShift._shift.Wednesday);
        assert.equal(false, waiterWithShift._shift.Thursday);
        assert.equal(false, waiterWithShift._shift.Friday);
        assert.equal(false, waiterWithShift._shift.Saturday);
        assert.equal(false, waiterWithShift._shift.Sunday);
        done();
      })
      .catch(function(err){
        done(err);
      })
  });

  //FUNCTION BEING TESTED:
  //  => updateShift(waiter, shiftData)
  it("should update a waiter's shift", function(done){
    models.Waiter
      .findOne({ name : testName })
        .populate("_shift")
      .then(function(waiterDoc){
        waiterDatabaseService
          .updateShift(waiterDoc, ["Tuesday", "Friday"])
            .then(function () {
                  models.Waiter
                  .findOne({ name : testName })
                  .populate("_shift")
                  .then(function(waiterWithShift){
                    assert.equal(false, waiterWithShift._shift.Monday);
                    assert.equal(true, waiterWithShift._shift.Tuesday);
                    assert.equal(false, waiterWithShift._shift.Wednesday);
                    assert.equal(false, waiterWithShift._shift.Thursday);
                    assert.equal(true, waiterWithShift._shift.Friday);
                    assert.equal(false, waiterWithShift._shift.Saturday);
                    assert.equal(false, waiterWithShift._shift.Sunday);
                    done();
                  })
                  .catch(function(err){
                    done(err);
                  });
            })
      })
      .catch(function(err){
        done(err);
      });

  });
});
