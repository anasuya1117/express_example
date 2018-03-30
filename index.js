'use strict';

const express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  db = require('./server/config/db.js'),
  router = require('./server/router/index');

const app = express();
const PORT = 8000;

app.use(morgan('combined'));
app.use(bodyParser.json());

//Runs before each requests
app.use((req, res, next) => {
  res.locals.startEpoch = Date.now()
  res.header('Content-Type', 'application/json');
  next();
});

router(app, db);
//drop and resync db with { force: true }
db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log('Express listening on port:', PORT);
  });
});
