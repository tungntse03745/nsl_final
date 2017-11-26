/**
 * CategoryController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var checkRole = require('../services/checkRole.js').check;
module.exports = {
	// search detail of 1 category
	listSimpleCategory: function(req, res){
		var count = 0;
		var categories = [];
		let countCategory = function(){
	    	return new Promise(function(fullfill, reject){
	    		Category.count({
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
	    		Category.find(where).exec(function(err, lists){
					if(err) return reject(err);
					categories = lists;
					return fullfill();
				});
	    	})
	    }
	    countCategory().then(get).then(function(){
	    	res.json({categories:categories,count:count,message:'success'});
	    }).catch(function(err){
	    	res.json({message:'error'})
	    })
		
	},
	countCourse: function(req, res){
		Category.findOne({id:req.body.id}).populate('course').exec(function(err,_category){
			if(err) return res.json({message:'error'});
			if(!_category) return res.json({message:'error'});
			return res.json({message:'success',count: _category.course.length});
		})
	},
	addCategory: function(req, res){
		Category.create({name: req.body.name}).exec(function(err, categories){
			if(err) return res.json({message:'error'});
			return res.json({message:'success'});
		})
	},
	editCategory: function(req, res){
		Category.update({id:req.body.id},{name: req.body.name}).exec(function(err, categories){
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
	    		Category.findOne({id:changeTo}).exec(function(err, _Category){
	    			if(err) return reject(err);
	    			if(!_Category) return reject('Category_not_exist');
	    			Course.update({categoryId:id},{categoryId:changeTo}).exec(function(err, _Category){
		    			if(err) return reject(err);
		    			return fullfill();
		    		})
	    		})
	    		
	    	})
	    }
	    var removeCategory = function(){
	    	return new Promise(function(fullfill, reject){
	    		Category.findOne({id:req.body.id}).populate('course').exec(function(err, _Category){
	    			if(err) return reject(err);
					if(!_Category) return reject(err);
					if(_Category.course.length) return reject('contain _course');
					Category.destroy({id:id}).exec(function(err){
						if(err) return reject(err);
						return fullfill();
					})
	    		});
	    	})
	    }
	    updateCount().then(removeCategory).then(function(){
	    	res.json({message:'success'});
	    }).catch(function(err){
	    	res.json({message:'error', err:err})
	    })
	}
};

