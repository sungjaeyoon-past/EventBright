var express = require('express');
const User = require('../models/user');
const Question = require('../models/question');
const Review = require('../models/review');
var router = express.Router();
const catchErrors = require('../lib/async-error');


router.get('/interest', catchErrors(async (req, res, next) => {
  const users = await User.find({});
  const questionParticipateMax = await Question.find().sort({numParticipate:-1}).limit(5);
  const questionReviewMax = await Question.find().sort({numReviews:-1}).limit(5);
  const questionReadMax = await Question.find().sort({numReads:-1}).limit(5);
  res.render('recommend/index',{questionParticipateMax:questionParticipateMax ,
    questionReviewMax:questionReviewMax, questionReadMax:questionReadMax });
}));


module.exports = router;
