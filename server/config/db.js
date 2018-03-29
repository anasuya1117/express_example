'use strict'

var fs = require("fs");
var path = require("path");
const Sequelize = require('sequelize');
var env = process.env.NODE_ENV || "development";
var config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
var sequelize = new Sequelize(config.database, config.username, config.password, config);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//Models/tables
db.owners = require('../models/owners.js')(sequelize, Sequelize);
db.pets = require('../models/pets.js')(sequelize, Sequelize);

//Relations
db.pets.belongsTo(db.owners);
db.owners.hasMany(db.pets);

module.exports = db;
