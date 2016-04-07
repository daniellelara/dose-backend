module.exports = {
  facebook: {
    accessTokenUrl: 'https://graph.facebook.com/v2.5/oauth/access_token',
    profileUrl: 'https://graph.facebook.com/v2.5/me?fields=id,email,name,picture.width(200).height(200)'
  },
  github: {
    accessTokenUrl: 'https://github.com/login/oauth/access_token',
    profileUrl: 'https://api.github.com/user'
  }
};