const Sequelize = require('sequelize');
// SQL Stuff
// Note the URL contains the username and password within it
// Had to speficfy the dialect AND had to add it to the node modules!!!!
const elephantSqlUri = 'postgres://jincewde:c5sCQ2ClMS15ak2irIc3k61G4XXwwHQA@stampy.db.elephantsql.com:5432/jincewde';
const elephantSqlOptions = {dialect: 'postgres'};
const sequelize = new Sequelize(elephantSqlUri, elephantSqlOptions);
const OVERRIDE_CURRENT_TABLES = false;

// Verify conncetion
sequelize.authenticate()
  .then(() => console.log('Connection has been established successfully.'))
  .catch(err => console.error('Unable to connect to the database:', err));

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

const User = sequelize.define('user', {
  userName: Sequelize.STRING,
  userPass: Sequelize.STRING,
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  } 
});

User.sync({force: OVERRIDE_CURRENT_TABLES})
  .then(() => console.log('Path: db/userModel.js; Function: User.sync(); Comment: User table created'))
  .catch((error) => console.log('Path: db/userModel.js; Function: User.sync(); Comment: ERROR'));

Event.sync({force: OVERRIDE_CURRENT_TABLES})
  .then(() => console.log('Path: db/eventModel.js; Function: Event.sync(); Comment: Event table created'))
  .catch((error) => console.log('Path: db/eventModel.js; Function: Event.sync(); Comment: ERROR'));

module.exports =  {
  sequelize,
  OVERRIDE_CURRENT_TABLES,
  Sequelize,
  Event,
  User,
}

