/**
 * HomeController
 *
 * @description :: Server-side logic for managing homes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var fs = require('fs');
var request = require('request');

var checkRole = require('../services/checkRole.js').check;
// var getUserProfile = require('../services/sqlSupport.js').getUserProfile_promise;
var query =  require('../services/query.js');
module.exports = {
/*COMMON*/
	index: function(req, res) {
		var data = {};
		data.queryStr = {}
		var pagging = {
			current:0,
			count:0,
			limit:6,
		}
		// tạo đối tượng where để gán status : active
		var where = {status:'active'};
        // tạo đối tượng data từ req
		if((isNaN(req.query.page) && req.query.page) || parseInt(req.query.page) <= 0 || (isNaN(req.query.teacher) && req.query.teacher) || (isNaN(req.query.category) && req.query.category) || (isNaN(req.query.level) && req.query.level)){
			return res.notFound()
		}
		if(req.query.page){

			pagging.current = parseInt(req.query.page)-1;
		}
		if(req.query.category){

			where.categoryId = parseInt(req.query.category);
			data.queryStr.category = where.categoryId;

		}
		if(req.query.level){
			where.levelId = parseInt(req.query.level);
			data.queryStr.level = where.levelId;
		}
		if(req.query.teacher){
			where.teacher = parseInt(req.query.teacher);
			data.queryStr.teacher = where.teacher;

		}
		// query search course by name
		if(req.query.coursename){

			where.name = {'contains':req.query.coursename};
			data.queryStr.searchCourseName = req.query.coursename
		}
		var getCategory = function(){
			return new Promise(function(fullfill, reject){
				Category.find({}).populate('course',{status:'active'}).exec(function(err, _category){
					data.categories = _category;
					return fullfill()
				})
			});
		}
		var getLevel = function(){
			return new Promise(function(fullfill, reject){
				Level.find({}).populate('course',{status:'active'}).exec(function(err, _levels){
					data.levels = _levels;
					return fullfill()
				})
			});
		}
		var getTopTeacher = function(){
			return new Promise(function(fullfill, reject){
				Course.query(query.selectTeacherHasMostCourse(5),[], function(err, list){
					data.topTeachers = list;
					return fullfill();
				})
			});
		}
		var listCourse = function(){
			return new Promise(function(fullfill, reject){
				Course.count(where).exec(function(err, count){
					pagging.count = count;
					if(pagging.current >= Math.ceil(count/pagging.limit) && pagging.current!=0){
						return reject()
					}
					Course.find({
						// select:['id','name'],
						where:where,
						skip: pagging.limit * pagging.current,
			  			limit: pagging.limit,
						sort:'createdAt DESC'
					}).populate('teacher').exec(function(err, list){
						if(err) return reject(err);
						data.listCourses = list;
						data.pagging = pagging;
						return fullfill();
					})
				})
				
			});
		}
		getCategory().then(getLevel).then(getTopTeacher).then(listCourse).then(function(){
			data.user = req.user;
			res.view('index/homepage.ejs', data);
		}).catch(function(err){
			console.log(err)
			res.notFound();
		})
	},
	course: function(req, res) {
		var data = {};
		var courseId = parseInt(req.param('id'));
		var getCourse = function(){
			return new Promise(function(fullfill, reject){
				Course.findOne({id:courseId, status:'active'}).populate(['teacher','categoryId','levelId']).exec(function(err, _course){
					if(err) return reject();
					if(!_course) return reject();
					data.course = _course;
					return fullfill();
				});
			});
		}
		var getAll = function(){
			return new Promise(function(fullfill, reject){
				LessonCategory.find({courseId:courseId}).populate('lesson').exec(function(err, _category){
					if(err) return reject();
					if(!_category) return reject();
					data.course.listLessonCategory = _category;
					data.course.totalLesson = 0;
					for(var iChapter = 0; iChapter < data.course.listLessonCategory.length; iChapter++){
						for(var iLesson = 0; iLesson < data.course.listLessonCategory[iChapter].lesson.length; iLesson++){
							data.course.totalLesson++;
						}
					}

					return fullfill();
				})
			});
		}
		var getRelationCourse = function(){
			return new Promise(function(fullfill, reject){
				Course.find({
					where:{status:'active', teacher:data.course.teacher.id, id: { '!': courseId}},
					skip:0,
					limit:2
				}).populate('teacher').exec(function(err, list){
					if(err) return reject();
					data.course.relationCourse = list;

					// for(var iGet=0;iGet<res.data.course.relationCourse.length;iGet++){
					// 	console.log(data.course.relationCourse[iGet])
					// }
					return fullfill();
				})
			});
		}
		getCourse().then(getAll).then(getRelationCourse).then(function(){
			data.user = req.user;
			res.view('index/course.ejs', data);
		}).catch(function(err){
			res.notFound();
		})

		
	},
	viewProfile: function(req, res){
		var data = {};
		var teacher = parseInt(req.param('id'));
		getTeacher = function(){
			return new Promise(function(fullfill, reject){
				Teacher.findOne({id:teacher}).exec(function(err, _teacher){
					if(err) return reject(err);
					if(!_teacher) return reject('user_not_found');
					if(_teacher.role == 'admin') return reject('user_not_found');
					data.viewUser = _teacher;
					return fullfill();
				})
			});
		}
		getAllCourse = function(){
			return new Promise(function(fullfill, reject){
				Course.find({
					where:{status:'active', teacher:teacher}
				}).populate('teacher').exec(function(err, list){
					if(err) return reject();
					data.relationCourse = list;
					return fullfill();
				})
			});
		}
		getTeacher().then(getAllCourse).then(function(){
			data.user = req.user;
			res.view('index/viewProfile.ejs', data);
		}).catch(function(err){
			res.notFound();
		})
	},
		//GET
	profile: function(req, res){
		var data = {};
		data.user = req.user;
		console.log("++++"+data.user.fullname+" "+data.user.password);
		res.view('index/profile.ejs', data);
	},
	changePassword:function (req,res) {
		var data = {};
		data.user = req.user;
		res.view('index/changePasswordStudent.ejs',data);
	},
	// POST /user/myprofile

	myprofile: function(req, res){
		res.json({user:req.user})
	},

	// POST /user/edit
	editProfile:function(req, res){
		console.log(req.body)
		function edit(_User, _update, _tp){
			_User.update({id: req.user.id},_update, function(err, user){
				if(err)	return res.json({message:"error"});
				if(!user[0]) return res.json({message:"error"});
				if(!req.body.isUpload) return res.json({message:'success'});
				var fs = require('fs');
				var path = require('path');
				var folderPicuture = path.join(__dirname, '../../assets/Avatars/' + _tp + '/' + req.user.id);
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
			        	var picture = '/Avatars/' + _tp + '/' + req.user.id + '/picture.png';
			        	_User.update({id:req.user.id},{
			        		avatar:picture
			        	},function(err, user){
			        		if(err) return res.json({message:'have_error'});
			            	return res.json({message:'success'} );
			        	})
			        }
			    });
			});
		}

		if(req.user.role == 'student')
			edit(Student, {
				fullname: req.body.fullname,
				job: req.body.job,
				description: req.body.description
			}, 'student');
		else if (req.user.role == 'teacher')
			edit(Teacher, {
				fullname: req.body.fullname,
				age: req.body.age,
				phone: req.body.phone,
				address: req.body.address,
				indentityCard: req.body.indentityCard,
				job: req.body.job,
				description: req.body.description
			}, 'teacher');
		else if(req.user.role == 'admin'){
			edit(Admin, {
				fullname: req.body.fullname,
			}, 'admin');
		}
	},

	
	cart: function(req, res) {
		var data = {};
		data.user = req.user;
		res.view('index/cart.ejs', data);
	},

	paymentHistory: function(req, res){
		var data = {};
		data.user = req.user;
		let getOrderNoPay = function(){
	    	return new Promise(function(fullfill, reject){
	    		OrderCourse.find({student: req.user.id,status:0}).populateAll().exec(function (err, list) {
					if(err) return reject(err);
					data.orderNoPay = list;
					return fullfill();
				})
	    	})
	    }
		let getOrderPaid = function(){
	    	return new Promise(function(fullfill, reject){
	    		OrderCourse.find({student: req.user.id,status:1}).populateAll().exec(function (err, list) {
					if(err) return reject(err);
					data.orderPaid = list;
					return fullfill();
				})
	    	})
	    }
	    getOrderNoPay().then(getOrderPaid).then(function(){
	    	res.view('index/paymentHistory.ejs', data);
	    }).catch(function(err){
	    	res.notFound();
	    })
	},
