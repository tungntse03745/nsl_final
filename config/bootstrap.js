/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {

	var createAdminDefault = function(){
		return new Promise(function(fullfill, reject){
			Admin.findOrCreate({email:'kenh14@gmail.com'}
			,{email:'kenh14@gmail.com',fullname:'Admin', password:'abc123', role:'admin', avatar:'/images/avatar-default.png'})
			.exec(function(err, user){
				return fullfill();
			});
		})
	}
	createAdminDefault().then(function(){
		cb();
	})
	
};
