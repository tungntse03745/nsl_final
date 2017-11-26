var mysql = {
	selectTeacherHasMostCourse: function (number) {
		var query = 'SELECT c.teacher,u.fullname,(select count(*) from newschema.course where newschema.course.teacher = c.teacher and newschema.course.status ="active") as total ' +
					'FROM newschema.course as c, newschema.teacher as u ' +
					'WHERE c.teacher = u.id ' +
					'GROUP BY c.teacher ' +
					'ORDER BY total DESC ' +
					'LIMIT '+ number;
		var db = sails.config.connections.someMysqlServer.database;
		String.prototype.replaceAll = function(search, replacement) {
		    var target = this;
		    return target.replace(new RegExp(search, 'g'), replacement);
		};
		query = query.replaceAll('newschema',db);
		return query;
	}
}
module.exports = mysql