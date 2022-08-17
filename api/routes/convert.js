const express = require('express'),
  router = express.Router(),
  convertController = require('../controllers/convertController');

router.post('/convert', convertController.convert);

router.post('/convertJson', convertController.convertJson);
module.exports = router;
