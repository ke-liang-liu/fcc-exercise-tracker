const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track', { useNewUrlParser: true } )
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// above code creates the default connection to the database and binds to the error event (so that errors will be printed to the console). 

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// new routes:
var User = require('./models/user');
var Exercise = require('./models/exercise');

app.post('/api/exercise/new-user', (req, res) => {
  var user = new User({username: req.body.username});
  user.save(function(err) {
    if(err) {return console.error(err)}
  })
  res.send(user);  
})

app.post('/api/exercise/add', (req, res) => {
  if (req.body.date === '') {req.body.date = new Date()}
  
  var exercise = new Exercise({
    userId: req.body.userId,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date
  })
  exercise.save(function(err) {
    if(err) { return console.error(err)}
  })
  User.findById(req.body.userId, 'username', function(err, user) {
    if(err) {return console.error(err)}
    res.send({
      username: user.username,
      description: req.body.description,
      duration: +req.body.duration,
      _id: req.body.userId,
      date: exercise.dateString
    })
  })
})

app.get('/api/exercise/log', (req, res) => {
  var from = new Date(req.query.from);
  var to = new Date(req.query.to);
  if ( from == 'Invalid Date') { from = new Date(1970, 0, 1)}
  if ( to == 'Invalid Date') { to = Date.now()}
  var limit = +req.query.limit;
  
  var id = req.query.userId;
  User.findById(id, 'username', function(err, doc) {
    
    if(err) {return console.error(err)}
    Exercise.find()
      .where({userId: id})
      .where('date').gt(from).lt(to)
      .limit(limit)
      .select('description duration date')
      .exec(function(err, exercises) {
        if(err) {return console.error(err)}
        var log = [];
        exercises.forEach(item => {
          log.push({
            description: item.description,
            duration: item.duration,
            date: item.dateString
          })
        })
        res.send({
          _id: id,
          username: doc.username,
          count: log.length,
          log: log
        })
      })
  })
})

app.get('/api/exercise/users', (req, res) => {
  User.find(function(err, users) {
    if(err) {return console.error(err)}
    res.send(users);
  })
})


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage + ': ' + errCode)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(listener.address())
  console.log('Your app is listening on port ' + listener.address().port)
})
