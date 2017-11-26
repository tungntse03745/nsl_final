module.exports = function(req, res, next) {
  if (req.isAuthenticated()) {
  		if(req.session.passport.user.role == 'teacher')
    		return next();
  }
  return res.redirect('/teacher/login');
};
