var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: {type: String, required: true},
});

//Export function to create "SomeModel" model class
module.exports = mongoose.model('User', userSchema );
