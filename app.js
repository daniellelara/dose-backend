var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var router = require('./config/routes');
var config = require('./config/app');
var server  = require('http').createServer(app);
var io      = require('socket.io')(server);
var Note = require('./models/note');

express.static(__dirname + "/public");

mongoose.connect(config.databaseUrl);

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
  origin: config.appUrl,
  credentials: true
}));

app.use('/', router);

io.on('connect', function(socket){
  Note.find(function(err, note_data) {
    console.log(note_data);
    socket.emit('notes', { notes: note_data });
  })

  console.log("User connected with socket id of:" + socket.conn.id);
  socket.on('note', function(note){
    //create new note
    var newNote = new Note({
         note: note.note,
         user: note.user
       });
       //Save it to database
       newNote.save(function(err, note){
        console.log(note);
          io.emit('note', note);
       });
   });
    socket.on('delete note', function(noteId){
      console.log("clicked", noteId);
      Note.findByIdAndRemove(noteId, function(err, note){
        if(err) console.log(err);
        return "hi";
      });
    })

  });







server.listen(config.port, function() {
  console.log("Express is listening on port " + config.port);
});