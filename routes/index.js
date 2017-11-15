var express = require('express');
const User = require('../models/user');
var router = express.Router();
const catchErrors = require('../lib/async-error');



/* GET home page. */
router.get('/', catchErrors(async (req, res, next) => {
  const users = await User.find({});
  res.render('index', {users: users});
}));


module.exports = router;
