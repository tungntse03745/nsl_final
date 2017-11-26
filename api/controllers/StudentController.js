/**
 * StudentController
 *
 * @description :: Server-side logic for managing students
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var verify =  sails.config.verify;
module.exports = {
	// Đăng ký trở thành học sinh
	registerStudent: function (req, res) {
		var newStudent = {
				email: req.body.email.trim(),
				fullname: req.body.fullname.trim(),
				password: req.body.password.trim(),
				avatar:'/images/avatar-default.png'
		};
		Student.find({
			email: req.body.email.trim()
		}).then(function (students) {
			if(students.length != 0 && students[0].isActive){
				return res.json({message:'email_exist'})
			}
			if(!students.length){
				Student.create(newStudent).then(function(student){
					require('../services/verifyEmail.js').sendVerify(student,verify.student_link, function(err){
						if(err){
							return res.json({message:'error'});
						}else{
							return res.json({message:'success'})
						}
					});
				});
			}else{
				Student.update({id:students[0].id},newStudent).then(function(student){
					require('../services/verifyEmail.js').sendVerify(student[0],verify.student_link, function(err){
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
	// gửi mail xác nhận
	verifyStudent: function(req, res){
		if(!req.query) return res.notFound();
		if(!req.query.verifycode) return res.notFound();
		require('../services/verifyEmail.js').verifyCode(req.query.verifycode, function(id){
			if(!id) return res.notFound();
			Student.find({
				id: parseInt(id)
			}).then(function (students) {
				if(students.length != 0){
					if(students[0].isActive) return res.notFound();
					Student.update({
						id: parseInt(id)
					},{
						isActive: true
					}).then(function(student){
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
	changePassword : function (req,res) {

		var newPass = req.body.password;

			console.log("++++"+newPass+"  "+parseInt(req.user.id));

			var studentId = req.user.id;

				Student.update({id: studentId},{
					password: newPass,
				}, function(err, student) {
					if(err) console.log("ERROR Update ")
						else return res.json({message:'success'});
					// if (err) console.log("ERROR Update ")
					// else console.log("SUCCESS UPDATE")
				})


	},
	// check profile
	myprofile: function(req, res){
		if(checkRole(req) == 'guest') return res.json({message:'error'});
		var studentId = req.session.passport.student.id;
		Student.findOne({
			select:['id','avatar','fullname','job','description','teacherDescription','teacherStatus','teacherUpdateDate'],
			where:{
				id: studentId
			}
		}).exec(function(err,student){
			return res.json({student:student});
		})
	},
	// edit profile
	edit: function(req, res){
		if(checkRole(req) == 'guest') return res.json({message:'error'});
		var studentId = req.session.passport.student.id;
		// check displayName
		Student.update({id: studentId},{
			fullname: req.body.fullname,
			job: req.body.job,
			description: req.body.description
		}, function(err, student){
			if(err)	return res.json({message:"error"});
			if(!student[0]) return res.json({message:"error"});
			if(!req.body.isUpload) return res.json({message:'success'});
			var fs = require('fs');
			var path = require('path');
			var folderPicuture = path.join(__dirname, '../../assets/Avatars/' + studentId);
			var myMkdirSync = function(dir){
			    if (fs.existsSync(dir)){
			        return
			    }

			    try{
			        fs.mkdirSync(dir)
			    }catch(err){
			        if(err.code == 'ENOENT'){
			            myMkdirSync(path.dirname(dir)) //create parent dir
			            myMkdirSync(dir) //create dir
			        }
			    }
			}
			myMkdirSync(folderPicuture);
			fs.writeFile(folderPicuture + '/picture.png', req.body.avatar.replace(/^data:image\/png;base64,/, ""), 'base64', function(err) {
		        if(err){
		        	res.json({message:'have_error', err:err});
		        }
		        else{
		        	var picture = '/Avatars/' + studentId + '/picture.png';
		        	Student.update({id:studentId},{
		        		avatar:picture
		        	},function(err, student){
		        		if(err) return res.json({message:'have_error'});
		            	return res.json({message:'success'} );
		        	})
		        }
		    });
		});
	}
};

