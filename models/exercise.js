var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var exerciseSchema = new Schema({
  userId : { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: { type: Date, required: true, default: Date.now() },//when client enter something but date format is wrong, default value will be used
});

exerciseSchema
.virtual('dateString') // "Wed Jan 01 2020"
.get(function () {
  return this.date.toDateString();
});


//Export function to create "SomeModel" model class
module.exports = mongoose.model('Exercise', exerciseSchema );
