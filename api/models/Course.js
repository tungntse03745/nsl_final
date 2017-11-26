/**
 * Course.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var rimraf = require('rimraf');
var path = require('path');
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

  	categoryId:{
  		model:'category'
  	},
  	levelId:{
  		model:'level'
  	},
    lessonCategory:{
      collection: 'lessonCategory',
      via:'courseId'
    },
    orderCourse:{
      collection: 'orderCourse',
      via:'course'
    },

    name:{
      type:'string',
      size: 256
    },
  	price:{
  		type: 'integer'
  	},
  	oldPrice:{
  		type: 'integer'
  	},
  	picture:{
      type: 'text'
    },
    generalDescription:{
    	type:'text'
    },
    requirement:{
    	type:'text'
    },
    benefit:{
    	type:'text'
    },
    objectAndGoals:{
    	type:'text'
    },
    status:{
      type: 'string',
      enum: ['waiting','reject','save','active'],
      defaultsTo: 'waiting'
    },
    adminMessage:{
      type:'text'
    }
  },
  afterDestroy: function(destroyedRecords, cb) {
    function dequy(list, i){
      if(i >= list.length){
        return cb();
      }
      LessonCategory.destroy({
        courseId: list[i].id
      }).exec(function(err){
        var folderPicuture = path.join(__dirname, '../../assets/coverPictures/' + list[i].id);
        rimraf(folderPicuture, function () { dequy(list, ++i);});
      });
    }
    dequy(destroyedRecords,0);
      
  }
};