/*TEACHER*/
	registerTeacher: function(req, res){
		res.view('teacher/register.ejs');
	},
	changePasswordTeacher:function (req,res) {
		var data = {};
		data.user = req.user;
		res.view('teacher/changePasswordTeacher.ejs',data);
	},

	loginTeacher: function(req, res){
		res.view('teacher/login.ejs');
	},
	newCourse: function(req, res){
		var data = {};
		data.user = req.user;
		console.log(data.user)
		res.view('index/newCourse.ejs', data);
	},
	editCourse: function(req, res){
		var data = {};
		data.user = req.user;
		Course.findOne({
			teacher:req.user.id,
			id:parseInt(req.param('id'))
		}).exec(function(err, course){
			if(err || !course) return res.notFound();
			res.view('index/editCourse.ejs', data);
		})
		
	},
	repository: function(req, res){
		var teacherId =  req.user.id;
		var data = {};
		data.user = req.user;
		data.active = 'active';
		let getCourses = function(){
	    	return new Promise(function(fullfill, reject){
				Course.find({teacher:teacherId, status:'active'}).exec(function(err, courses){
					if(err) return reject(err);
					data.courses = courses;
					return fullfill();
				})
	    	})
	    }
		getCourses().then(function(){
			res.view('index/repository.ejs', data);
		}).catch(function(err){
			res.notFound();
		})
	},

	waitingCourse: function(req, res){
		var teacherId =  req.user.id;
		var data = {};
		data.user = req.user;
		data.active = 'waiting';
		let getCourses = function(){
	    	return new Promise(function(fullfill, reject){
				Course.find({teacher:teacherId, status:'waiting'}).exec(function(err, courses){
					if(err) return reject(err);
					data.courses = courses;
					return fullfill();
				})
	    	})
	    }
		getCourses().then(function(){
			res.view('index/repository.ejs', data);
		}).catch(function(err){
			res.notFound();
		})
	},
	saveCourse : function(req, res) {
		var teacherId =  req.user.id;
		var data = {};
		data.user = req.user;
		data.active = 'save';
		let getCourses = function(){
			return new Promise(function(fullfill, reject){
				Course.find({teacher:teacherId, status:'save'}).exec(function(err, courses){
					if(err) return reject(err);
					data.courses = courses;
					return fullfill();
				})
			})
		}
		getCourses().then(function(){
			res.view('index/repository.ejs', data);
		}).catch(function(err){
			res.notFound();
		})
	},
	rejectCourse: function(req, res){
		var teacherId =  req.user.id;
		var data = {};
		data.user = req.user;
		data.active = 'reject';
		let getCourses = function(){
	    	return new Promise(function(fullfill, reject){
				Course.find({teacher:teacherId, status:'reject'}).exec(function(err, courses){
					if(err) return reject(err);
					data.courses = courses;
					return fullfill();
				})
	    	})
	    }
		getCourses().then(function(){
			res.view('index/repository.ejs', data);
		}).catch(function(err){
			res.notFound();
		})
	},

	withdraw: function(req, res){
		var data = {};
		data.user = req.user;
		let getTransaction = function(){
	    	return new Promise(function(fullfill, reject){
				Transaction.find({
					where:{teacher:req.user.id},
					sort:'createdAt DESC' // sort  Descending
				}).exec(function(err, trans){
					if(err) return reject(err);
					data.transactions = trans;
					// var x = parseInt(data.transactions.balance)*70;
					console.log(req.user.id)
					return fullfill();
				})
	    	})
	    }
	    getTransaction().then(function(){
			res.view('teacher/withdraw.ejs', data);
	    })
	},
