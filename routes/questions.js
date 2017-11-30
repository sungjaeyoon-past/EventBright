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


function validateForm(form, options) {
  var title = form.title || "";
  var organizeName = form.organizeName || "";
  var organizeExp = form.organizeExp || "";
  var maxPeople = form.maxPeople || "";
  var startedAt = form.startedAt || "";
  var finishedAt = form.finishedAt || "";
  var content = form.content || "";
  var lat= form.content || "";

  if (!title) {
    return '제목을 입력해주세요!';
  }
  if (!organizeName) {
    return '조직이름을 입력해주세요!';
  }
  if (!organizeExp) {
    return '조직설명을 입력해주세요!';
  }
  if (!maxPeople) {
    return '최대인원을 입력해주세요!';
  }
  if(!lat){
    return '위치를 입력해주세요!';
  }
  if (!startedAt) {
    return '시작 날짜를 입력해주세요!';
  }
  if (!finishedAt) {
    return '종료 날짜를 입력해주세요!';
  }
  if (!content) {
    return '이벤트 내용을 입력해주세요!';
  }
  return null;
}

router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {};
  const term = req.query.term;
  if (term) {
    query = {$or: [
      {title: {'$regex': term, '$options': 'i'}},
      {content: {'$regex': term, '$options': 'i'}}
    ]};
  }
  const questions = await Question.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'author', 
    page: page, limit: limit
  });
  res.render('questions/index', {questions: questions, term: term, query: req.query});
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('questions/new', {question: {}});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.id);
  res.render('questions/edit', {question: question});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.id).populate('author');
  const answers = await Answer.find({question: question.id}).populate('author');
  const answersrequest = await Answerrequest.find({answers: answers.id}).populate('author');
  const reviews = await Review.find({question: question.id}).populate('author');
  const reviewsrequest = await Reviewrequest.find({reviews: reviews.id}).populate('author');
  const participates=await Participate.find({question: question.id}).populate('author');

  question.numReads++;
  await question.save();
  res.render('questions/show', {question: question, answers: answers, reviews:reviews, participates: participates,
    answersrequest: answersrequest, reviewsrequest:reviewsrequest });//
}));

router.put('/:id', catchErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    req.flash('danger', 'Not exist question');
    return res.redirect('back');
  }
  question.title = req.body.title;
  question.organizeName = req.body.organizeName;
  question.organizeExp = req.body.organizeExp;
  question.eventSort = req.body.eventSort;
  question.eventTopic = req.body.eventTopic;
  question.lat=req.body.lat,
  question.lng=req.body.lng,
  question.startedAt = req.body.startedAt;
  question.finishedAt = req.body.finishedAt;
  question.ticket = req.body.ticket;
  question.maxPeople = req.body.maxPeople;
  question.content = req.body.content;

  await question.save();
  req.flash('success', 'Successfully updated');
  res.redirect('/questions');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Question.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Successfully deleted');
  res.redirect('/questions');
}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  const err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }

  var question = new Question({
    title: req.body.title,
    author: user._id,
    content: req.body.content,
    organizeName: req.body.organizeName,
    organizeExp: req.body.organizeExp,
    eventSort:req.body.eventSort,
    eventTopic:req.body.eventTopic,
    lat:req.body.lat,
    lng:req.body.lng,
    startedAt: req.body.startedAt,
    finishedAt: req.body.finishedAt,
    ticket: req.body.ticket,
    maxPeople: req.body.maxPeople,
    survey1:req.body.survey1,
    survey2:req.body.survey2,
    survey3:req.body.survey3,
    tags: req.body.tags.split(" ").map(e => e.trim()),
  });
  console.log(question);
  await question.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/questions');
}));

router.post('/:id/answers', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  const question = await Question.findById(req.params.id);

  if (!question) {
    req.flash('danger', 'Not exist question');
    return res.redirect('back');
  }

  var answer = new Answer({
    author: user._id,
    question: question._id,
    content: req.body.content
  });
  await answer.save();
  question.numAnswers++;
  await question.save();

  req.flash('success', 'Successfully answered');
  res.redirect(`/questions/${req.params.id}`);
}));

router.post('/:id/reviews', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  const question = await Question.findById(req.params.id);

  if (!question) {
    req.flash('danger', 'Not exist question');
    return res.redirect('back');
  }

  var review = new Review({
    author: user._id,
    question: question._id,
    content: req.body.content
  });
  await review.save();
  question.numReviews++;
  await question.save();

  req.flash('success', 'Successfully answered');
  res.redirect(`/questions/${req.params.id}`);
}));

router.post('/:id/participate', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  const question = await Question.findById(req.params.id);

  if (!question) {
    req.flash('danger', 'Not exist question');
    return res.redirect('back');
  }
  var finduser = await Participate.findOne({author: req.user._id, question: question._id});
  if (!finduser){
    if(question.maxPeople>question.numParticipate){
      var participate = new Participate({
        author: user._id,
        question: question._id,
        answerOrgName:req.body.answerOrgName,
        answerReason:req.body.answerReason,
        answerSurvey1:req.body.answerSurvey1,
        answerSurvey2:req.body.answerSurvey2,
        answerSurvey3:req.body.answerSurvey3
      });
      await participate.save();
      question.numParticipate++;
      req.flash('success', '참여 신청 완료');
    }else{
      req.flash('danger', '참여 인원 초과');
    }
    await question.save();
  }else{
      req.flash('danger', '이미 신청되었음!');
  }
  res.redirect('back');
}));


module.exports = router;
