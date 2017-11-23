var express = require('express');
const User = require('../models/user');
var router = express.Router();
const catchErrors = require('../lib/async-error');


router.get('/', catchErrors(async (req, res, next) => {
  const users = await User.find({});
  res.render('recommend/index');
}));


module.exports = router;
