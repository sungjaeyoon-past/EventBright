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
 // console.log(finduser);
  if(!finduser){
    req.flash('danger', '이메일을 가진 사용자가 없습니다!');
    res.redirect('back');
  }
  var randomNumber=parseInt(Math.random()*100000000);
  console.log(randomNumber);
  finduser.resetNumber=randomNumber;//랜덤넘버 발급
  console.log(finduser);
  //이메일 전송 + randomnumber

  var data = {
    from: 'Excited User <me@samples.mailgun.org>',
    to: useremail,
    subject: '리셋넘버는' + randomNumber + "입니다. 입력창에서 입력해주세요",
    text: 'Testing some Mailgun awesomness!'
  };

  mailgun.messages().send(data, function (error, body) {
    console.log(body);
  });

  req.flash("success","이메일로 온 인증번호를 입력해주세요!")
  res.render("reset");/*입력창으로*/ 
}));
//발송된 넘버 확인
router.post("/reset-password/submit",catchErrors(async(req,res,next)=>{
  var useremail=req.body.email;
  var finduser=await User.findOne({email:useremail});
  if(!finduser){
    req.flash('danger', '이메일이 잘못되었습니다!');
    res.redirect('back');
  }
  if(finduser.resetNumber==req.body.inputnumber){//맞음 -> edit로 보냄
    
  /*
  user.password = await user.generateHash(req.body.password);
  await user.save();
  req.flash('success', '비밀번호가 재설정되었습니다.');
  res.redirect('/');
   */ 
  }else{
    req.flash('danger', '넘버가 다릅니다!');
    res.redirect('back');
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
