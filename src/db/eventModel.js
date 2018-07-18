 let { sequelize, OVERRIDE_CURRENT_TABLES, Sequelize } = require('./configurations.js');

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

// If force is true, the Model will run DROP TABLE IF EXISTS, before it tries to create its own table
Event.sync({force: OVERRIDE_CURRENT_TABLES})
  .then(() => console.log('Path: db/eventModel.js; Function: Event.sync(); Comment: Event table created', this));

module.exports = {
  Event,
}