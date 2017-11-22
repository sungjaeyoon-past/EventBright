const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

var schema = new Schema({
  //작성자
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  //조직 이름
  organizeName: {type: String, trim:true/*, required: true*/},
  //조직 설명
  organizeExp: {type:String, trim: true/*, required:true*/},
  //제목
  title: {type: String, trim: true, required: true},
  //내용
  content: {type: String, trim: true, required: true},

  //무료=0 or 유료=1
  pay:{type:Boolean , default:0},
  //티켓 가격
  ticket:{type:Number, default:0},

  //참여자 및 참여자 수?
  
  //장소<-맵
  //시작+종료 시간
  startedAt: {type: Date, expires: 60*60*24},
  finishedAt: {type: Date, expires: 60*60*24},
  //이벤트 종류, 분야
  eventSort:{type:String , default:" - "},
  eventTopic:{type:String , default:" - "},

  //이벤트 관련 사진
  //설문

  tags: [String],
  numLikes: {type: Number, default: 0},
  numAnswers: {type: Number, default: 0},
  numReads: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Question = mongoose.model('Question', schema);

module.exports = Question;