/*ADMIN*/
	loginAdmin: function(req, res){
		res.view('admin/login.ejs');
	},
	admin: function(req, res){
		var data = {};
		data.active = 'dashboard'
		data.user = req.user;
		data.moneyFromStudent = 0;
		data.moneyTeacherNotPay = 0;
		data.moneyTeacherPaid = 0;
		let getAllMoneyFromStudent = function(){
	    	return new Promise(function(fullfill, reject){
				OrderCourse.find({status:true}).exec(function(err,_od){
					if(err) return reject(err);
					for(var i = 0; i < _od.length; i++){
						data.moneyFromStudent += _od[i].cost;
					}
					return fullfill();
				})
	    	})
	    }
		let getAllMoneyFromTeacherPaid = function(){
	    	return new Promise(function(fullfill, reject){
				Teacher.find({}).exec(function(err,_t){
					if(err) return reject(err);
					for(var i = 0; i < _t.length; i++){
						data.moneyTeacherNotPay += _t[i].balance;
					}
					Transaction.find({status:false}).exec(function(err,_t){
						if(err) return reject(err);
						for(var i = 0; i < _t.length; i++){
							data.moneyTeacherNotPay += _t[i].reqMoney;
						}
						return fullfill();
					})
				})
	    	})
	    }
		let getAllMoneyPaid = function(){
	    	return new Promise(function(fullfill, reject){
				Transaction.find({status:true}).exec(function(err,_t){
					if(err) return reject(err);
					for(var i = 0; i < _t.length; i++){
						data.moneyTeacherPaid += _t[i].reqMoney;
					}
					return fullfill();
				})
	    	})
	    }
	    getAllMoneyFromStudent().then(getAllMoneyFromTeacherPaid).then(getAllMoneyPaid).then(function(){
			console.log(data);
			res.view('admin/dashboard.ejs', data);
	    }).catch(function(err){
	    	res.notFound();
	    })
	},
	approveTeacher: function(req, res){
		var data = {};
		data.active = 'approveTeacher'
		data.user = req.user;
		res.view('admin/approve-teacher', data);
	},
	approveCourse: function(req, res){
		var data = {};
		data.active = 'approveCourse'
		data.user = req.user;
		res.view('admin/approve-course', data);
		
	},
	category: function(req, res){
		var data = {};
		data.active = 'category'
		data.user = req.user;
		res.view('admin/category', data);
		
	},
	level: function(req, res){
		var data = {};
		data.active = 'level'
		data.user = req.user;
		res.view('admin/level', data);
		
	},
	activeCourse: function(req, res){
		var data = {};
		data.active = 'activeCourse'
		data.user = req.user;
		res.view('admin/activeCourse', data);
	},
	adminTransaction: function(req, res){
		var data = {};
		data.active = 'adminTransaction'
		data.user = req.user;
		res.view('admin/adminTransaction', data);
	},


	//TEACHER

