var bcryptPassword = require('../api/services/bcryptPassword.js');
var passport = require('passport'),
	FacebookStrategy = require('passport-facebook').Strategy,
	GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
	LocalStrategy   = require('passport-local').Strategy;
// tạo tài khoản khi đăng nhập bằng facebook
var facebookHandle = function(token, tokenSecret, profile, done) {
	process.nextTick(function(){
		Student.findOne({fid: profile.id}, function(err, student){
			if(student) {
				//Student da co trong DB
				Student.update({id : student.id},{
					fid: profile.id
				}).exec(function afterwards(err, updated){
					student.role = 'student';
					return done(null, student);
				});
			} else {
				var data = {
					fid: profile.id,
					fullname: profile.name.familyName + ' '+ profile.name.givenName,
					avatar: profile.photos[0].value
				};
				Student.create(data, function(err, _created){
					_created.role = 'student';
					return done(err, _created);
				});
			}
		});
	});
}
// tạo tài khoản khi đăng nhập bằng facebook
var googleHandle = function(token, tokenSecret, profile, done) {
	process.nextTick(function(){
		var pictureUrl = profile.photos[0].value.split('?')[0] + '?sz=320';
		var displayName = 'Noname';
		if(profile.displayName){
			displayName = profile.displayName;
		}else if(profile.name.familyName || profile.name.givenName){
			displayName = profile.name.familyName + ' ' + profile.name.givenName;
			displayName = displayName.trim();
		}
		Student.findOne({gid: profile.id}, function(err, student){
			if(student) {
				//Student da co trong DB
				Student.update({id : student.id},{
					gid: profile.id,
					// email:profile.emails[0].value
					// displayName: profile.displayName,
					// picture: pictureUrl
				}).exec(function afterwards(err, _updated){
					student.role = 'student';
					return done(null, student);
				});
			} else {
				//Student CHUA co trong DB
				var data = {
					gid: profile.id,
					fullname: displayName,
					avatar: pictureUrl,
					email:profile.emails[0].value,
					isActive:true
				};
				Student.create(data, function(err, _created){
					console.log(_created)
					_created.role = 'student';
					return done(err, _created);
				});
			}
		});
	});
}
// tạo acc của student bằng tay
var studentLocalHandle = function(username, password, done){
	process.nextTick(function(){
		Student.findOne({email:username}, function(err, student){
			if(err){return done(err)}
			if(!student){
				return done(null, false, {message:'email_not_found'});
			}
			bcryptPassword.decode(password, student.password, function(ok){
				if(!ok)	return done(null, false, { message: 'password_not_correct' });
				if(!student.isActive)	return done(null, false, {message:'account_not_active'});
				student.role = 'student'
				return done(null, student);
			});
		})
	});
}
// tạo tài khoản teacher bằng tay
var teacherLocalHandle = function(username, password, done){
	process.nextTick(function(){
		Teacher.findOne({email:username}, function(err, teacher){
			if(err){return done(err)}
			if(!teacher){
				return done(null, false, {message:'email_not_found'});
			}
			bcryptPassword.decode(password, teacher.password, function(ok){
				if(!ok)	return done(null, false, { message: 'password_not_correct' });
				if(!teacher.isActive)	return done(null, false, {message:'account_not_active'});
				teacher.role = 'teacher'
				return done(null, teacher);
			});
		})
	});
}
// tạo tài khoản admin
var adminLocalHandle = function(username, password, done){
	process.nextTick(function(){
		Admin.findOne({email:username}, function(err, admin){
			if(err){return done(err)}
			if(!admin){
				return done(null, false, {message:'email_not_found'});
			}
			bcryptPassword.decode(password, admin.password, function(ok){
				if(!ok)	return done(null, false, { message: 'password_not_correct' });
				admin.role = 'admin'
				return done(null, admin);
			});
		})
	});
}


// gọi ra khi xác thực thành công để lưu user vào session
passport.serializeUser(function(user, done){
	done(null, {role:user.role, id:user.id});
});
// lấy dữ liệu user dựa vào thông tin lưu trên session và gắn vào role
passport.deserializeUser(function(_user, done){
	if(_user.role == 'student'){
		Student.findOne({id:_user.id}, function(err, student){
			student.role = 'student';
			done(null, student);
		});
	}else if(_user.role == 'teacher'){
		Teacher.findOne({id:_user.id}, function(err, teacher){
			teacher.role = 'teacher';
			done(null, teacher);
		});
	}else if(_user.role == 'admin'){
		Admin.findOne({id:_user.id}, function(err, admin){
			admin.role = 'admin';
			done(null, admin);
		});
	}
});

module.exports.http = {
	customMiddleware: function(app) {
		passport.use(new FacebookStrategy(sails.config.passport.facebook, facebookHandle));
		passport.use(new GoogleStrategy(sails.config.passport.google,googleHandle));
		passport.use('student-local',new LocalStrategy({
		    usernameField: 'email',
		    passwordField: 'password'
		},studentLocalHandle));
		passport.use('teacher-local',new LocalStrategy({
		    usernameField: 'email',
		    passwordField: 'password'
		},teacherLocalHandle));
		passport.use('admin-local',new LocalStrategy({
		    usernameField: 'email',
		    passwordField: 'password'
		},adminLocalHandle));
		//kiểm tra session lấy ra passport.user nếu chưa có thì tạo rỗng
		app.use(passport.initialize());
		// sử dụng session lấy thông tin user rồi gắn vào req.user.
		app.use(passport.session());
	}
	
}

