/**
 * OrderCourseController
 *
 * @description :: Server-side logic for managing ordercourses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	// thanh toán
	payment: function (req, res) {
		if(!req.session.passport.user.cart){
			req.session.passport.user.cart = [];
		}
		if(!req.session.passport.user.cart.length)
			return res.json({message:'error'});
		let payment = function(){
	    	return new Promise(function(fullfill, reject){
	    		function recurPayment(list,i){
	    			console.log(list.length, i)
	    			if(i >= list.length)	return fullfill();
	    			OrderCourse.findOne({
		    			student:req.user.id,
		    			course:list[i]
		    		}).exec(function(err, od){
		    			if(err) return reject(err);
		    			Course.findOne(list[i]).exec(function(err, _course){
		    				if(err) return reject(err);
		    				if(!_course) return reject(err);
			    			if(!od){
			    				OrderCourse.create({student:req.user.id,course:list[i], note:req.body.note, cost:_course.price,datePay:new Date()}).exec(function(err, _od){
			    					if(err) return reject(err);
									recurPayment(list,++i);
			    				})
			    			}else{
			    				OrderCourse.update({id:od.id},{student:req.user.id,course:list[i], note:req.body.note, cost:_course.price,datePay:new Date()}).exec(function(err, _od){
			    					if(err) return reject(err);
									recurPayment(list,++i);
			    				})
			    			}
		    			})
		    		});
	    		}
				recurPayment(req.session.passport.user.cart,0);
	    		
	    	})
	    }
	    payment().then(function(){
	    	req.session.passport.user.cart = [];
	    	res.json({message:'success'});
	    }).catch(function(err){
	    	res.json({message:'error'});
	    })
	}
};

