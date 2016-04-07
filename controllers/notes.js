var Note = require('../models/note');

//refugeesCreate
function notesCreate(req, res) {
  // add filename to user object before create
  var note = req.body;
  Note.create(note, function(err, note) {
    if(err) return res.status(500).json({ message: err });
    return res.status(200).json(note);
  });
}