var checkRole = require('../services/checkRole.js').check;
module.exports = {
	getUserProfile_promise: function (req) {
		return new Promise(function(fullfill, reject){
			var role = checkRole(req);
			if(role == 'guest'){
				return fullfill(null);
			}else {
				var userId = req.session.passport.user.id;
				if(req.session.passport.user.role == 'student'){
					Student.findOne({id:userId}).exec(function(err, user){
						if(user){
							return fullfill(user);
						}else{
							return fullfill(null);
						}
					})
				}
			}
		});
	}
};

