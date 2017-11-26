/**
 * AdminController
 *
 * @description :: Server-side logic for managing admins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
	listTeacher: function(req, res){
		var teacherStatus = req.body.teacherStatus;
		var count = 0;
		var teachers = [];
		let countTeacher = function(){
	    	return new Promise(function(fullfill, reject){
	    		Teacher.count({
						where:{
							status:teacherStatus,
							email:{'contains':req.body.email}
						}
					}).exec(function(err, found){
	    			if(err) return reject(err);
	    			count = found;
	    			return fullfill();
	    		})
	    	})
	    }
	    let getTeachers = function(){
	    	return new Promise(function(fullfill, reject){
	    		Teacher.count({teacherStatus:teacherStatus}).exec(function(err, found){
	    			Teacher.find({
						where:{
							status:teacherStatus,
							email:{'contains':req.body.email}
						},
						skip: req.body.skip,
			  			limit: req.body.limit,
						sort:'approveUpdateDate'
					}).exec(function(err, lists){
						if(err) return reject(err);
						teachers = lists;
						return fullfill();
					});
	    		})
	    	})
	    }
	    countTeacher().then(getTeachers).then(function(){
	    	res.json({teachers:teachers,count:count,message:'success'});
	    }).catch(function(err){
	    	res.json({message:'error'})
	    })
		
	},
	updateAcountToTeacherRole: function(req, res){
		Teacher.update({email:req.body.email},{status:'success'}).exec(function(err, users){
			if(err) return res.json({message:'error'});
			return res.json({message:'success'});
		});
	},
	rejectAcountToTeacherRole: function(req, res){
		Teacher.update({email:req.body.email},{status:'reject'}).exec(function(err, users){
			if(err) return res.json({message:'error'});
			return res.json({message:'success'});
		});
	},

	listActiveOrder: function(req, res){
		var count = 0;
		var orders = [];
		let countOrder = function(){
	    	return new Promise(function(fullfill, reject){
	    		OrderCourse.count({
						where:{
							status:req.body.status,
							note:{'contains':req.body.note}
						}
					}).exec(function(err, found){
	    			if(err) return reject(err);
	    			count = found;
	    			return fullfill();
	    		})
	    	})
	    }
	    let getOrder = function(){
	    	return new Promise(function(fullfill, reject){
	    		OrderCourse.find({
					where:{
						status:req.body.status,
						note:{'contains':req.body.note}
					},
					skip: req.body.skip,
		  			limit: req.body.limit,
					sort:'datePay'
				}).populateAll().exec(function(err, lists){
					if(err) return reject(err);
					orders = lists;
					return fullfill();
				});
	    	})
	    }
	    countOrder().then(getOrder).then(function(){
	    	res.json({orders:orders,count:count,message:'success'});
	    }).catch(function(err){
	    	res.json({message:'error'})
	    })
	},
	changeStatusOrder: function(req, res){
		OrderCourse.findOne({id:req.body.id}).populateAll().exec(function(err, od){
			if(err) return res.json({message:'error'});
			if(!od) return res.json({message:'error'});
			OrderCourse.update({id:req.body.id},{status:!od.status}).exec(function(err, _od){
				if(err) res.json({message:'error'});
				res.json({message:'success'});
			});
			Course.findOne(od.course.id).populateAll().exec(function(err,_course){
				var x = od.cost;
				if(od.status) x = x * -1;
				Teacher.update({id:_course.teacher.id},{balance:_course.teacher.balance + x}).exec(function(){

				});
			});
		})

	},
	////////////////////
	listTransaction: function(req, res){
		var count = 0;
		var transactions = [];
		let countTrans = function(){
	    	return new Promise(function(fullfill, reject){
	    		Transaction.count({
						where:{
							status:req.body.status,
							note:{'contains':req.body.note}
						}
					}).exec(function(err, found){
	    			if(err) return reject(err);
	    			count = found;
	    			return fullfill();
	    		})
	    	})
	    }
	    let getTrans = function(){
	    	return new Promise(function(fullfill, reject){
	    		Transaction.find({
					where:{
						status:req.body.status,
						note:{'contains':req.body.note}
					},
					skip: req.body.skip,
		  			limit: req.body.limit,
					sort:'createdAt DESC'
				}).populateAll().exec(function(err, lists){
					if(err) return reject(err);
					transactions = lists;
					return fullfill();
				});
	    	})
	    }
	    countTrans().then(getTrans).then(function(){
	    	res.json({transactions:transactions,count:count,message:'success'});
	    }).catch(function(err){
	    	res.json({message:'error'})
	    })
	},
	changeStatusTransaction: function(req, res){
		Transaction.findOne({id:req.body.id}).populateAll().exec(function(err, trans){
			if(err) return res.json({message:'error'});
			if(!trans) return res.json({message:'error'});
			Transaction.update({id:req.body.id},{status:!trans.status}).exec(function(err, _trans){
				if(err) res.json({message:'error'});
				res.json({message:'success'});
			});
		})

	},
};

