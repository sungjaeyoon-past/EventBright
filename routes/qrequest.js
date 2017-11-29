const express = require('express');
const Question = require('../models/question'); //스키마
const Answer = require('../models/answer');
const Review = require('../models/review');
const Answerrequest = require('../models/answerrequest');
const Reviewrequest = require('../models/reviewrequest');
const Participate = require('../models/participate');
const catchErrors = require('../lib/async-error');

const router = express.Router();

// 동일한 코드가 users.js에도 있습니다. 이것은 나중에 수정합시다.
function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/signin');
  }
}

router.post('/:id/answers', needAuth, catchErrors(async (req, res, next) => {
  const user=req.user;
  const answer = await Answer.findById(req.params.id);
  var answerrequest = new Answerrequest({
    author:user._id,
    answer:answer._id,
    content:req.body.content
  });
  await answerrequest.save();
  req.flash('success', 'Successfully request');
  res.redirect('back');
}));

router.post('/:id/reviews', needAuth, catchErrors(async (req, res, next) => {
  const user=req.user;
  const review = await Review.findById(req.params.id);
  var reviewrequest = new Reviewrequest({
    author:user._id,
    review:review._id,
    content:req.body.content
  });
  await reviewrequest.save();
  req.flash('success', 'Successfully request');
  res.redirect('back');
}));

module.exports = router;