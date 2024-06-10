var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require("./post");
const passport = require('passport');
const upload = require("./multer");

const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { nav: false });
});
router.get('/register', function (req, res) {
  res.render('register', { nav: false });
});

router.get('/profile', isLoggedIn, async function (req, res) {
  const user1 = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts"); //you will get all images
  res.render('profile', { user1, nav: true });
});
router.get('/feed', isLoggedIn, async function (req, res) {
  const user1 = await userModel.findOne({ username: req.session.passport.user });
 const posts=await postModel.find()
  .populate("user");

  res.render("feed",{user,posts,nav:true});
});

router.get('/show/posts', isLoggedIn, async function (req, res) {
  const user1 = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts"); //you will get all images
  res.render('show', { user1, nav: true });
});


router.get('/add', isLoggedIn, async function (req, res) {
  const user1 = await userModel.findOne({ username: req.session.passport.user });
  res.render('add', { user1, nav: true });
});


router.post('/createpost', isLoggedIn, upload.single("postImage"), async function (req, res) {
  const user1 = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.create({
    user: user1._id,
    image: req.file.filename,
    title: req.body.title,
    description: req.body.description,
  });
  user1.posts.push([post._id]);
  await user1.save();
  res.redirect("/profile");
});

router.post('/fileupload', isLoggedIn, upload.single("image"), async function (req, res) {
  const user1 = await userModel.findOne({ username: req.session.passport.user });
  user1.profileImage = req.file.filename;
  await user1.save();
  res.redirect("/profile");
});


router.post('/register', function (req, res, next) {
  const userData = new userModel({
    username: req.body.username,
    email: req.body.email,
    contact: req.body.contact,
    name:req.body.name,
  });
  userModel.register(userData, req.body.password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile")
      });
    });
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/",
}), function (req, res, next) {

});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  })
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

module.exports = router;
