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

module.exports =  {
  sequelize,
  OVERRIDE_CURRENT_TABLES,
  Sequelize,
}

