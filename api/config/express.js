var express = require('express');
var morgan = require('morgan');
const bodyParser = require('body-parser');
var path = require('path');

const convertRoutes = require('../routes/convert');

const { ApplicationError } = require('../core/applicationErrors');

module.exports = function (app, config) {
  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  app.use(morgan('dev')); // combined //*logs requests to console
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
  app.use(bodyParser.json({ limit: '50mb' }));
  //   app.use(express.json({limit: '50mb'}));
  // app.use(express.urlencoded({limit: '50mb'}));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    //res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
      return res.status(200).json({});
    }
    next();
  });

  app.use(`/api/v${config.apiVersion}`, convertRoutes);

  // global error handler
  // eslint-disable-next-line no-unused-vars
  app.use(function (err, req, res, next) {
    console.error(`Error: ${err.name}`, err);

    if (err.name === 'BadRequestError') {
      // custom application error
      //return res.status(400).json({ message: err });
      return res.status(400).json(new ApplicationError(err));
    }

    if (err instanceof Array) {
      return res.status(500).json(new ApplicationError(err));
    }

    if (err.name === 'UnauthorizedError') {
      // jwt authentication error
      return res.status(401).json({ message: 'Invalid Token' });
    }

    if (err.name === 'ForbiddenError') {
      // jwt authentication error
      //return res.status(403).json({ message: 'Invalid Token' });
      return res.status(403).json(new ApplicationError(err));
    }

    if (err.name === 'NotFoundError') {
      return res.status(404).json(new ApplicationError(err));
    }

    return res.status(500).json(new ApplicationError(err));
  });
};
