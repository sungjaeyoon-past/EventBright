const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  question: { type: Schema.Types.ObjectId, ref: 'Question' },
  answerOrgName:{type:String},
  answerReason:{type:String},
  answerSurvey1:{type:String},
  answerSurvey2:{type:String},
  answerSurvey3:{type:String}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Participate = mongoose.model('participate', schema);

module.exports = Participate;
