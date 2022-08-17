const convertService = require('../services/convertService');

async function convert(req, res, next) {
  try {
    const result = await convertService.convert(req, res);
    return res.status(200).send(result);
  } catch (err) {
    next(err);
  }
}

async function convertJson(req, res, next) {
  try {
    const result = await convertService.convertJson(req, res);
    // return res.status(200).send(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  convert,
  convertJson,
};
