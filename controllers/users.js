var User = require('../models/user');
var Note = require('../models/note');


function usersShow(req, res) {
  User.findById(req.params.id).populate('notes').exec(function(err, user) {
    console.log(user);
    if(err) return res.status(500).json({ message: err });
    if(!user) return res.status(404).send();
    return res.status(200).json(user);
  });
}
//refugeeUpdate PATCH
function usersUpdateOne(req, res) {
  User.findByIdAndUpdate(req.params.id, { $push:{ tools: req.body.tools }}, { new: true }, function(err, user) {
    console.log(user);
    if(err) return res.status(500).json({message: err});
    return res.status(200).json(user);
  });
}
function usersDeleteOne(req, res) {
  console.log("req agian and again", req.body);
  User.findByIdAndUpdate(req.params.id, { $pull:{ tools: req.body.tools }}, { new: true }, function(err, user) {
    console.log(user);
    if(err) return res.status(500).json({message: err});
    return res.status(200).json(user);
  });
}

function usersWallpaper(req, res) {
  console.log(req.file);
User.findByIdAndUpdate(req.params.id, { $set:{ wallpaper: req.file.key }}, { new: true }, function(err, user) {
    console.log(user);
    if(err) return res.status(500).json({message: err});
    return res.status(200).json(user);
  });

}

module.exports = {
  show: usersShow,
  updateOne: usersUpdateOne,
  deleteOne: usersDeleteOne,
  wallpaper: usersWallpaper
}