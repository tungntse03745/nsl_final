/**
 * TransactionController
 *
 * @description :: Server-side logic for managing transactions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	withdraw:function (req, res) {
		console.log(req.body)
		if(req.body.reqMoney > req.user.balance){
			return res.json({message:'not_enough_money'});
		}
		let createTrans = function(){
	    	return new Promise(function(fullfill, reject){
				Transaction.create({
					reqMoney:req.body.reqMoney,
					note: req.body.note,
					teacher:req.user.id
				}).exec(function(err, trans) {
					if(err) return reject(err);
					return fullfill();
				})
	    	})
	    }
	    let downMoney = function(){
	    	return new Promise(function(fullfill, reject){

				Teacher.update(req.user.id,{balance:req.user.balance - req.body.reqMoney}).exec(function(err, _t){
					if(err) return reject(err);
					return fullfill();
				})
	    	})
	    }
	    createTrans().then(downMoney).then(function(){
	    	res.json({message:'success'});
	    }).catch(function(err){
	    	res.json({message:err});
	    })
	}
};

