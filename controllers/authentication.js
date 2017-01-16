const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../config');

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  // sub(ject) of this token is user.id
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signin = function(req, res, next) {
  // User has already had their email and password auth'd
  // We just need to give them a token
  res.send({ token: tokenForUser(req.user) });
}

exports.signup = function(req, res, next) {
  //console.log(req.body);
  const email = req.body.email;
  const password = req.body.password;

  // check if all the fields were provided
  if (!email || !password) {
    return res.status(422).send({ error: 'You must provide email and password' });
  }

  // See if a user with the given email exists
  User.findOne({ email: email }, function(err, existingUser) {
    if (err) { return next(err); }

    // if a user with email does exist, return an error
    if (existingUser) {
      return res.status(422).send({ error: 'Email is in use' }); // unprocessable entity
    }

    // If a user with email does not exist, create and save user record
    const user = new User({
      email: email,
      password: password
    });

    // save user to database
    user.save(function(err) {
      if (err) { return next(err); }

      // Respond to request indicating the user was created
      res.json( { token: tokenForUser(user) } );
    });


  });




}
