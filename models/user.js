var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var userSchema = mongoose.Schema({
  name: String,
  username: String,
  email: { type: String, unique: true },
  tools: [],
  notes: [{ type: mongoose.Schema.ObjectId, ref: 'Note' }],
  picture: String,
  facebookId: String,
  githubId: String,
  wallpaper: String
});

// userSchema.set('toJSON', {
//   transform: function(doc, ret) {
//     delete ret.passwordHash;
//     delete ret.__v;
//     return ret;
//   }
// });

// userSchema.virtual('password')
//   .set(function(password) {
//     this._password = password;
//     this.passwordHash = bcrypt.hashSync(this._password, bcrypt.genSaltSync(8));
//   });

// userSchema.virtual('passwordConfirmation')
//   .set(function(passwordConfirmation) {
//     this._passwordConfirmation = passwordConfirmation;
//   });

// userSchema.path('passwordHash')
//   .validate(function(passwordHash) {
//     if(!this._password) {
//       return this.invalidate('password', 'A password is required');
//     }
//     if(this._password !== this._passwordConfirmation) {
//       return this.invalidate('passwordConfirmation', 'Passwords do not match');
//     }
//   });

// userSchema.methods.validatePassword = function(password) {
//   return bcrypt.compareSync(password, this.passwordHash);
// }

module.exports = mongoose.model("User", userSchema);
