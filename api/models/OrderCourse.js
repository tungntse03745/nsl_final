/**
 * OrderCourse.js
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
  	course:{
      model:'course'
    },
    student:{
    	model: 'student'
    },
    cost:{
    	type: 'integer'
    },
    status:{
    	type:'boolean',
    	defaultsTo: false
    },
    note:{
    	type:'string',
    },
    lastTrace:{
    	type:'string',
      defaultsTo: '0-0'
    },
    datePay:{
      type:'datetime'
    }
  }
};

