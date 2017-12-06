var express = require('express');
const User = require('../models/user');
var router = express.Router();
const catchErrors = require('../lib/async-error');

/* GET home page. */
router.get('/', catchErrors(async (req, res, next) => {
  const users = await User.find({});
  res.render('index', {users: users});
}));
//이메일 입력창
router.get("/reset-password",catchErrors(async(req,res,next)=>{
  res.render("forgot");
}));

//이메일 입력후 넘버발송
router.post("/reset-password/reset",catchErrors(async(req,res,next)=>{
  var useremail=req.body.email;
  var finduser=await User.findOne({email:useremail});
  if(!finduser){
    req.flash('danger', '이메일을 가진 사용자가 없습니다!');
    res.redirect('back');
  }
  var randomNumber=parseInt(Math.random()*100000000);
  finduser.resetNumber=randomNumber;//랜덤넘버 발급
  await finduser.save();
  //이메일 전송 + randomnumber
  var mailgun = require("mailgun-js");
  var api_key = 'key-ffa4238a4a33543e31b73b58c0049efa';
  var DOMAIN = 'sandbox407f003c6b2b4a29b1a770615a1000f0.mailgun.org';
  var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});
  var data = {
    from: 'Excited User <me@samples.mailgun.org>',
    to: useremail,
    subject: '패스워드 재설정 이메일',
    text: '넘버는  ' + randomNumber + '  입니다. 입력창에서 입력해주세요'
  };
  console.log(data);
  await mailgun.messages().send(data, function (error, body) {
  });
  res.render("forgotinputnum");/*입력창으로*/ 
}));

//발송된 넘버 확인
router.post("/reset-password/submit",catchErrors(async(req,res,next)=>{
  var useremail=req.body.email;
  var finduser=await User.findOne({email:useremail});
  var number=finduser.resetNumber;
  //console.log(number+"------\n");
  if(!finduser){
    req.flash('danger', '이메일이 잘못되었습니다!');
    res.render("forgotinputnum");
  }
  //console.log("설정된거:"+finduser.resetNumber+"\n");
  //console.log("날라간거:"+req.body.inputnumber+"\n");
  if(finduser.resetNumber==req.body.inputnumber){//맞음 -> edit
    finduser.password = await finduser.generateHash(req.body.password);
    await finduser.save();
    req.flash('success', '비밀번호가 재설정되었습니다.');
    res.render("index");
  }else{
    req.flash('danger', '번호가 다릅니다!');
    res.render("forgotinputnum");
  }
}));




/*입력후 보낼곳*/

/*비밀번호 재설정*/



// 1. 아래의 AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY 는 
//    AWS의 IAM에서 새로운 사용자를 추가해서 받아야 함!
// 2. S3_BUCKET은 AWS의 S3에서 새로 생성해서 만들어야 함
// 3. S3 bucket은 CORS 설정이 필요함
// 4. IAM의 user에게는 S3를 access할 수 있는 permission을 줘야 함!

//=============================
// 환경변수 설정방법
//=============================
// for Mac
// export AWS_ACCESS_KEY_ID=AKIAI3SWZQ2T????????
// export AWS_SECRET_ACCESS_KEY=Z3d??????????V637h1aDwNMFCIQYRGgL4lpuu+I
// export S3_BUCKET=mjoverflow

// for PC
// set AWS_ACCESS_KEY_ID=AKIAI3SWZQ2T???????? 
// set AWS_SECRET_ACCESS_KEY=Z3d??????????V637h1aDwNMFCIQYRGgL4lpuu+I
// set S3_BUCKET=mjoverflow

// for HEROKU
// heroku config:set AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy
// heroku config:set S3_BUCKET=mjoverflow

const aws = require('aws-sdk');
const S3_BUCKET = process.env.S3_BUCKET;
console.log(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
const uuidv4 = require('uuid/v4');

router.get('/s3', function(req, res, next) {
  const s3 = new aws.S3({region: 'ap-northeast-2'});
  const filename = req.query.filename;
  const type = req.query.type;
  const uuid = uuidv4();
  const params = {
    Bucket: S3_BUCKET,
    Key: uuid + '/' + filename,
    Expires: 900,
    ContentType: type,
    ACL: 'public-read'
  };
  console.log(params);
  s3.getSignedUrl('putObject', params, function(err, data) {
    if (err) {
      console.log(err);
      return res.json({err: err});
    }
    res.json({
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${uuid}/${filename}`
    });
  });
});

module.exports = router;
