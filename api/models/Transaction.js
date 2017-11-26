/**
 * Transaction.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	id:{
  		type: 'integer',
  		primaryKey: true,
    	autoIncrement: true
  	},
  	teacher:{
  		model:'teacher'
  	},
  	reqMoney:{
  		type:'integer'
  	},
  	status:{
  		type:'boolean',
  		defaultsTo: false
  	},
  	note:{
  		type:'text',
      defaultsTo: ''
  	}
  }
};

