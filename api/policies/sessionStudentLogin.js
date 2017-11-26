module.exports = function(req, res, next) {
  if (req.isAuthenticated()) {
  		if(req.session.passport.user.role == 'student')
    		return next();
  }
  return res.redirect('/');
};
