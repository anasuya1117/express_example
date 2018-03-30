'use strict';

const express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  db = require('./server/config/db.js'),
  router = require('./server/router/index'),
  Prometheus = require('prom-client')

const app = express();
const PORT = 8000;


const httpRequestDurationMicroseconds = new Prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.10, 5, 15, 50, 100, 200, 300, 400, 500]  // buckets for response time from 0.1ms to 500ms
})


app.use(morgan('combined'));
app.use(bodyParser.json());

//Runs before each requests
app.use((req, res, next) => {
  res.locals.startEpoch = Date.now()
  res.header('Content-Type', 'application/json');
  next();
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', Prometheus.register.contentType)
  res.end(Prometheus.register.metrics())
})



// Runs after each requests
app.use((req, res, next) => {
  const responseTimeInMs = Date.now() - res.locals.startEpoch

  httpRequestDurationMicroseconds
    .labels(req.method, req.route, res.statusCode)
    .observe(responseTimeInMs)
  next()
})
Prometheus.collectDefaultMetrics();

router(app, db);
//drop and resync db with { force: true }
db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log('Express listening on port:', PORT);
  });
});
