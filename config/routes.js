var router = require('express').Router();
var jwt = require('jsonwebtoken');
var authenticationController = require('../controllers/authentication');
var usersController = require('../controllers/users');
var secret = require('../config/app').secret;
var multer = require('multer');
var s3 = require('multer-s3');
var uuid = require('uuid');


// custom JWT middleware
function secureRoute(req, res, next) {
  if(!req.headers.authorization) return res.status(401).json({ message: 'Unauthorized' });

  var token = req.headers.authorization.replace('Bearer ', '');

  jwt.verify(token, secret, function(err, user) {
    if(!user) return res.status(401).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

var upload = multer({
  storage: s3({
    // the folder within the bucket
    dirname: 'uploads',
    // set this to your bucket name
    bucket: process.env.AWS_BUCKET_NAME,
    // your AWS keys
    secretAccessKey: process.env.AWS_SECRET_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    // the region of your bucket
    region: 'eu-west-1',
    // IMPORTANT: set the mime type to that of the file
    contentType: function(req, file, next) {
      next(null, file.mimetype);
    },
    // IMPORTANT: set the file's filename here
    // ALWAYS CHANGE THE FILENAME TO SOMETHING RANDOM AND UNIQUE
    // I'm using uuid (https://github.com/defunctzombie/node-uuid)
    filename: function(req, file, next) {
      // Get the file extension from the original filename
      var ext = '.' + file.originalname.split('.').splice(-1)[0];
      // create a random unique string and add the file extension
      var filename = uuid.v1() + ext;
      next(null, filename);
    }
  })
});
router.route('/users/:id')
  .patch(usersController.updateOne)
  .get(usersController.show);

router.route('/users/:id/tool')
  .patch(usersController.deleteOne);

router.route('/users/:id/image')
  .put(upload.single('file'), usersController.wallpaper);


router.post('/register', authenticationController.register);
router.post('/login', authenticationController.login);

router.post('/auth/facebook', authenticationController.facebook);
router.post('/auth/github', authenticationController.github);

module.exports = router;