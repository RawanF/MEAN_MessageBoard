const express = require("express");
const mongoose = require('mongoose');
var session = require('express-session')
const flash = require('express-flash');
mongoose.connect('mongodb://localhost/MessageBoard', { useNewUrlParser: true });
const CommentSchema = new mongoose.Schema({
    name: { type: String, required: [true, "comment must have a user name"] },
    comment: { type: String, required: [true, "comment must have content"], minlength: [3, "comment must at least 3 charachters"] },
}, { timestamps: true });

const MessageSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Message must have a user name"] },
    message: { type: String, required: [true, "Message must have content"], minlength: [3, "Meassage must at least 3 charachters"] },
    comments: [CommentSchema]
}, { timestamps: true });

const Message = mongoose.model('Message', MessageSchema);
const Comment = mongoose.model('Comment', CommentSchema);
const app = express();
app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))
app.use(flash());
app.use(express.urlencoded({ extended: true }));//send all messages
app.get('/', (req, res) => {
    Message.find()
        .then(data => res.render("./index", { messages: data }))
        .catch(err =>  res.json(err));
});

app.post('/newMessage', (req, res) => {  //action for Post Message form 
    const Msg = new Message();
    Msg.name = req.body.name;
    Msg.message = req.body.msg;
    Msg.save()// inserts the data into the database then returns a promise
        .then(newMSGData => console.log('Message Created: ', newMSGData))//will execute upon successfully inserting data in the database
        .catch(err => {
            console.log("We have an error!", err);
            // adjust the code below as needed to create a flash message with the tag and content you would like
            for (var key in err.errors) {
                req.flash('AddMessage', err.errors[key].message);
            }
        });
    res.redirect('/');
});

app.post('/newComment', (req, res) => {  //action for Post Comment form 
    const c = new Comment();
    c.name = req.body.name;
    c.comment = req.body.comment;
    c.save()// inserts the data into the database then returns a promise
        .then(newCommentData => console.log('Comment Created: ', newCommentData))//will execute upon successfully inserting data in the database
        .catch(err => {
            console.log("We have an error!", err);
            // adjust the code below as needed to create a flash message with the tag and content you would like
            for (var key in err.errors) {
                req.flash('AddComment', err.errors[key].message);
            }
        }); Message.findOneAndUpdate({ _id: req.body.MSGid }, { $push: { comments: c } })
            .then(AddComment => console.log('Comment Added to the Message: ', AddComment))//will execute upon successfully inserting data in the database
            .catch(err => console.log(err));//will execute if there is an error
    res.redirect('/');
});

app.use(express.static(__dirname + "/static"));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.listen(8000, () => console.log("listening on port 8000")); 