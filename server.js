const dotenv = require('dotenv');

dotenv.config();

const config = require('./api/config/config');

const express = require('express');

const createServer = async () => {
  const app = express();

  return app;
};

createServer()
  .then((app) => {
    require('./api/config/express')(app, config);

    app.listen(config.port, function () {
      //console.log(process.env)
      console.log(`[API] Express server is running on port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error(err.stack);
    process.exit(1);
  });
