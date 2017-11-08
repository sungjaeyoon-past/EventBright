const express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('browses/browse');
  });
  
  
  module.exports = router;