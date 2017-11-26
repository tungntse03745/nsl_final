module.exports = function(req, res, next) {
  if (req.isAuthenticated()) {
    if(req.session.passport.user.role == 'admin'){
      return next();
    }
  }else{
    return res.json({message:'error'});
  }
};
