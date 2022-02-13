const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose');
var bodyParser = require('body-parser');

require('dotenv').config()

app.use(cors())
app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({
  extended: true
})); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: false })) 

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const Schema = mongoose.Schema;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true});

const userSchema = new Schema({
  username: String
});

let User = mongoose.model('User', userSchema);

const exerciseSchema = new Schema({
  description: String, 
  duration: Number, 
  date: String
}, { _id: false }); 

let Exercise = mongoose.model('Exercise', exerciseSchema);
// You can POST to /api/users with form data username to create a new user.
// The returned response from POST /api/users with form data username will be an object with username and _id properties.

//TO DO this you need the body parser package
app.post('/api/users', (req, res)=>{
  let username = req.body.username; 
  let user = new User({
        _id: new mongoose.Types.ObjectId(),
        username: username
      });

      user.save((err, data)=> {
        if(err) console.log(err);
        return res.json({username: data.username, _id: data._id});
      });
}); 

// You can make a GET request to /api/users to get a list of all users.
// The GET request to /api/users returns an array.
// Each element in the array returned from GET /api/users is an object literal containing a user's username and _id.

app.get('/api/users', (req, res)=> {
  User.find({}, (err, data)=>{
      if(err) console.log(err); 
      res.send(data);
  });
});

// You can POST to /api/users/:_id/exercises with form data description, duration, and optionally date. If no date is supplied, the current date will be used.
// The response returned from POST /api/users/:_id/exercises will be the user object with the exercise fields added.

//Needs work on the date format

app.post('/api/users/:_id/exercises', (req, res)=> {
   let userID =  req.params._id;
   let description = req.body.description; 
   let duration = req.body.duration; 
   let date = req.body.date; 

   date = (date == '') ? new Date() : new Date(date);
   date = date.toDateString();


   let exercise = new Exercise({
     _id: userID, 
     description: description, 
     duration: duration, 
     date: date
   });

  
  let username = User.findOne({_id: userID}, (err, userData)=> {
     if(err) console.log(err);
     exercise.save((err, data)=>{
      if(err) console.log(err);
      return res.json({
        _id: userID, 
      username: userData.username, 
      description: description, 
      duration: duration, 
      date: date
      });
    })
   })

});

// You can make a GET request to /api/users/:_id/logs to retrieve a full exercise log of any user.

app.get('/api/users/:_id/logs', (req, res)=>{
  Exercise.find({}, (err, data)=>{
      if(err) console.log(err); 
      const number = Exercise.countDocuments();
      // console.log('This is the count ',  number)
      res.send(data, {count:number });
  });
})

// A request to a user's log GET /api/users/:_id/logs returns a user object with a count property representing the number of exercises that belong to that user.
// A GET request to /api/users/:id/logs will return the user object with a log array of all the exercises added.
// Each item in the log array that is returned from GET /api/users/:id/logs is an object that should have a description, duration, and date properties.
// The description property of any object in the log array that is returned from GET /api/users/:id/logs should be a string.
// The duration property of any object in the log array that is returned from GET /api/users/:id/logs should be a number.
// The date property of any object in the log array that is returned from GET /api/users/:id/logs should be a string.. Use the dateString format of the Date API.
// You can add from, to and limit parameters to a GET /api/users/:_id/logs request to retrieve part of the log of any user. from and to are dates in yyyy-mm-dd format. limit is an integer of how many logs to send back.

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
