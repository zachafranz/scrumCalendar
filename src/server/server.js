const express = require('express');
const path = require('path');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// SQL Stuff
// Note the URL contains the username and password within it
// Had to speficfy the dialect AND had to add it to the node modules!!!!
const elephantSqlUri = 'postgres://jincewde:c5sCQ2ClMS15ak2irIc3k61G4XXwwHQA@stampy.db.elephantsql.com:5432/jincewde';
const elephantSqlOptions = {dialect: 'postgres'};
const sequelize = new Sequelize(elephantSqlUri, elephantSqlOptions);

// Verify conncetion
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const OVERRIDE_CURRENT_TABLES = false;

// This could (and should) be modularized
// Create models (tables)
const User = sequelize.define('user', {
  userName: Sequelize.STRING,
  userPass: Sequelize.STRING,
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }
});

const Event = sequelize.define('event', {
  eventDate: Sequelize.DATE,
  eventName: Sequelize.STRING,
  eventDesc: Sequelize.STRING,
  userId: Sequelize.INTEGER,
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }
});


// Sync (Add) Models (Tables) to database
// If force is true, the Model will run DROP TABLE IF EXISTS, before it tries to create its own table
User.sync({force: OVERRIDE_CURRENT_TABLES}).then(() => {
  console.log('User table created', this);
});

Event.sync({force: OVERRIDE_CURRENT_TABLES}).then(() => {
  console.log('Event table created', this);
});


// Express Stuff
const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/', express.static(path.join(__dirname, "./../../dist")))  


// All of the following REST middlware should probably be modularized
app.post('/signup', (req, res) => {
  User
    .create({
      userName: req.body.userName,
      userPass: req.body.userPass
    })
    .then((savedObj) => {
      console.log('successfully saved an user', savedObj.dataValues);
      res.cookie('userId', savedObj.dataValues.id);
      res.send('Saved User');
    })
    .catch((err) => {
      console.log('unable to save user', err);
      res.send('fuck');
    });
})


app.post('/login', (req, res) => {
  console.log('In login user with', req.body); // req.cookies.userId

  User
    .findOne({
      where: { userName: req.body.userName }
    })
    .then((results) => {
      if (results === null) return res.send('Nope. Try Again'); // Did not find any user by that username

      console.log('results of findOne', results.dataValues); // nned to test userPass
      if (req.body.userPass !== results.dataValues.userPass) return res.send('Nope. Try Again Loser');  // Wrong Pass
      
      res.cookie('userId', results.dataValues.id);
      res.send('Yea sick login');
    })
})


app.get('/event', (req, res) => {
  console.log('In get event with', req.cookies); // req.cookies.userId

  Event
    .findAll({
      where: { userId: req.cookies.userId }
    })
    .then((data) => {
      console.log('Found all the stuff', data);
      res.send('Got data');
    })
});


app.post('/event', (req, res) => {
  console.log('In post event with', req.body, 'and', req.cookies);

  // Example of using whitelisting (?) as a small security layer
  Event
    .create({
      eventDate: new Date(req.body.eventDate),
      eventName: req.body.eventName,
      eventDesc: req.body.eventDesc,
      userId: req.cookies.userId
    })
    .then((savedObj) => {
      console.log('successfully saved an event', savedObj);
      res.send('Saved Event');
    })
    .catch((err) => {
      console.log('unable to save event', err);
      res.send('fuck');
    });
});


app.put('/event', (req, res) => {
  console.log('In put event with', req.body);
  
  Event
    .update(
      {
        eventDate: new Date(req.body.eventDate),
        eventName: req.body.eventName,
        eventDesc: req.body.eventDesc
      },
      {
      	where: { id: req.body.eventId },
      	returning: true
      }
    )
    .then((updateObj) => {
      // If the uuid does not match anything, updatedObj is return with first argument === 0
      console.log('successfully saved an event', updateObj);
      res.send('Updated Obj');
    })
});


app.delete('/event', (req, res) => {
  console.log('In delete event with', req.body);

  Event
    .destroy(
      { where: { id: req.body.eventId } }
    )
    .then((numberDeleted) => {
      // If the uuid does not match anything, updatedObj is return with first argument === 0 (as in no objects updated)
      console.log(`successfully deleted ${numberDeleted} events`);
      res.send('Deleted Events');
    })
});


app.listen(3000, (err) => {
    if (err) {console.log('error in connecting to port 3000:', err)}
    else {console.log('Listening on port 3000!')}
})