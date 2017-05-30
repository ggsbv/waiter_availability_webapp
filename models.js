"use strict";

const mongoose = require("mongoose");

module.exports = function(mongoUrl){

  mongoose.connect(mongoUrl);

  var db = mongoose.connection;

  db.on("error", function(err){
    console.error(err);
  });

  db.once("open", function(){
    console.log("connection successful");
  });

  const Schema = mongoose.Schema;

  const AvailableShiftSchema = new Schema({
    _waiter_id : {
      type  : String,
      ref   : "Waiter"
    },
    Monday: Boolean,
    Tuesday: Boolean,
    Wednesday: Boolean,
    Thursday: Boolean,
    Friday: Boolean,
    Saturday: Boolean,
    Sunday: Boolean
  });

  const WaiterSchema = new Schema({
    name      : String,
    password  : String,
    _shift    : {
      type  : Schema.Types.ObjectId,
      ref   : "AvailableShift"
    }
  });

  const AvailableShift = mongoose.model("AvailableShift", AvailableShiftSchema);
  const Waiter         = mongoose.model("Waiter", WaiterSchema);

  return {
    AvailableShift,
    Waiter
  }
};
