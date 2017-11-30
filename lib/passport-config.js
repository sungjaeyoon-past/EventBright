const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const User = require('../models/user');

module.exports = function(passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) =>  {
    User.findById(id, done);
  });

  passport.use('local-signin', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  }, async (req, email, password, done) => {
    try {
      const user = await User.findOne({email: email});
      if (user && await user.validatePassword(password)) {
        return done(null, user, req.flash('success', 'Welcome!'));
      }
      return done(null, false, req.flash('danger', 'Invalid email or password'));
    } catch(err) {
      done(err);
    }
  }));

  const callbackURL=(process.env.NODE_ENV=='production')?
    'https://eventprojectcodinghack.herokuapp.com/auth/facebook/callback':
    'http://localhost:3000/auth/facebook/callback';
  passport.use(new FacebookStrategy({
    clientID : '224367318101277',
    clientSecret : 'ae81fd905ec723e4a3843088f7d30838',
    callbackURL : callbackURL,
    profileFields : ['email', 'name', 'picture']
  }, async (token, refreshToken, profile, done) => {
    try {
      var email = (profile.emails && profile.emails[0]) ? profile.emails[0].value : '';
      var picture = (profile.photos && profile.photos[0]) ? profile.photos[0].value : '';
      var name = (profile.displayName) ? profile.displayName : 
        [profile.name.givenName, profile.name.middleName, profile.name.familyName]
          .filter(e => e).join(' ');
      console.log(email, picture, name, profile.name);
      var user = await User.findOne({'facebook.id': profile.id});
      if (!user) {
        if (email) {
          user = await User.findOne({email: email});
        }
        if (!user) {
          user = new User({name: name});
          user.email =  email ? email : `__unknown-${user._id}@no-email.com`;
        }
        user.facebook.id = profile.id;
        user.facebook.photo = picture;
      }
      user.facebook.token = profile.token;
      await user.save();
      return done(null, user);
    } catch (err) {
      done(err);
    }
  }));

  passport.use('kakao-login', new KakaoStrategy({
  clientID:'6628d4817b268e1cd2d353e87111e01c',
  clientSecret:'KyDar7NKwsTZfEy0wJgiI7D7b3NG5NwQ',
  callbackURL: 'https://eventprojectcodinghack.herokuapp.com/auth/kakao/callback'
},
async (token, refreshToken, profile, done) => {
  try {
    var email = (profile.emails && profile.emails[0]) ? profile.emails[0].value : '';
    var picture = (profile.photos && profile.photos[0]) ? profile.photos[0].value : '';
    var name = (profile.displayName) ? profile.displayName : 
      [profile.name.givenName, profile.name.middleName, profile.name.familyName]
        .filter(e => e).join(' ');
    console.log(email, picture, name, profile.name);
    var user = await User.findOne({'facebook.id': profile.id});
    if (!user) {
      if (email) {
        user = await User.findOne({email: email});
      }
      if (!user) {
        user = new User({name: name});
        user.email =  email ? email : `__unknown-${user._id}@no-email.com`;
      }
      user.facebook.id = profile.id;
      user.facebook.photo = picture;
    }
    user.facebook.token = profile.token;
    await user.save();
    return done(null, user);
  } catch (err) {
    done(err);
  }
}));
};
