var User = require('../models/user');
var jwt  = require('jsonwebtoken');
var secret = require('../config/app').secret;
var oauth = require('../config/oauth');
var request = require('request-promise');
var config = require('../config/app');

function register(req, res) {
  User.create(req.body, function(err, user) {
    // tidy up mongoose's awful error messages
    if(err) {
      if(err.code && (err.code === 11000 || err.code === 11001)) {
        var attribute = err.message.match(/\$([a-z]+)_/)[1];
        err = "An account with that " + attribute + " already exists";
      }
      return res.status(400).json({ message: err.toString() });
    }

    var payload = { _id: user._id, name: user.name };
    var token = jwt.sign(payload, secret, "24h");
    return res.status(200).json({ message: "Thanks for registering", user: user, token: token });
  });
}

function login(req, res) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if(err) return res.send(500).json({ message: err });
    if(!user || !user.validatePassword(req.body.password)) return res.status(401).json({ message: "Unauthorized" });

    var payload = { _id: user._id, name: user.name };
    var token = jwt.sign(payload, secret, "24h");
    return res.status(200).json({ message: "Login successful", user: user, token: token });
  });
}

function facebook(req, res) {
  
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: process.env.FACEBOOK_API_SECRET,
    redirect_uri: config.appUrl + "/"
  };
  console.log(params);
  // step 1, we make a request to facebook for an access token
  request
    .get({
      url: oauth.facebook.accessTokenUrl,
      qs: params,
      json: true
    })
    .then(function(accessToken) {
      // step 2, we use the access token to get the user's profile data from facebook's api
      console.log(accessToken);
      return request.get({
        url: oauth.facebook.profileUrl,
        qs: accessToken,
        json: true
      });
    })
    .then(function(profile) {
      console.log(profile);
      // step 3, we try to find a user in our database by their email
      return User.findOne({ email: profile.email })
        .then(function(user) {
          // if we find the user, we set their facebookId and picture to their profile data
          if(user) {
            user.facebookId = profile.id;
            user.picture = user.picture || profile.picture.data.url;
          }
          else {
            // otherwise, we create a new user record with the user's profile data from facebook
            user = new User({
              facebookId: profile.id,
              name: profile.name,
              picture: profile.picture.data.url,
              email: profile.email, 
              tools: []
            });
          }
          // either way, we save the user record
          return user.save();
        });
    })
    .then(function(user) {
      // step 4, we create a JWT and send it back to our angular app
      var payload = { _id: user._id, name: user.name, picture: user.picture, tools: user.tools };
      var token = jwt.sign(payload, config.secret, { expiresIn: '24h' });
      return res.send({ token: token, user: payload });
    })
    .catch(function(err) {
      // we handle any errors here
      return res.status(500).json({ error: err });
    });
}

function github(req, res) {

  var params = {
    client_id: process.env.GITHUB_API_KEY,
    client_secret: process.env.GITHUB_API_SECRET,
    code: req.body.code
  };
  //make a request for an access token
  //make a re

  request.post({
    url: oauth.github.accessTokenUrl,
    qs: params,
    json: true
  })
  .then(function(response){

    //request returns access token
    //make a request for the users data profile
    return request.get({
      url: oauth.github.profileUrl + "?access_token=" + response.access_token,
      json: true,
      headers: {'User-Agent': 'Request-Promise'}
    });
  })
  .then(function(profile){
    console.log(profile);
    //now we find or create a new user with these github credentials
    return User.findOne({username: profile.username})
      .then(function(user){
        if(user) {
          user.githubId = profile.id;
          user.picture = user.picture || profile.avatar_url;
        } else {

          user = new User({
            githubId: profile.id,
            username: profile.username,
            name: profile.name,
            password: profile.id,
            picture: profile.avatar_url,
            email: profile.email,
            tools: []
          })
        }
        console.log(user)
        return user.save();
      });
  })
  .then(function(user){
    console.log("user sent", user);
    //lets send a token to the front end
    var payload = { _id: user._id, name: user.name, picture: user.picture, tools: user.tools };
    var token = jwt.sign(payload, config.secret, { expiresIn: '24h' });
    return res.send({ token: token, user: payload });

  })
  .catch(function(err) {
    // we handle any errors here
    return res.status(500).json({ error: err });
  });
}

module.exports = {
  login: login,
  register: register,
  facebook: facebook,
  github: github 
};