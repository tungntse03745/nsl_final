/**
 * CourseController
 *
 * @description :: Server-side logic for managing courses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var checkRole = require('../services/checkRole.js').check;
function savePicture(courseId,img, callback){
	var fs = require('fs');
	var path = require('path');
	var folderPicuture = path.join(__dirname, '../../assets/coverPictures/' + courseId);
	// check exist file
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
	fs.writeFile(folderPicuture + '/picture.png', img.replace(/^data:image\/png;base64,/, ""), 'base64', function(err) {
		if(err){
			callback('error');
		}
		else{
			var picture = '/coverPictures/' + courseId + '/picture.png';
			Course.update({id:courseId},{
				picture:picture
			},function(err, user){
				if(err) return callback('error');
				return callback();
			})
		}
	});
}
module.exports = {
	newCourse: function (req, res) {
		var courseId = undefined;
		var listCourseCategory = [];
		var listLesson = [];
		var listQuestion = [];
		var createCourse = function(){
			return new Promise(function(fullfill, reject){
				Course.create({
					name: req.body.name,
					price: req.body.price,
					oldPrice: req.body.oldPrice,
					generalDescription: req.body.generalDescription,
					requirement: req.body.requirement,
					benefit: req.body.benefit,
					objectAndGoals: req.body.objectAndGoals
				}).exec(function(err, course){
					//XU LY LOI
					if(err) return reject(err);

					courseId = course.id;

					savePicture(course.id,req.body.pictureData, function(err){
						//XU LY LOI
						if(err) return reject(err);
						course.teacher = req.user.id;
						course.categoryId = req.body.category.id;
						course.levelId = req.body.level.id;
						course.save(function(err){
							//XU LY LOI
							if(err) return reject(err);
							return fullfill();
						});
					})
				})
			});
		}
		var createLessonCategory = function(){
			return new Promise(function(fullfill, reject){
				function insertDeQuy(list){
					if(list.length==0) return fullfill();
					LessonCategory.create({
						name:list[0].name,
						order:list[0].order
					}).exec(function(err, _lessonCategory){
						if(err) return reject(err);

						list[0].id = _lessonCategory.id;
						listCourseCategory.push(list[0]);

						_lessonCategory.courseId = courseId;
						_lessonCategory.save(function(err){
							if(err) return reject(err);
							list.shift();
							if(list.length==0) return fullfill();
							insertDeQuy(list);
						});
					})
				}
				insertDeQuy(req.body.listCourseCategory);
			});
		} 
		var createLesson = function(){
			return new Promise(function(fullfill, reject){
				function insertDeQuyTwo(list, _lessonCategoryId, callback){
					if(list.length==0) return callback();
					Lesson.create({
						name:list[0].name,
						linkVideo:list[0].linkVideo,
						typeVideo:list[0].typeVideo,
						content:list[0].content,
						order:list[0].order,
					}).exec(function(err, _lesson){
						if(err) return callback(err);

						list[0].id = _lesson.id;
						listLesson.push(list[0]);

						_lesson.lessonCategoryId = _lessonCategoryId;
						_lesson.save(function(err){
							if(err) return callback(err);
							list.shift();
							if(list.length==0) return callback();
							insertDeQuyTwo(list,_lessonCategoryId, callback);
						})
					})
				}
				function insertDeQuyOne(list){
					if(list.length==0) return fullfill();
					insertDeQuyTwo(list[0].listLesson,list[0].id,function(err){
						if(err) return reject(err);
						list.shift();
						if(list.length==0) return fullfill();
						insertDeQuyOne(list);
					});

				}
				insertDeQuyOne(listCourseCategory);
			});
		} 

		var createQuestion = function(){
			return new Promise(function(fullfill, reject){
				function insertDeQuyTwo(list, _lessonId, callback){
					if(list.length==0) return callback();
					Question.create({
						content:list[0].content
					}).exec(function(err, _question){
						if(err) return callback(err);

						list[0].id = _question.id;
						listQuestion.push(list[0]);

						_question.lessonId = _lessonId;
						_question.save(function(err){
							if(err) return callback(err);
							list.shift();
							if(list.length==0) return callback();
							insertDeQuyTwo(list,_lessonId, callback);
						})
					})
				}
				function insertDeQuyOne(list){
					if(list.length==0) return fullfill();
					insertDeQuyTwo(list[0].listQuestion,list[0].id,function(err){
						if(err) return reject(err);
						list.shift();
						if(list.length==0) return fullfill();
						insertDeQuyOne(list);
					});

				}
				insertDeQuyOne(listLesson);
			});
		} 

		var createAnswer = function(){
			return new Promise(function(fullfill, reject){
				function insertDeQuyTwo(list, _questionId, callback){
					if(list.length==0) return callback();
					Answer.create({
						content:list[0].content,
						isTrue:list[0].isTrue,
					}).exec(function(err, _answer){
						if(err) return callback(err);

						_answer.questionId = _questionId;
						_answer.save(function(err){
							if(err) return callback(err);
							list.shift();
							if(list.length==0) return callback();
							insertDeQuyTwo(list,_questionId, callback);
						})
					})
				}
				function insertDeQuyOne(list){
					if(list.length==0) return fullfill();
					insertDeQuyTwo(list[0].listAnswer,list[0].id,function(err){
						if(err) return reject(err);
						list.shift();
						if(list.length==0) return fullfill();
						insertDeQuyOne(list);
					});

				}
				insertDeQuyOne(listQuestion);
			});
		} 
		createCourse().then(createLessonCategory).then(createLesson).then(createQuestion).then(createAnswer)
		.then(function(){
			res.json({message:'success'});
		}).catch(function(err){
			console.log(err)
			res.json({message:'error'})
		})
	},
	saveCourse : function(req, res) {
		var courseId = undefined;
		var listCourseCategory = [];
		var listLesson = [];
		var listQuestion = [];
		var createCourse = function(){
			return new Promise(function(fullfill, reject){
				Course.create({
					name: req.body.name,
					price: req.body.price,
					oldPrice: req.body.oldPrice,
					generalDescription: req.body.generalDescription,
					requirement: req.body.requirement,
					benefit: req.body.benefit,
					objectAndGoals: req.body.objectAndGoals,
					status:'save'
				}).exec(function(err, course){
					//XU LY LOI
					if(err) return reject(err);

					courseId = course.id;

					savePicture(course.id,req.body.pictureData, function(err){
						//XU LY LOI
						if(err) return reject(err);
						course.teacher = req.user.id;
						course.categoryId = req.body.category.id;
						course.levelId = req.body.level.id;
						course.save(function(err){
							//XU LY LOI
							if(err) return reject(err);
							return fullfill();
						});
					})
				})
			});
		}
		var createLessonCategory = function(){
			return new Promise(function(fullfill, reject){
				function insertDeQuy(list){
					if(list.length==0) return fullfill();
					LessonCategory.create({
						name:list[0].name,
						order:list[0].order
					}).exec(function(err, _lessonCategory){
						if(err) return reject(err);

						list[0].id = _lessonCategory.id;
						listCourseCategory.push(list[0]);

						_lessonCategory.courseId = courseId;
						_lessonCategory.save(function(err){
							if(err) return reject(err);
							list.shift();
							if(list.length==0) return fullfill();
							insertDeQuy(list);
						});
					})
				}
				insertDeQuy(req.body.listCourseCategory);
			});
		}
		var createLesson = function(){
			return new Promise(function(fullfill, reject){
				function insertDeQuyTwo(list, _lessonCategoryId, callback){
					if(list.length==0) return callback();
					Lesson.create({
						name:list[0].name,
						linkVideo:list[0].linkVideo,
						typeVideo:list[0].typeVideo,
						content:list[0].content,
						order:list[0].order,
					}).exec(function(err, _lesson){
						if(err) return callback(err);

						list[0].id = _lesson.id;
						listLesson.push(list[0]);

						_lesson.lessonCategoryId = _lessonCategoryId;
						_lesson.save(function(err){
							if(err) return callback(err);
							list.shift();
							if(list.length==0) return callback();
							insertDeQuyTwo(list,_lessonCategoryId, callback);
						})
					})
				}
				function insertDeQuyOne(list){
					if(list.length==0) return fullfill();
					insertDeQuyTwo(list[0].listLesson,list[0].id,function(err){
						if(err) return reject(err);
						list.shift();
						if(list.length==0) return fullfill();
						insertDeQuyOne(list);
					});

				}
				insertDeQuyOne(listCourseCategory);
			});
		}

		var createQuestion = function(){
			return new Promise(function(fullfill, reject){
				function insertDeQuyTwo(list, _lessonId, callback){
					if(list.length==0) return callback();
					Question.create({
						content:list[0].content
					}).exec(function(err, _question){
						if(err) return callback(err);

						list[0].id = _question.id;
						listQuestion.push(list[0]);

						_question.lessonId = _lessonId;
						_question.save(function(err){
							if(err) return callback(err);
							list.shift();
							if(list.length==0) return callback();
							insertDeQuyTwo(list,_lessonId, callback);
						})
					})
				}
				function insertDeQuyOne(list){
					if(list.length==0) return fullfill();
					insertDeQuyTwo(list[0].listQuestion,list[0].id,function(err){
						if(err) return reject(err);
						list.shift();
						if(list.length==0) return fullfill();
						insertDeQuyOne(list);
					});

				}
				insertDeQuyOne(listLesson);
			});
		}

		var createAnswer = function(){
			return new Promise(function(fullfill, reject){
				function insertDeQuyTwo(list, _questionId, callback){
					if(list.length==0) return callback();
					Answer.create({
						content:list[0].content,
						isTrue:list[0].isTrue,
					}).exec(function(err, _answer){
						if(err) return callback(err);

						_answer.questionId = _questionId;
						_answer.save(function(err){
							if(err) return callback(err);
							list.shift();
							if(list.length==0) return callback();
							insertDeQuyTwo(list,_questionId, callback);
						})
					})
				}
				function insertDeQuyOne(list){
					if(list.length==0) return fullfill();
					insertDeQuyTwo(list[0].listAnswer,list[0].id,function(err){
						if(err) return reject(err);
						list.shift();
						if(list.length==0) return fullfill();
						insertDeQuyOne(list);
					});

				}
				insertDeQuyOne(listQuestion);
			});
		}
		createCourse().then(createLessonCategory).then(createLesson).then(createQuestion).then(createAnswer)
			.then(function(){
				res.json({message:'saved'});
			}).catch(function(err){
			console.log(err)
			res.json({message:'error'})
		})

		// update save status




	},
	getDetails: function(req, res){
		var teacher = req.user.id;
		var where = {};
		if(req.user.role == 'teacher' ){
			where = {teacher:teacher, id:req.body.id}
		}else if(req.user.role == 'admin'){
			where = {id:req.body.id}
		}
		Course.findOne(where).populate(['categoryId','levelId','lessonCategory']).exec(function(err,_course){
			if(err || !_course) return res.json({message:'error'});
			var course = {};
			course.name = _course.name;
			course.id = _course.id;
			course.category = _course.categoryId;
			course.level = _course.levelId;
			course.status = _course.status;
			course.adminMessage = _course.adminMessage;
			course.price = _course.price;
			course.oldPrice = _course.oldPrice;
			course.pictureData = _course.picture;
			course.generalDescription = _course.generalDescription;
			course.requirement = _course.requirement;
			course.benefit = _course.benefit;
			course.objectAndGoals = _course.objectAndGoals;
			course.listCourseCategory = _course.lessonCategory;


			var getLession = function(){
				return new Promise(function(fullfill, reject){
					//GET LIST LESSION
					function dequyOne(listOne, iOne){
						if(iOne >= listOne.length){
							return fullfill();
						}
						Lesson.find({
							lessonCategoryId:listOne[iOne].id
						}).exec(function(err, lessons){
							if(err) return reject(err);
							listOne[iOne].listLesson = lessons;
							dequyTwo(listOne[iOne].listLesson, 0, function(){
								dequyOne(listOne, ++iOne);
							});
						})
					}
					//GET QUESTION
					function dequyTwo(listTwo, iTwo, callback){
						if(iTwo >= listTwo.length){
							return callback();
						}
						Question.find({
							lessonId: listTwo[iTwo].id
						}).exec(function(err, questions){
							if(err) return reject(err);
							listTwo[iTwo].listQuestion = questions;
							dequyThree(listTwo[iTwo].listQuestion, 0, function(){
								dequyTwo(listTwo, ++iTwo, callback);
							});
						});
					}
					//GET ANSWER
					function dequyThree(listThree, iThree, callback){
						if(iThree >= listThree.length){
							return callback();
						}
						Answer.find({
							questionId: listThree[iThree].id
						}).exec(function(err, answers){
							if(err) return reject(err);
							listThree[iThree].listAnswer = answers;
							dequyThree(listThree, ++iThree, callback);
						})
					}
					dequyOne(course.listCourseCategory, 0);
				});
			}

			getLession().then(function(){
				res.json({course:course,message:'success'})
			}).catch(function(err){
				res.json({message:'error'})
			})
		});
	},
	update: function(req, res){
		var courseId = req.body.id;
		var teacher = req.user.id;
		var listLessionCategoryUpdate = [];
		var listLessionUpdate = [];
		var listQuestionUpdate = [];
		var listAnswerUpdate = [];


		var listLessionCategoryCreate = [];
		var listLessionCreate = [];
		var listQuestionCreate = [];
		var listAnswerCreate = [];




		var makeUpdateList = function(){
			var listChapter = req.body.listCourseCategory;
			for(var iChapter = 0; iChapter < listChapter.length; iChapter++){
				if(!listChapter[iChapter].isNew){
					listLessionCategoryUpdate.push({
						id:listChapter[iChapter].id,
						name:listChapter[iChapter].name,
						order:listChapter[iChapter].order
					})
				}
				if(!listChapter[iChapter].listLesson.length) continue;
				for(var iLession = 0; iLession < listChapter[iChapter].listLesson.length; iLession++){
					if(!listChapter[iChapter].listLesson[iLession].isNew){
						listLessionUpdate.push({
							id:listChapter[iChapter].listLesson[iLession].id,
							name:listChapter[iChapter].listLesson[iLession].name,
							order:listChapter[iChapter].listLesson[iLession].order,
							content:listChapter[iChapter].listLesson[iLession].content,
							linkVideo:listChapter[iChapter].listLesson[iLession].linkVideo,
							typeVideo:listChapter[iChapter].listLesson[iLession].typeVideo,

						})
					}
					if(!listChapter[iChapter].listLesson[iLession].listQuestion.length) continue;
					for(var iQuestion = 0; iQuestion < listChapter[iChapter].listLesson[iLession].listQuestion.length; iQuestion++){
						if(!listChapter[iChapter].listLesson[iLession].listQuestion[iQuestion].isNew){
							listQuestionUpdate.push({
								id:listChapter[iChapter].listLesson[iLession].listQuestion[iQuestion].id,
								content:listChapter[iChapter].listLesson[iLession].listQuestion[iQuestion].content
							})
						}
						if(!listChapter[iChapter].listLesson[iLession].listQuestion[iQuestion].listAnswer.length) continue;
						for(var iAnswer = 0; iAnswer < listChapter[iChapter].listLesson[iLession].listQuestion[iQuestion].listAnswer.length; iAnswer++){
							if(!listChapter[iChapter].listLesson[iLession].listQuestion[iQuestion].isNew){
								listAnswerUpdate.push({
									id:listChapter[iChapter].listLesson[iLession].listQuestion[iQuestion].listAnswer[iAnswer].id,
									content:listChapter[iChapter].listLesson[iLession].listQuestion[iQuestion].listAnswer[iAnswer].content,
									isTrue:listChapter[iChapter].listLesson[iLession].listQuestion[iQuestion].listAnswer[iAnswer].isTrue
								})
							}
						}
					}
				}
			}
		};
		var makeCreateList = function(){
			var listChapter = req.body.listCourseCategory;
			for(var iChapter = 0; iChapter < listChapter.length; iChapter++){
				if(listChapter[iChapter].isNew){
					listLessionCategoryCreate.push(listChapter[iChapter])
				}
				if(!listChapter[iChapter].listLesson.length) continue;
				for(var iLession = 0; iLession < listChapter[iChapter].listLesson.length; iLession++){
					if(listChapter[iChapter].listLesson[iLession].isNew && !listChapter[iChapter].isNew){
						listChapter[iChapter].listLesson[iLession].lessonCategoryId = listChapter[iChapter].id;
						listLessionCreate.push(listChapter[iChapter].listLesson[iLession]);
					}
					if(!listChapter[iChapter].listLesson[iLession].listQuestion.length) continue;
					for(var iQuestion = 0; iQuestion < listChapter[iChapter].listLesson[iLession].listQuestion.length; iQuestion++){
						if(listChapter[iChapter].listLesson[iLession].listQuestion[iQuestion].isNew && !listChapter[iChapter].listLesson[iLession].isNew){
							listChapter[iChapter].listLesson[iLession].listQuestion[iQuestion].lessonId = listChapter[iChapter].listLesson[iLession].id;
							listQuestionCreate.push(listChapter[iChapter].listLesson[iLession].listQuestion[iQuestion]);
						}
						if(!listChapter[iChapter].listLesson[iLession].listQuestion[iQuestion].listAnswer.length) continue;
						for(var iAnswer = 0; iAnswer < listChapter[iChapter].listLesson[iLession].listQuestion[iQuestion].listAnswer.length; iAnswer++){
							if(listChapter[iChapter].listLesson[iLession].listQuestion[iQuestion].listAnswer[iAnswer].isNew && !listChapter[iChapter].listLesson[iLession].listQuestion[iQuestion].isNew){
								listChapter[iChapter].listLesson[iLession].listQuestion[iQuestion].listAnswer[iAnswer].questionId = listChapter[iChapter].listLesson[iLession].listQuestion[iQuestion].id;
								listAnswerCreate.push(listChapter[iChapter].listLesson[iLession].listQuestion[iQuestion].listAnswer[iAnswer])
							}
						}
					}
				}
			}
		};
		makeUpdateList();
		makeCreateList();
		var updateCourse = function(){
			return new Promise(function(fullfill, reject){
				Course.update({id:courseId},{
					teacher:teacher,
					categoryId: req.body.category.id,
					levelId: req.body.level.id,
					name: req.body.name,
					price: req.body.price,
					oldPrice: req.body.oldPrice,
					generalDescription: req.body.generalDescription,
					requirement: req.body.requirement,
					benefit: req.body.benefit,
					objectAndGoals: req.body.objectAndGoals
				}).exec(function(err, courses){
					//XU LY LOI
					if(err) return reject(err);
					if(!courses.length) return reject(err);
					if(req.body.pictureUpload){
						savePicture(courseId,req.body.pictureData, function(err){
							//XU LY LOI
							// if(err) return reject(err);
							// course.categoryId = req.body.category.id;
							// course.levelId = req.body.level.id;
							// course.save(function(err){
							// 	//XU LY LOI
							// 	if(err) return reject(err);
								
							// });
							if(err) return reject(err);
							makeUpdateList();
							return fullfill();
						})
					}else{
						return fullfill();
					}
				})
			});
		}
		var updateLessonCategory = function(){
			return new Promise(function(fullfill, reject){
				function dequy(list,iChapter){
					if(iChapter >= list.length){
						return fullfill();
					}
					LessonCategory.update({
						id:list[iChapter].id
					},list[iChapter]).exec(function(err, _lessonCategory){
						if(err) return reject(err);
						dequy(list, ++iChapter);
					});
				}
				dequy(listLessionCategoryUpdate,0);
			});
		}

		var updateLesson = function(){
			return new Promise(function(fullfill, reject){
				function dequy(list,iLession){
					if(iLession >= list.length){
						return fullfill();
					}
					Lesson.update({
						id:list[iLession].id
					},list[iLession]).exec(function(err, _lesson){
						if(err) return reject(err);
						dequy(list, ++iLession);
					});
				}
				dequy(listLessionUpdate,0);
			});
		}

		var updateQuestion = function(){
			return new Promise(function(fullfill, reject){
				function dequy(list,iQuestion){
					if(iQuestion >= list.length){
						return fullfill();
					}
					Question.update({
						id:list[iQuestion].id
					},list[iQuestion]).exec(function(err, _question){
						if(err) return reject(err);
						dequy(list, ++iQuestion);
					});
				}
				dequy(listQuestionUpdate,0);
			});
		}

		var updateAnswer = function(){
			return new Promise(function(fullfill, reject){
				function dequy(list,iAnswer){
					if(iAnswer >= list.length){
						return fullfill();
					}
					Answer.update({
						id:list[iAnswer].id
					},list[iAnswer]).exec(function(err, _answer){
						if(err) return reject(err);
						dequy(list, ++iAnswer);
					});
				}
				dequy(listAnswerUpdate,0);
			});
		}

		var deleteLessonCategory = function(){
			return new Promise(function(fullfill, reject){
				LessonCategory.destroy(req.body.listCourseCategoryDelete).exec(function(err){
					if(err) return reject(err);
					return fullfill();
				});
			});
		}

		var deleteLesson = function(){
			return new Promise(function(fullfill, reject){
				Lesson.destroy(req.body.listLessonDelete).exec(function(err){
					if(err) return reject(err);
					return fullfill();
				});
			});
		}

		var deleteQuestion = function(){
			return new Promise(function(fullfill, reject){
				Question.destroy(req.body.listQuestionDelete).exec(function(err){
					if(err) return reject(err);
					return fullfill();
				});
			});
		}

		var deleteAnswer = function(){
			return new Promise(function(fullfill, reject){
				Answer.destroy(req.body.listAnswerDelete).exec(function(err){
					if(err) return reject(err);
					return fullfill();
				});
			});
		}

		var createLessonCategory = function(){
			return new Promise(function(fullfill, reject){
				function dequyOne(list, iChapter){
					if(!list) return callback();
					if(iChapter >= list.length){
						return fullfill();
					}
					LessonCategory.create({
						courseId:courseId,
						name: list[iChapter].name,
						order: list[iChapter].order
					}).exec(function(err, _chapter){
						if(err) return reject(err);
						dequyTwo(list[iChapter].listLesson,0, _chapter.id,function(){
							dequyOne(list, ++iChapter);
						})
					});
				}
				function dequyTwo(list, iLession, lessonCategoryId, callback){
					if(!list) return callback();
					if(iLession >= list.length){
						return callback();
					}
					Lesson.create({
						lessonCategoryId:lessonCategoryId,
						name: list[iLession].name,
						linkVideo: list[iLession].linkVideo,
						typeVideo: list[iLession].typeVideo,
						content: list[iLession].content,
						order: list[iLession].order
					}).exec(function(err, _lesson){
						if(err) return reject(err);
						dequyThree(list[iLession].listQuestion,0,_lesson.id,function(){
							dequyTwo(list, ++iLession, lessonCategoryId, callback);
						})
					})
				}
				function dequyThree(list, iQuestion, lessonId, callback){
					if(!list) return callback();
					if(iQuestion >= list.length){
						return callback();
					}
					Question.create({
						lessonId:lessonId,
						content: list[iQuestion].content
					}).exec(function(err, _question){
						if(err) return reject(err);
						dequyFour(list[iQuestion].listAnswer,0,_question.id,function(){
							dequyThree(list, ++iQuestion, lessonId, callback);
						})
					})
				}
				function dequyFour(list, iAnswer, questionId, callback){
					if(!list) return callback();
					if(iAnswer >= list.length){
						return callback();
					}
					Answer.create({
						questionId:questionId,
						content: list[iAnswer].content,
						isTrue: list[iAnswer].isTrue
					}).exec(function(err, _question){
						if(err) return reject(err);
						dequyFour(list, ++iAnswer, questionId, callback);
					})
				}
				dequyOne(listLessionCategoryCreate,0);
			});
		} 

		var createLesson = function(){
			return new Promise(function(fullfill, reject){
				function dequyTwo(list, iLession){
					if(!list) return callback();
					if(iLession >= list.length){
						return fullfill();
					}
					Lesson.create({
						lessonCategoryId:list[iLession].lessonCategoryId,
						name: list[iLession].name,
						linkVideo: list[iLession].linkVideo,
						typeVideo: list[iLession].typeVideo,
						content: list[iLession].content,
						order: list[iLession].order
					}).exec(function(err, _lesson){
						if(err) return reject(err);
						dequyThree(list[iLession].listQuestion,0,_lesson.id,function(){
							dequyTwo(list, ++iLession);
						})
					})
				}
				function dequyThree(list, iQuestion, lessonId, callback){
					if(!list) return callback();
					if(iQuestion >= list.length){
						return callback();
					}
					Question.create({
						lessonId:lessonId,
						content: list[iQuestion].content
					}).exec(function(err, _question){
						if(err) return reject(err);
						dequyFour(list[iQuestion].listAnswer,0,_question.id,function(){
							dequyThree(list, ++iQuestion, lessonId, callback);
						})
					})
				}
				function dequyFour(list, iAnswer, questionId, callback){
					if(!list) return callback();
					if(iAnswer >= list.length){
						return callback();
					}
					Answer.create({
						questionId:questionId,
						content: list[iAnswer].content,
						isTrue: list[iAnswer].isTrue
					}).exec(function(err, _question){
						if(err) return reject(err);
						dequyFour(list, ++iAnswer, questionId, callback);
					})
				}
				dequyTwo(listLessionCreate,0);
			});
		}
		
		var createQuestion = function(){
			return new Promise(function(fullfill, reject){
				function dequyThree(list, iQuestion){
					if(!list) return callback();
					if(iQuestion >= list.length){
						return fullfill();
					}
					Question.create({
						lessonId:list[iQuestion].lessonId,
						content: list[iQuestion].content
					}).exec(function(err, _question){
						if(err) return reject(err);
						dequyFour(list[iQuestion].listAnswer,0,_question.id,function(){
							dequyThree(list, ++iQuestion);
						})
					})
				}
				function dequyFour(list, iAnswer, questionId, callback){
					if(!list) return callback();
					if(iAnswer >= list.length){
						return callback();
					}
					Answer.create({
						questionId:questionId,
						content: list[iAnswer].content,
						isTrue: list[iAnswer].isTrue
					}).exec(function(err, _question){
						if(err) return reject(err);
						dequyFour(list, ++iAnswer, questionId, callback);
					})
				}
				dequyThree(listQuestionCreate,0);
			});
		}
		var createAnswer = function(){
			return new Promise(function(fullfill, reject){
				function dequyFour(list, iAnswer){
					if(!list) return callback();
					if(iAnswer >= list.length){
						return fullfill();
					}
					Answer.create({
						questionId:list[iAnswer].questionId,
						content: list[iAnswer].content,
						isTrue: list[iAnswer].isTrue
					}).exec(function(err, _question){
						if(err) return reject(err);
						dequyFour(list, ++iAnswer);
					})
				}
				dequyFour(listAnswerCreate,0);
			});
		}
		// console.log(listLessionCategoryUpdate);
		// console.log(listLessionUpdate);
		// console.log(listQuestionUpdate);
		// console.log(listAnswerUpdate);

		// console.log(listLessionCategoryCreate);
		// console.log(listLessionCreate);
		// console.log(listQuestionCreate);
		// console.log(listAnswerCreate);
		updateCourse().then(updateLessonCategory).then(updateLesson).then(updateQuestion).then(updateAnswer)
		.then(deleteLessonCategory).then(deleteLesson).then(deleteQuestion).then(deleteAnswer).then(createLessonCategory)
		.then(createLesson).then(createQuestion).then(createAnswer).then(function(){
			res.json({message:'success'});
		}).catch(function(err){
			console.log(err)
			res.json({message:'error'});
		})
	},
	delete: function(req, res){
		var teacher = req.user.id;
		Course.findOne({teacher:teacher,id:req.body.id}).exec(function(err, _course){
			if(err) return res.json({message:'error'});
			if(!_course) return res.json({message:'error'});
			if(_course.status == 'active') return res.json({message:'error'});
			Course.destroy({
				teacher:teacher,
				id:req.body.id
			}).exec(function(err){
				if(err) return res.json({message:'error'});
				return res.json({message:'success'});
			});
		});
		
	},

	listCourse: function(req, res){
		if(checkRole(req) != 'admin') return res.json({message:'error'});
		var count = 0;
		var courses = [];
		let countCourse = function(){
	    	return new Promise(function(fullfill, reject){
	    		Course.count({
					status:req.body.status
				}).exec(function(err, found){
					if(err) return reject(err);
					count = found;
					return fullfill();
				});
	    	})
	    }
	    let find = function(){
	    	return new Promise(function(fullfill, reject){
	    		Course.find({
	    			where:{status:req.body.status},
	    			skip: req.body.skip,
		  			limit: req.body.limit,
					sort:'createdAt'
				}).populate(['categoryId','levelId','teacher']).exec(function(err, _courses){
					if(err) return reject(err);
					for(var i = 0; i < _courses.length; i++){
						delete _courses[i].teacher.password;
					}
					courses = _courses;
					return fullfill();
				});
	    	})
	    }
	    countCourse().then(find).then(function(){
	    	res.json({message:'success',count:count,courses:courses});
	    }).catch(function(err){
	    	console.log(err)
	    	res.json({message:'error'})
	    })
	},
	activeCourse: function(req, res){
		if(checkRole(req) != 'admin') return res.json({message:'error'});
		courseId = req.body.id;
		Course.update({id:courseId},{status:'active'}).exec(function(err, course){
			if(err) return res.json({message:'error'});
			return res.json({message:'success'});
		})
	},
	rejectCourse: function(req, res){
		if(checkRole(req) != 'admin') return res.json({message:'error'});
		courseId = req.body.id;
		Course.update({id:courseId},{status:'reject',adminMessage: req.body.adminMessage}).exec(function(err, course){
			if(err) return res.json({message:'error'});
			return res.json({message:'success'});
		})
	},
	reActive: function(req, res){
		if(checkRole(req) != 'teacher') return res.json({message:'error'});
		Course.update({id:req.body.id, teacher:req.user.id},{status:'waiting'}).exec(function(err, _course){
			if(err) return res.json({message:'error'});
			if(_course.length == 0) return res.json({message:'error'});
			return res.json({message:'success'});
		});
	},
	///CHUC NANG GIO HANG
	addToCard: function(req, res){
		if(!req.user) return res.json({message:'not_login'});
		if(req.user.role!= 'student') return res.json({message:'not_student'});
		if(!req.session.passport.user.cart){
			req.session.passport.user.cart = [];
		}
		var courseId = parseInt(req.body.id);
		var listCourses = [];
		var checkOrderCourse = function(){
			return new Promise(function(fullfill, reject){
				OrderCourse.findOne({course:courseId, student: req.user.id, status:true}).exec(function(err, _od){
					if(err) return reject(err);
					if(_od)	return reject('course_buyed');
					if(req.session.passport.user.cart.indexOf(courseId) < 0){
						req.session.passport.user.cart.push(courseId);
					}
					return fullfill();
				})
			});
		}
		//đệ quy
		var getAllCourse = function(){
			return new Promise(function(fullfill, reject){
				function recurCourse(list, i){
					if(i >= list.length) return fullfill();
					Course.findOne({id:list[i]}).exec(function(err, _course){
						if(err) return reject(err);
						listCourses.push(_course);
						recurCourse(list, ++i);
					})
				}
				recurCourse(req.session.passport.user.cart, 0);
			});
		}
		checkOrderCourse().then(getAllCourse).then(function(){
			res.json({message:'success', listCourses:listCourses})
		}).catch(function(err){	
			res.json({message:err});
		})
	},
	listCart: function(req, res){
		if(checkRole(req) == 'guest') return res.json({message:'not_login'});
		if(checkRole(req) != 'student') return res.json({message:'not_student'});
		if(!req.session.passport.user.cart){
			req.session.passport.user.cart = [];
		}
		// console.log("+++"+req.session.passport.user.cart);
		var listCourses = [];
		var getAllCourse = function(){
			return new Promise(function(fullfill, reject){
				function recurCartCourse(list, i){
					if(i >= list.length) return fullfill();
					Course.findOne({id:list[i]}).exec(function(err, _course){
						if(err) return reject(err);
						listCourses.push(_course);
						recurCartCourse(list, ++i);
					})
				}
				recurCartCourse(req.session.passport.user.cart, 0);
			});
		}
		getAllCourse().then(function(){
			res.json({message:'success', listCourses:listCourses})
		}).catch(function(err){	
			res.json({message:'error'});
		})
	},
	destroyItemCart: function(req, res){
		if(checkRole(req) == 'guest') return res.json({message:'not_login'});
		if(checkRole(req) != 'student') return res.json({message:'error'});
		if(!req.session.passport.user.cart){
			req.session.passport.user.cart = [];
		}
		if(req.session.passport.user.cart.indexOf(req.body.id) >= 0){
			var i = req.session.passport.user.cart.indexOf(req.body.id);
			req.session.passport.user.cart.splice(i, 1);
		}
		res.json({message:'success'});
	},

	//CHUC NANG HOC 
	getCoursePaid: function(req, res){
		var courseId = parseInt(req.body.id);
		var check = function(){
			return new Promise(function(fullfill, reject){
				OrderCourse.findOne({student:req.user.id,course:courseId, status:true}).exec(function(err, od){
					if(err) return reject(err);
					if(!od) return reject('notFound');
					return fullfill(od);
				});
			});
		}
		check().then(function(od){
			Course.findOne(courseId).populate(['categoryId','levelId','lessonCategory']).exec(function(err,_course){
				if(err || !_course) return res.json({message:'error'});
				var course = {};
				course.name = _course.name;
				course.id = _course.id;
				course.category = _course.categoryId;
				course.level = _course.levelId;
				course.status = _course.status;
				course.adminMessage = _course.adminMessage;
				course.price = _course.price;
				course.oldPrice = _course.oldPrice;
				course.pictureData = _course.picture;
				course.generalDescription = _course.generalDescription;
				course.requirement = _course.requirement;
				course.benefit = _course.benefit;
				course.objectAndGoals = _course.objectAndGoals;
				course.listCourseCategory = _course.lessonCategory;


				var getLession = function(){
					return new Promise(function(fullfill, reject){
						//GET LIST LESSION
						function dequyOne(listOne, iOne){
							if(iOne >= listOne.length){
								return fullfill();
							}
							Lesson.find({
								lessonCategoryId:listOne[iOne].id
							}).exec(function(err, lessons){
								if(err) return reject(err);
								listOne[iOne].listLesson = lessons;
								dequyTwo(listOne[iOne].listLesson, 0, function(){
									dequyOne(listOne, ++iOne);
								});
							})
						}
						//GET QUESTION
						function dequyTwo(listTwo, iTwo, callback){
							if(iTwo >= listTwo.length){
								return callback();
							}
							Question.find({
								lessonId: listTwo[iTwo].id
							}).exec(function(err, questions){
								if(err) return reject(err);
								listTwo[iTwo].listQuestion = questions;
								dequyThree(listTwo[iTwo].listQuestion, 0, function(){
									dequyTwo(listTwo, ++iTwo, callback);
								});
							});
						}
						//GET ANSWER
						function dequyThree(listThree, iThree, callback){
							if(iThree >= listThree.length){
								return callback();
							}
							Answer.find({
								questionId: listThree[iThree].id
							}).exec(function(err, answers){
								if(err) return reject(err);
								listThree[iThree].listAnswer = answers;
								dequyThree(listThree, ++iThree, callback);
							})
						}
						dequyOne(course.listCourseCategory, 0);
					});
				}

				getLession().then(function(){
					res.json({course:course,orderCourse:od,message:'success'})
				}).catch(function(err){
					res.json({message:'error'})
				})
			});
		}).catch(function(err){
			res.json({message:'error'})
		})
		
	},

	updateLastTrace: function(req, res){
		OrderCourse.update({student:req.user.id, course: req.body.id, status:true},{lastTrace:req.body.lastTrace}).exec(function(err,_od){
			if(err) return res.json({message:'error'});
			return res.json({message:'success'});
		})
	}
}

