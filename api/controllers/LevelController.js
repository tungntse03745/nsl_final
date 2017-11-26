/**
 * LevelController
 *
 * @description :: Server-side logic for managing levels
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var checkRole = require('../services/checkRole.js').check;
module.exports = {
	listSimpleLevel: function(req, res){
		var count = 0;
		var levels = [];
		let countLevel = function(){
	    	return new Promise(function(fullfill, reject){
	    		Level.count({
				where:{
					name:{'contains':req.body.name}
				}}).exec(function(err, found){
	    			if(err) return reject(err);
	    			count = found;
	    			return fullfill();
	    		})
	    	})
	    }
	    let get = function(){
	    	return new Promise(function(fullfill, reject){
	    		var where = {};
				console.log(req.body)
				if(!req.body.name){
					where = {
						where:{},
						sort:'id'
					}
				}else{
					where = {
						select:['id','name'],
						where:{
							name:{'contains':req.body.name}
						},
						skip: req.body.skip,
			  			limit: req.body.limit,
						sort:'id'
					};
				}
	    		Level.find(where).exec(function(err, lists){
					if(err) return reject(err);
					levels = lists;
					return fullfill();
				});
	    	})
	    }
	    countLevel().then(get).then(function(){
	    	res.json({levels:levels,count:count,message:'success'});
	    }).catch(function(err){
	    	res.json({message:'error'})
	    })
		
	},
	countCourse: function(req, res){
		Level.findOne({id:req.body.id}).populate('course').exec(function(err,_level){
			if(err) return res.json({message:'error'});
			if(!_level) return res.json({message:'error'});
			return res.json({message:'success',count: _level.course.length});
		})
	},
	addLevel: function(req, res){
		Level.create({name: req.body.name}).exec(function(err, levels){
			if(err) return res.json({message:'error'});
			return res.json({message:'success'});
		})
	},
	editLevel: function(req, res){
		Level.update({id:req.body.id},{name: req.body.name}).exec(function(err, categories){
			if(err) return res.json({message:'error'});
			return res.json({message:'success'});
		})
	},
	remove: function(req, res){
		var id = req.body.id;
		var changeTo = req.body.changeTo;

		var updateCount = function(){
	    	return new Promise(function(fullfill, reject){
	    		if(!changeTo) return fullfill();
	    		Level.findOne({id:changeTo}).exec(function(err, _level){
	    			if(err) return reject(err);
	    			if(!_level) return reject('level_not_exist');
	    			Course.update({levelId:id},{levelId:changeTo}).exec(function(err, _level){
		    			if(err) return reject(err);
		    			return fullfill();
		    		})
	    		})
	    		
	    	})
	    }
	    var removeLevel = function(){
	    	return new Promise(function(fullfill, reject){
	    		Level.findOne({id:req.body.id}).populate('course').exec(function(err, _level){
	    			if(err) return reject(err);
					if(!_level) return reject(err);
					if(_level.course.length) return reject('contain _course');
					Level.destroy({id:id}).exec(function(err){
						if(err) return reject(err);
						return fullfill();
					})
	    		});
	    	})
	    }
	    updateCount().then(removeLevel).then(function(){
	    	res.json({message:'success'});
	    }).catch(function(err){
	    	res.json({message:'error', err:err})
	    })
	}
};

