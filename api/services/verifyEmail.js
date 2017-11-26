var Cryptr = require('cryptr'),
    cryptr = new Cryptr('daylakeymahoaverifyemail');
var mail = require('../services/sendMail.js');

var verifyMail ={
	mailOptions:{
	    from: 'NanoSkillsLearning 👻', // sender address
	    subject: 'NanoSkillsLearning ✔', // Subject line
	    text: 'Hello world ?', // plain text body
	},
	templateUrl:require('path').join(__dirname, '../../views/email/verify-register'),
	render:{}

}
module.exports = {
	sendVerify: function(user,linkVerify, cb) {
		var hash = cryptr.encrypt(user.id + '-' + user.email);
		verifyMail.mailOptions.to = user.email;
		verifyMail.render = {
			fullname: user.fullname,
			linkVerify: linkVerify + '?verifycode=' + hash,
		}
		mail.sendMail(verifyMail, function(err){
			if(err)	return cb(err);
			return cb();
		});
	},
	verifyCode: function(code, cb) {
		 try{
		 	decryptedString = cryptr.decrypt(code);
		 	cb(decryptedString.split('-')[0]);
		 }catch(e){
		 	cb()
		 }
		 //console.log(decryptedString);
	}
};
 
// var encryptedString = cryptr.encrypt('bacon'),
//     decryptedString = cryptr.decrypt(encryptedString);

