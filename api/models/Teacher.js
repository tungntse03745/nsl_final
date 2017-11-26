/**
 * Teacher.js
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

  	fullname:{
  		type: 'string',
  		size: 100
  	},

  	age:{
  		type: 'integer',
  	},

  	phone:{
  		type: 'string',
  	},

  	address:{
  		type: 'string'
  	},

  	indentityCard:{
  		type: 'string',
  	},


    job:{
      type: 'string',
      size: 45,
      defaultsTo: ''
    },

  	description:{
      type:'TEXT'
    },

  	email:{
  		type: 'string',
  		unique: true,
  		size: 45
  	},

  	password: {
  		type: 'string',
  	},

  	avatar:{
      type: 'string'
    },

    isActive:{
      type:'boolean',
      defaultsTo: false,
    },

    status:{
      type:'String',
      enum: ['waiting','reject','success'],
      defaultsTo: 'waiting'
    },

    approveUpdateDate:{
      type:'datetime'
    },

    balance:{
      type:'integer',
      defaultsTo: 0
    },

    course:{
      collection: 'course',
      via:'teacher'
    },
  },
  beforeCreate: function(user, next) {
    user.approveUpdateDate = new Date();
    if(!user.password){
      return next();
    }
    require('../services/bcryptPassword.js').encode(user.password, function(hash){
      user.password = hash;
      return next();
    });
  },

  beforeUpdate: function(user, next) {
    if(!user.password){
      return next();
    }
    require('../services/bcryptPassword.js').encode(user.password, function(hash){
      user.password = hash;
      return next();
    });
  }
};

