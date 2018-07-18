let { sequelize, OVERRIDE_CURRENT_TABLES, Sequelize } = require('./configurations.js');

console.log('sequelize.define is ', sequelize.define)

const User = sequelize.define('user', {
  username: Sequelize.STRING,
  userPassword: Sequelize.STRING,
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  } 
})

// If force is true, the Model will run DROP TABLE IF EXISTS, before it tries to create its own table
User.sync({force: OVERRIDE_CURRENT_TABLES})
  .then(() => console.log('Path: db/userModel.js; Function: Event.sync(); Comment: User table created', this));

module.exports = {
  User,
}