////////////////////////////////////////////////////////////////
	
	purchase: function(req, res) {
		var data = {};
		data.user = req.user;
		res.view('index/purchase.ejs', data);
	},
	mycourse: function(req, res){
		var data = {};
		data.user = req.user;
		var listCourse = function(){
			return new Promise(function(fullfill, reject){
				OrderCourse.find({student:req.user.id, status:true}).populateAll().exec(function(err, od){
					if(err) return reject(err);
					data.orderCourse = od;
					return fullfill();
				});
			});
		}
		listCourse().then(function(){
			res.view('index/mycourse.ejs', data);
		}).catch(function(err){
			res.notFound();
		})
	},
	courseDetail: function(req, res){
		var courseId = parseInt(req.param('id'));
		var data = {};
		data.user = req.user;
		data.courseId = courseId;
		var check = function(){
			return new Promise(function(fullfill, reject){
				OrderCourse.findOne({student:req.user.id,course:courseId, status:true}).exec(function(err, od){
					if(err) return reject(err);
					if(!od) return reject('notFound');
					return fullfill();
				});
			});
		}
		check().then(function(){
			res.view('index/coursedetail.ejs', data);
		}).catch(function(err){
			res.notFound();
		})
		
	},
	

	
};

//var rs = fs.createReadStream(require('path').join(__dirname, '../../assets/images/video.mov'));