module.exports = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.MONGOLAB_URI || 'mongodb://localhost/dose-app',
  secret: 'spoonfullofsugarhelpsthemedicinegodown',
  appUrl: process.env.NODE_ENV === 'production' ? 'wdi-dose.herokuapp.com' : 'http://localhost:8000/'
}