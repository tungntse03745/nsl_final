/**
 * Question.js
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
  	lessonId:{
  		model:'lesson'
  	},

    answer:{
      collection: 'answer',
      via:'questionId'
    },






    content:{
    	type: 'string',
  		size: 256
    }
  },
  afterDestroy: function(destroyedRecords, cb) {
    function dequy(list, i){
      if(i >= list.length){
        return cb();
      }
      Answer.destroy({
        questionId: list[i].id
      }).exec(function(err){
        dequy(list, ++i);
      });
    }
    dequy(destroyedRecords,0);
  }
};

