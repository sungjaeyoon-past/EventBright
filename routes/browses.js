const express = require('express');
const Browse = require('../models/browse')//스키마 정의


var router = express.Router();

router.get('/', function(req, res, next) {
   res.render('browses/browse');

});
  
  
 module.exports = router;