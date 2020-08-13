const express = require('express');
const http = require('http');
const path = require('path');
const app = express();
const server = http.Server(app);
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');


const portNumber = process.env.PORT || 5000;

// Github Auth setup

let secrets = {};
let callbackURL = '';

if (process.env.NODE_ENV == 'dev') {
    secrets = require(`${__dirname}/.env.local`);
    callbackURL = `http://localhost:${portNumber}/auth/callback`;
} else {
    secrets = process.env;
    callbackURL = `https://gitcolumns.com/auth/callback`;
}

let GITHUB_CLIENT_ID = secrets.CLIENT_KEY;
let GITHUB_CLIENT_SECRET = secrets.CLIENT_SECRET;

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: callbackURL,
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ githubId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

app.use(passport.initialize());
app.use(passport.session());
app.use(
    session({
        secret: secrets.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
);



// Routes =====

app.use('/', express.static(path.join(__dirname, '../../frontend/dist/')));

app.get('/auth',
  passport.authenticate('github', { scope: [ 'user:email' ] }),
  function(req, res){
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
  });

app.get('/auth/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });


// =====

server.listen(portNumber, function () {
    console.log(`Starting server on port ${portNumber}`);
});
