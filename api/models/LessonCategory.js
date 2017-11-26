/**
 * LessonCategory.js
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
  	courseId:{
  		model:'course'
  	},

    lesson:{
      collection: 'lesson',
      via:'lessonCategoryId'
    },






    name:{
    	type: 'string',
  		size: 256
    },
    order:{
    	type: 'integer'
    }
  },
  afterDestroy: function(destroyedRecords, cb) {
    function dequy(list, i){
      if(i >= list.length){
        return cb();
      }
      Lesson.destroy({
        lessonCategoryId: list[i].id
      }).exec(function(err){
        dequy(list, ++i);
      });
    }
    dequy(destroyedRecords,0);
  }
};

