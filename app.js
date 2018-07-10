var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    methodOverride = require('method-override'),
    expressSanitizer = require('express-sanitizer');

// connect to db:
mongoose.connect("mongodb://localhost/expressblog");

// expose our public folder:
app.use(express.static('public'));

// get form submission data easily:
app.use(bodyParser.urlencoded({ extended: true }));

// enable sanitizing of user-submitted form data. must be AFTER bodyParser and before routes:
app.use(expressSanitizer());

// enable PUT and DELETE requests by appending `?_method=<put|delete>` on form action:
app.use(methodOverride('_method'));

// create the blog data model:
var blogSchema = mongoose.Schema({
  title: String,
  image: { type: String, default: '/img/placeholder.jpg' },
  body: String,
  created: { type: Date, default: Date.now }
});
var Blog = mongoose.model('Blog', blogSchema);

// routes

// home
app.get('/', function(req, res){
  res.redirect('/blogs');
});

// index
app.get('/blogs', function(req, res){
  Blog.find({}, function(err, data){
    res.render('index.ejs', {
      blogs: data
    });
  });
});

// new
app.get('/blogs/new', function(req, res){
  res.render('new.ejs');
});

// create
app.post('/blogs', function(req, res){
  req.body.blog.body = req.sanitize(req.body.blog.body); // sanitize the form's "body" field
  Blog.create(req.body.blog, function(err, data){
    if (err) {
      console.log(err);
      res.render('new.ejs');
    } else {
      res.redirect('/blogs');
    }
  });
});

// show
app.get('/blogs/:id', function(req, res){
  Blog.findById(req.params.id, function(err, data){
    if (err) {
      console.log(err);
      res.redirect('/blogs');
    } else {
      res.render('show.ejs', {
        blog: data
      });
    }
  });
});

// edit
app.get('/blogs/:id/edit', function(req, res){
  Blog.findById(req.params.id, function(err, data){
    if (err) {
      console.log(err);
      res.redirect('/blogs/' + req.params.id);
    } else {
      res.render('edit.ejs', {
        blog: data
      });
    }
  });
});

// update
app.put('/blogs/:id', function(req, res){
  req.body.blog.body = req.sanitize(req.body.blog.body); // sanitize the form's "body" field
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, data){
    if (err) {
      console.log(err);
    }
    res.redirect('/blogs/' + req.params.id);
  });
});

// delete
app.delete('/blogs/:id', function(req, res){
  Blog.findByIdAndRemove(req.params.id, function(err){
    if (err) {
      console.log(err);
    }
    res.redirect('/blogs');
  });
});

// route 404s to blogs index:
app.get('*', function(req, res){
  res.render('/blogs');
});

// start the server:
app.listen(3000, function(){
  console.log('An Express JS server is running on port 3000');
});
