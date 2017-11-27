/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var passport = require('passport');
module.exports = {
	logout: function(req, res) {
		req.logout();
		res.redirect('/');
	},
	facebook: function(req, res) {
		passport.authenticate('facebook', { failureRedirect: '/', scope: ['email','public_profile'] }, function(err, user){
			req.logIn(user, function(err){
				if (err) {
					return res.badRequest(err);
				}
				return res.redirect('/mycourse');
			});
		})(req, res);
	},
	google: function(req, res) {
		passport.authenticate('google', { failureRedirect: '/', scope: ['email'] }, function(err, user){
			req.logIn(user, function(err){
				if (err) {
					return res.badRequest(err);
				}
				return res.redirect('/mycourse');
			});
		})(req, res);
	},
	studentLocal: function (req, res) {
		 passport.authenticate('student-local', { successRedirect: '/',failureRedirect: '/', failureFlash: true},function(err, user, info){
		 	if(err){
		 		return res.json({message:'error'});
		 	}
		 	if(!user){
		 		return res.json({message:info.message});
		 	}
			req.logIn(user, function(err){
				if (err) {
		 			console.log(err)
					return res.json({message:'error'});
				}
				req.session.cookie.maxAge = 3 * 24 * 60 * 60 * 1000; //30 * 24 * 60 * 60 * 1000;
			    return res.json({message:'success'});
			});
		})(req, res);
	},

	teacherLocal: function (req, res) {
		 passport.authenticate('teacher-local', { successRedirect: '/',failureRedirect: '/', failureFlash: true},function(err, user, info){
		 	if(err){
		 		return res.json({message:'error'});
		 	}
		 	if(!user){
		 		return res.json({message:info.message});
		 	}
			req.logIn(user, function(err){
				if (err) {
		 			console.log(err)
					return res.json({message:'error'});
				}
				req.session.cookie.maxAge = 3 * 24 * 60 * 60 * 1000; //30 * 24 * 60 * 60 * 1000;
			    return res.json({message:'success'});
			});
		})(req, res);
	},

	adminLocal: function (req, res) {
		 passport.authenticate('admin-local', { successRedirect: '/',failureRedirect: '/', failureFlash: true},function(err, user, info){
		 	if(err){
		 		return res.json({message:'error'});
		 	}
		 	if(!user){
		 		return res.json({message:info.message});
		 	}
			req.logIn(user, function(err){
				if (err) {
		 			console.log(err)
					return res.json({message:'error'});
				}
				req.session.cookie.maxAge = 3 * 24 * 60 * 60 * 1000;
			    return res.json({message:'success'});
			});
		})(req, res);
	},
};

