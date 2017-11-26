module.exports = function(req, res, next) {
  if (req.isAuthenticated()) {
    if(req.session.passport.user.role == 'admin'){
    	return res.redirect('/admin');
    }else{
    	return res.notFound();
    }
  }else{
    return next();
  }
};
