/**
 * TeacherController
 *
 * @description :: Server-side logic for managing teachers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var verify =  sails.config.verify;
module.exports = {
	registerTeacher: function (req, res) {
		var newTeacher = {
				fullname: req.body.fullname,
				age: req.body.age,
				phone: req.body.phone,
				address: req.body.address,
				indentityCard: req.body.indentityCard,
				job: req.body.job,
				description: req.body.description,
				email: req.body.email,
				password: req.body.password,
				avatar:'/images/avatar-default.png'
		};
		Teacher.find({
			email: req.body.email.trim()
		}).then(function (teachers) {
			if(teachers.length != 0 && teachers[0].isActive){
				return res.json({message:'email_exist'})
			}
			if(!teachers.length){
				Teacher.create(newTeacher).then(function(teacher){
					require('../services/verifyEmail.js').sendVerify(teacher,verify.teacher_link, function(err){
						if(err){
							return res.json({message:'error'});
						}else{
							return res.json({message:'success'})
						}
					});
				});
			}else{
				Teacher.update({id:teachers[0].id},newTeacher).then(function(teacher){
					require('../services/verifyEmail.js').sendVerify(teacher[0],verify.teacher_link, function(err){
						if(err){
							return res.json({message:'error'});
						}else{
							return res.json({message:'success'})
						}
					});
				});
			}
			
		});
	},
	verifyTeacher: function(req, res){
		if(!req.query) return res.notFound();
		if(!req.query.verifycode) return res.notFound();
		require('../services/verifyEmail.js').verifyCode(req.query.verifycode, function(id){
			if(!id) return res.notFound();
			Teacher.find({
				id: parseInt(id)
			}).then(function (teachers) {
				if(teachers.length != 0){
					if(teachers[0].isActive) return res.notFound();
					Teacher.update({
						id: parseInt(id)
					},{
						isActive: true
					}).then(function(teacher){
						return res.view('index/verifyUser.ejs');
					}).catch(function(err){
						return res.badRequest(err);
					});
				}else{
					return res.notFound();
				}
			})
			
		});
	},

	submitApproveTeacher: function(req, res){
		console.log('submitApproveTeacher')
		var userId = req.user.id;
		var status = req.user.status;
		//Xử lý đơn đăng ký
		var handle = function(){
			return new Promise(function(fullfill, reject){
				if(status != 'success'){
					Teacher.update({id:userId},{status:'waiting', approveUpdateDate: new Date()})
					.exec(function(err, users){
						if(err) return reject(err);
						return fullfill();
					});
				}else{
					return reject('is_teacher');
				}
			});
		}
		handle().then(function(){
			return res.json({message:'success'});
		}).catch(function(err){
			return res.json({message:'error'});
		});
	},
	changePasswordTeacher : function (req,res) {

		var newPass = req.body.password;
		var oldPassword = req.body.oldPassword;

        bcryptPassword.decode(oldPassword,req.user.password , function(Ok) {
				// cb(isOk);
                console.log("+++"+Ok +"  "+oldPassword)
				if(Ok == false){
					// console.log("Error Update ")
					return res.json({message:'notSuccess'});
				}
				if(Ok == true){
					var studentId = req.user.id;
					Student.update({id: studentId},{
						password: newPass,
					}, function(err1, student) {
						if(err1) console.log("Error Update ")
						else return res.json({message:'success'});

					})
				}

			});

	},
};

