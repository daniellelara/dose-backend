var mongoose = require('mongoose');

var noteSchema = mongoose.Schema({
  note: String,
  user: { type: mongoose.Schema.ObjectId, ref: 'User' }
});

noteSchema.pre('save', function(next){
  if(!this.user) next();
  this.model('User').findByIdAndUpdate(this.user, { $push: { notes:this._id } }, { new: true }, function(err, user) {
    next(err);
  });
});

noteSchema.pre('remove', function(next){
  this.model('User').update({ notes: this._id }, { $pull: {notes:this._id }}, { multi:true }, next);
});

module.exports = mongoose.model("Note", noteSchema);