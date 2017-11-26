var myApp;
(function () {
	myApp = angular.module('myApp',['ui.bootstrap','trumbowyg-ng','ngSanitize','chart.js']);
	//filter:search name have this string
	myApp.filter('vnd', function() {
		return function(input) {
			//funkyStringSplit: split 1 element have 3 character
			function funkyStringSplit( s ){
			    var i = s.length % 3;
			    var parts = i ? [ s.substr( 0, i ) ] : [];
			    for( ; i < s.length ; i += 3 )
			    {
			        parts.push( s.substr( i, 3 ) );
			    }
			    return parts;
			}
			var str = input + '';
			arr = funkyStringSplit(str);
			if(arr.length == 0 || input==undefined) return '';
			if(arr.length ==1) return str + ' đ';
			if(arr.length > 1){
				var x = arr[0];
				for(var i = 1; i < arr.length; i++){
					x += ',' + arr[i]; 
				}
				x += 'đ';
				return x;
			}
		};
	});
	// count percent of sale
	myApp.filter('pricepercent', function() {
		return function(input) {
			var arr = input.split('-');
			var old = parseInt(arr[0]);
			var _new = parseInt(arr[1]);
			var x = parseInt((old - _new) / old * 100);
			return x + '%';
		};
	});
	//
	myApp.filter('space', function() {
		return function(input) {
			console.log(input)
			input = input.replace(/\n/g, "<br>");
			return input;
		};
	});
	//format datetime
	myApp.filter('datetime', function() {
		return function(input) {
			x = new Date(input)
			dd= x.getDate();
			MM = x.getMonth() + 1;
			yyyy = x.getFullYear();
			HH = x.getHours();
			mm = x.getMinutes();
			return dd + ', tháng ' + MM + ', ' + yyyy + ' lúc ' + HH + ':' + mm;
		};
	});
	myApp.filter('startFrom', function() {
	    return function(input, start) {
	        start = +start; //parse to int
	        return input.slice(start);
	    }
	});


})();
(function () {
	// define error //define content of tooltip to report user
	var strVar="";
	strVar += "<div class=\"validate-input\">";
	strVar += "	<input type=\"{{vType}}\" class=\"form-control\" placeholder=\"{{vPlaceholder}}\" name=\"{{vName}}\" ng-model=\"vModel\" tooltip-enable=\"{{!vForm[vName].$valid}}\" tooltip-placement=\"{{vTooltipPlacement}}\" uib-tooltip-template=\"'validate.html'\" ng-class=\"!vForm[vName].$valid&&vForm.$submitted?'err':''\" ng-required=\"{{vRequired}}\" ng-minlength=\"{{vMinLength}}\" ng-maxlength=\"{{vMaxLength}}\" ng-min=\"{{vMin}}\" ng-max=\"{{vMax}}\">";
	strVar += "	<!-- VALIDATE TEN KHOA HOC -->";
	strVar += "	<script type=\"text\/ng-template\" id=\"validate.html\">";
	strVar += "		<div ng-show=\"vForm[vName].$error.required\">Không được bỏ trống<\/div>";
	strVar += "		<div ng-show=\"vForm[vName].$error.email\">Phải là email<\/div>";
	strVar += "		<div ng-show=\"vForm[vName].$error.minlength\">Lớn hơn {{vMinLength}} ký tự<\/div>";
	strVar += "		<div ng-show=\"vForm[vName].$error.maxlength\">Nhỏ hơn {{vMaxLength}} ký tự<\/div>";
	strVar += "		<div ng-show=\"vForm[vName].$error.min\">Lớn hơn {{vMin}}<\/div>";
	strVar += "		<div ng-show=\"vForm[vName].$error.max\">Nhỏ hơn {{vMax}}<\/div>";
	strVar += "		<div ng-repeat=\"validation in vCustomValidations\">";
	strVar += "			<div ng-show=\"vForm[vName].$error[validation.name]\">{{validation.message}}<\/div>";
	strVar += "		<\/div>";
	strVar += "	<\/script>";
	strVar += "	<!-- END -->";
	strVar += "<\/div>";

	myApp.directive('validateInput', function(){
		return{
			restrict: 'AEM',
			template: strVar,
			replace: true,
			scope:{
				vModel: '=',
				vForm: '=',
				vName: '@',
				vType: '@',
				vPlaceholder: '@',
				vTooltipPlacement: '@',
				vRequired: '@',
				vMinLength: '@',
				vMaxLength: '@',
				vMin: '@',
				vMax: '@',
				vCustomValidations : '='
			},
			link: function(scope, elements, attrs){
				if(!scope.vCustomValidations) return;
				scope.$watch('vModel', function(newValue, oldValue) {
	                for(var i = 0; i < scope.vCustomValidations.length; i++){
						scope.vCustomValidations[i].func(newValue,function(name, isValid){
			                scope.vForm[scope.vName].$setValidity(name, isValid);
						});
					}
	            });
			},
			transclude: true,
			controller: function($scope){
			}
		}
	});
})(); 
(function () {
	myApp.controller('activeCourseCtr', function($scope, $http){
		$scope.searchStatus = false;
		$scope.searchNote = '';
		$scope.pagging = {
			limit:20,
			current:0,
			pages:0
		}
		$scope.search = function(callback){
			var skip = $scope.pagging.current * $scope.pagging.limit;
			$http.post("/admin/list-active-order",{status:$scope.searchStatus,note:$scope.searchNote,skip:skip,limit:$scope.pagging.limit},{}).then(function(res){
	  			$scope.pagging.pages = Math.ceil(res.data.count / $scope.pagging.limit);
	  			if(res.data.message == 'success'){
	  				console.log(res.data)
	  				$scope.orders = res.data.orders;
	  				callback();
	  			}else{
	  				callback(true);
	  			}
	  		}).catch(function(err){
	  			callback(true);
	  		})
		}
		$scope.search(function(){});

		$scope.$watch(function(scope) { return scope.searchStatus },
			function(newValue, oldValue) {
				$scope.search();
			}
		);
		$scope.$watch(function(scope) { return scope.searchNote },
			function(newValue, oldValue) {
				$scope.search();
			}
		);
		$scope.active = function(_id){
			$http.post("/admin/change-status-order",{id:_id},{}).then(function(res){
	  			if(res.data.message == 'success'){
	  				$scope.search()
	  			}else{
	  				utils.alert({
	                    title:'Thông báo',
	                    msg: 'Update Không thành công'
	                });
	  			}
	  		})
		}
		$scope.nextPage = function(){
	  		if($scope.pagging.current == $scope.pagging.pages - 1) return;
	  		var recorvery = $scope.pagging.current++;
	  		$scope.search(function(err){
	  			if(err) return $scope.pagging.current = recorvery;
	  		})
	  	}
	  	$scope.prePage = function(){
	  		if($scope.pagging.current == 0) return;
	  		var recorvery = $scope.pagging.current--;
	  		$scope.search(function(err){
	  			if(err) return $scope.pagging.current = recorvery;
	  		})
	  	}
	});
})();


(function () {
	myApp.controller('adminTransactionCtr', function($scope, $http){
		$scope.searchStatus = false;
		$scope.searchNote = '';
		$scope.pagging = {
			limit:20,
			current:0,
			pages:0
		}
		$scope.search = function(callback){
			var skip = $scope.pagging.current * $scope.pagging.limit;
			$http.post("/admin/list-transaction",{status:$scope.searchStatus,note:$scope.searchNote,skip:skip,limit:$scope.pagging.limit},{}).then(function(res){
	  			$scope.pagging.pages = Math.ceil(res.data.count / $scope.pagging.limit);
	  			if(res.data.message == 'success'){
	  				console.log(res.data)
	  				$scope.transactions = res.data.transactions;
	  				callback();
	  			}else{
	  				callback(true);
	  			}
	  		}).catch(function(err){
	  			callback(true);
	  		})
		}
		$scope.search(function(){});

		$scope.$watch(function(scope) { return scope.searchStatus },
			function(newValue, oldValue) {
				$scope.search();
			}
		);
		$scope.$watch(function(scope) { return scope.searchNote },
			function(newValue, oldValue) {
				$scope.search();
			}
		);
		$scope.confirm = function(_id){
			$http.post("/admin/change-status-transaction",{id:_id},{}).then(function(res){
	  			if(res.data.message == 'success'){
	  				$scope.search()
	  			}else{
	  				utils.alert({
	                    title:'Thông báo',
	                    msg: 'Update Không thành công'
	                });
	  			}
	  		})
		}
		$scope.nextPage = function(){
	  		if($scope.pagging.current == $scope.pagging.pages - 1) return;
	  		var recorvery = $scope.pagging.current++;
	  		$scope.search(function(err){
	  			if(err) return $scope.pagging.current = recorvery;
	  		})
	  	}
	  	$scope.prePage = function(){
	  		if($scope.pagging.current == 0) return;
	  		var recorvery = $scope.pagging.current--;
	  		$scope.search(function(err){
	  			if(err) return $scope.pagging.current = recorvery;
	  		})
	  	}
	});
})();


(function () {
	myApp.controller('approveCourseCtr', function($scope, $http, $sce ){
		$scope.courseStatus = 'waiting';
		$scope.viewTeacher = {};
		$scope.pagging = {
			limit:10,
			current:0,
			pages:0
		}
		$scope.search = function(callback){
			var skip = $scope.pagging.current * $scope.pagging.limit;
			$http.post("/admin/list-course",{status:$scope.courseStatus,skip:skip,limit:$scope.pagging.limit},{}).then(function(res){
	  			console.log(res.data)
	  			$scope.pagging.pages = Math.ceil(res.data.count / $scope.pagging.limit);
	  			if(res.data.message == 'success'){
	  				$scope.courses = res.data.courses;
	  				callback();
	  			}else{
	  				callback(true);
	  			}
	  		}).catch(function(err){
	  			callback(true);
	  		})
		}
		$scope.search(function(){});
		$scope.nextPage = function(){
	  		if($scope.pagging.current == $scope.pagging.pages - 1) return;
	  		var recorvery = $scope.pagging.current++;
	  		$scope.search(function(err){
	  			if(err) return $scope.pagging.current = recorvery;
	  		})
	  	}
	  	$scope.prePage = function(){
	  		if($scope.pagging.current == 0) return;
	  		var recorvery = $scope.pagging.current--;
	  		$scope.search(function(err){
	  			if(err) return $scope.pagging.current = recorvery;
	  		})
	  	}
		$scope.view = function(teacher,id){
			$scope.viewTeacher = teacher;
			$scope.load(id);
		}
		$scope.load = function(id){
			$http.post("/course/get-details",{id:id},{}).then(function(res){
				console.log(res)
	  			if(res.data.message == 'success'){
	  				$scope.course = res.data.course;
	  				for(var iChapter = 0; iChapter < $scope.course.listCourseCategory.length; iChapter++){
	  					$scope.course.listCourseCategory[iChapter].UIshow = true;
	  				}
	  				$scope.course.pictureUpload = false;
	  				$scope.course.listCourseCategoryDelete = [];
	  				$scope.course.listLessonDelete  = [];
	  				$scope.course.listQuestionDelete  = [];
	  				$scope.course.listAnswerDelete  = [];
	  				$scope.course.listCourseCategory.sort(function(a, b){
						var keyA = new Date(a.order),
						keyB = new Date(b.order);
						// Compare the 2 dates
						if(keyA < keyB) return -1;
						if(keyA > keyB) return 1;
						return 0;
					});
					for(var iChapter = 0; iChapter < $scope.course.listCourseCategory.length; iChapter++){
						$scope.course.listCourseCategory[iChapter].listLesson.sort(function(a, b){
							var keyA = new Date(a.order),
							keyB = new Date(b.order);
							// Compare the 2 dates
							if(keyA < keyB) return -1;
							if(keyA > keyB) return 1;
							return 0;
						});
					}

					for(var iChapter = 0; iChapter < $scope.course.listCourseCategory.length; iChapter++){
	  					for(var iLesson = 0; iLesson < $scope.course.listCourseCategory[iChapter].listLesson.length; iLesson++){
	  						console.log('sa')
	  						console.log(iChapter,iLesson)
	  						$scope.getVideoStream(iChapter,iLesson);
	  					}
	  				}
	  			}
	  		});
		}



		$scope.getVideoStream = function(iChapter, iLesson){
			if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].typeVideo == 'youtube'){
				var streamId = utils.getLinkYoutube($scope.course.listCourseCategory[iChapter].listLesson[iLesson].linkVideo);
				if(!streamId){
					$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = false;
					return;
				}
				$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + streamId + '?rel=0&amp;showinfo=0');
			}else if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].typeVideo == 'drive'){
				var streamId = utils.getLinkDrive($scope.course.listCourseCategory[iChapter].listLesson[iLesson].linkVideo);
				if(!streamId){
					$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = false;
					return;
				}
				$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = $sce.trustAsResourceUrl('https://drive.google.com/file/d/' + streamId + '/preview');
			}else{
				$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = false;
				$timeout(function () {
					$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = $sce.trustAsResourceUrl($scope.course.listCourseCategory[iChapter].listLesson[iLesson].linkVideo);
				}, 100);
			}
		}

		$scope.activeCourse = function(courseId, courseName){
			$http.post("/admin/active-course",{id:courseId},{}).then(function(res){
				if(res.data.message == 'success'){
					utils.alert({
	                    title:'Thông báo',
	                    msg: 'Đã kích hoạt khóa học "' + courseName + '"'
	                });
	                $scope.search(function(){});
				}else{
					utils.alert({
	                    title:'Thông báo',
	                    msg: 'Có lỗi xảy ra' 
	                });
				}
	  		});
		}

		$scope.rejectCourse = function(courseId, courseName){
			$http.post("/admin/reject-course",{id:courseId, adminMessage:$scope.adminMessage},{}).then(function(res){
				if(res.data.message == 'success'){
					utils.alert({
	                    title:'Thông báo',
	                    msg: 'Đã từ chối khóa học "' + courseName + '"'
	                });
	                $scope.adminMessage = '';
	                $('#viewTeacherModal').modal('hide')
	                $scope.search(function(){});
				}else{
					utils.alert({
	                    title:'Thông báo',
	                    msg: 'Có lỗi xảy ra' 
	                });
				}
	  		});
		}
	});
	
})();
(function () {
	myApp.controller('approveTeacherCtr', function($scope, $http){
		$scope.teacherStatus = 'waiting';
		$scope.viewTeacher = {};
		$scope.pagging = {
			limit:10,
			current:0,
			pages:0
		}
		$scope.searchEmail = '';
		$scope.search = function(callback){
			var skip = $scope.pagging.current * $scope.pagging.limit;
			$http.post("/admin/list-teacher",{email:$scope.searchEmail,teacherStatus:$scope.teacherStatus,skip:skip,limit:$scope.pagging.limit},{}).then(function(res){
	  			console.log(res.data)
	  			$scope.pagging.pages = Math.ceil(res.data.count / $scope.pagging.limit);
	  			if(res.data.message == 'success'){
	  				$scope.teachers = res.data.teachers;
	  				callback();
	  			}else{
	  				callback(true);
	  			}
	  		}).catch(function(err){
	  			callback(true);
	  		})
		}
		$scope.search(function(){});
		$scope.$watch(function(scope) { return scope.searchEmail },
			function(newValue, oldValue) {
				$scope.search();
			}
		);
		$scope.nextPage = function(){
	  		if($scope.pagging.current == $scope.pagging.pages - 1) return;
	  		var recorvery = $scope.pagging.current++;
	  		$scope.search(function(err){
	  			if(err) return $scope.pagging.current = recorvery;
	  		})
	  	}
	  	$scope.prePage = function(){
	  		if($scope.pagging.current == 0) return;
	  		var recorvery = $scope.pagging.current--;
	  		$scope.search(function(err){
	  			if(err) return $scope.pagging.current = recorvery;
	  		})
	  	}
	  	$scope.acceptTeacher = function(email){
			$http.post("/admin/update-acount-to-teacher-role",{email:email},{}).then(function(res){
	  			if(res.data.message == 'success'){
	  				utils.alert({
	                    title:'Thông báo',
	                    msg: 'Đã nâng cấp lên giáo viên cho user:' + email
	                });
	  				$scope.search(function(){});
	  			}else{
	  				utils.alert({
	                    title:'Thông báo',
	                    msg: 'Update Không thành công'
	                });
	  			}
	  		}).catch(function(err){		
				utils.alert({
                    title:'Thông báo',
                    msg: 'Update Không thành công'
                });
	  		});
	  	}
	  	$scope.rejectTeacher = function(email){
			$http.post("/admin/reject-acount-to-teacher-role",{email:email},{}).then(function(res){
	  			if(res.data.message == 'success'){
	  				utils.alert({
	                    title:'Thông báo',
	                    msg: 'Đã từ chối đơn của ' + email
	                });
	  				$scope.search(function(){});
	  			}else{
	  				utils.alert({
	                    title:'Thông báo',
	                    msg: 'Reject Không thành công'
	                });
	  			}
	  		}).catch(function(err){		
				utils.alert({
                    title:'Thông báo',
                    msg: 'Reject Không thành công'
                });
	  		});
	  	}
		$scope.view = function(teacher){
			 $scope.viewTeacher = teacher;
		}
	});
	
})();
(function () {
	myApp.controller('categoryCtr', function($scope, $http){
		$scope.pagging = {
			limit:5,
			current:0,
			pages:0
		}
		$scope.searchCategoryName = '';
		$scope.newCategoryName = '';
		$scope.search = function(callback){
			var skip = $scope.pagging.current * $scope.pagging.limit;
			$http.post("/list-simple-category",{name:$scope.searchCategoryName,skip:skip,limit:$scope.pagging.limit},{}).then(function(res){
	  			console.log(res.data)
	  			$scope.pagging.pages = Math.ceil(res.data.count / $scope.pagging.limit);
	  			if(res.data.message == 'success'){
	  				$scope.categories = res.data.categories;
	  				callback();
	  			}else{
	  				callback(true);
	  			}
	  		}).catch(function(err){
	  			callback(true);
	  		})
		}
		$scope.search(function(){});
		$scope.$watch(function(scope) { return scope.searchCategoryName },
			function(newValue, oldValue) {
				$scope.search();
			}
		);
		$scope.nextPage = function(){
	  		if($scope.pagging.current == $scope.pagging.pages - 1) return;
	  		var recorvery = $scope.pagging.current++;
	  		$scope.search(function(err){
	  			if(err) return $scope.pagging.current = recorvery;
	  		})
	  	}
	  	$scope.prePage = function(){
	  		if($scope.pagging.current == 0) return;
	  		var recorvery = $scope.pagging.current--;
	  		$scope.search(function(err){
	  			if(err) return $scope.pagging.current = recorvery;
	  		})
	  	}
	  	$scope.addCategory = function(validation){
	  		if(!validation) return;
	  		$http.post("/add-category",{name:$scope.newCategoryName},{}).then(function(res){
	  			console.log(res.data)
	  			if(res.data.message == 'success'){
	  				utils.alert({
	                    title:'Thông báo',
	                    msg: 'Thêm mới "' + $scope.newCategoryName + '" thành công'
	                });
	                $scope.newCategoryName = '';
	                $scope.search(function(){}); 
	  			}else{
	  				utils.alert({
	                    title:'Thông báo',
	                    msg: 'Có lỗi xảy ra'
	                });
	  			}
	  		}).catch(function(err){
  				utils.alert({
                    title:'Thông báo',
                    msg: 'Có lỗi xảy ra'
                });
	  		})
	  	}
	  	$scope.prepareEdit = function(id, name){
	  		$scope.editName = name;
	  		$scope.editId = id;
	  	}
	  	$scope.editSubmit = function(validation){
	  		if(!validation) return;
	  		$http.post("/edit-category",{name:$scope.editName,id:$scope.editId},{}).then(function(res){
	  			$scope.pagging.pages = Math.ceil(res.data.count / $scope.pagging.limit);
	  			if(res.data.message == 'success'){
	  				utils.alert({
	                    title:'Thông báo',
	                    msg: 'Update thành công'
	                });
	                $('#editCategoryModal').modal('hide');
	                $scope.search(function(){});
	  			}else{
	  				utils.alert({
	                    title:'Thông báo',
	                    msg: 'Có lỗi xảy ra'
	                });
	  			}
	  		});
	  	}

	  	$scope.prepareRemove = function(id){
	  		$scope.removeId = id;
	  		$http.post("/list-simple-category",{},{}).then(function(res){
	  			if(res.data.message == 'success'){
	  				$scope.changeCategories = res.data.categories;
	  				for(var i = 0; i < $scope.changeCategories.length; i++){
	  					if($scope.changeCategories[i].id == id){
	  						$scope.changeCategories.splice(i,1);
	  						break;
	  					}
	  				}
	  			}
	  		});
	  		$http.post("/category-count-course",{id:id},{}).then(function(res){
	  			if(res.data.message == 'success'){
	  				$scope.removeCategoryCountCourse = res.data.count
	  			}
	  		});
	  	}
	  	$scope.removeSubmit = function(changeToCategory){
	  		if(!changeToCategory){
	  			utils.alert({
                    title:'Thông báo',
                    msg: 'Bạn cần phải chọn 1 category khác để di chuyển các khóa học sang đó'
                });
	  			return;
	  		}
	  		$http.post("/remove-category",{id:$scope.removeId, changeTo:changeToCategory},{}).then(function(res){
	  			console.log(res)
	  			if(res.data.message == 'success'){
	  				utils.alert({
	                    title:'Thông báo',
	                    msg: 'Remove thành công'
	                });
	                $('#removeCategoryModal').modal('hide');
	                $scope.search(function(){});
	                $scope.changeToCategory = undefined;
	  			}
	  		});
	  		
	  	}
	  	$scope.removeSubmitAny = function(){
	  		$http.post("/remove-category",{id:$scope.removeId},{}).then(function(res){
	  			if(res.data.message == 'success'){
	  				utils.alert({
	                    title:'Thông báo',
	                    msg: 'Remove thành công'
	                });
	                $('#removeCategoryModal').modal('hide');
	                $scope.search(function(){});
	                $scope.changeToCategory = undefined;
	  			}
	  		});
	  	}
	});
	
})();
(function () {
	myApp.controller('levelCtr', function($scope, $http){
		$scope.pagging = {
			limit:5,
			current:0,
			pages:0
		}
		$scope.searchlevelName = '';
		$scope.newLevelName = '';
		$scope.search = function(callback){
			var skip = $scope.pagging.current * $scope.pagging.limit;
			$http.post("/list-simple-level",{name:$scope.searchlevelName,skip:skip,limit:$scope.pagging.limit},{}).then(function(res){
	  			console.log(res.data)
	  			$scope.pagging.pages = Math.ceil(res.data.count / $scope.pagging.limit);
	  			if(res.data.message == 'success'){
	  				$scope.levels = res.data.levels;
	  				callback();
	  			}else{
	  				callback(true);
	  			}
	  		}).catch(function(err){
	  			callback(true);
	  		})
		}
		$scope.search(function(){});
		$scope.$watch(function(scope) { return scope.searchlevelName },
			function(newValue, oldValue) {
				$scope.search();
			}
		);
		$scope.nextPage = function(){
	  		if($scope.pagging.current == $scope.pagging.pages - 1) return;
	  		var recorvery = $scope.pagging.current++;
	  		$scope.search(function(err){
	  			if(err) return $scope.pagging.current = recorvery;
	  		})
	  	}
	  	$scope.prePage = function(){
	  		if($scope.pagging.current == 0) return;
	  		var recorvery = $scope.pagging.current--;
	  		$scope.search(function(err){
	  			if(err) return $scope.pagging.current = recorvery;
	  		})
	  	}
	  	$scope.addLevel = function(validation){
	  		if(!validation) return;
	  		$http.post("/add-level",{name:$scope.newLevelName},{}).then(function(res){
	  			console.log(res.data)
	  			if(res.data.message == 'success'){
	  				utils.alert({
	                    title:'Thông báo',
	                    msg: 'Thêm mới "' + $scope.newLevelName + '" thành công'
	                });
	                $scope.newLevelName = '';
	                $scope.search(function(){}); 
	  			}else{
	  				utils.alert({
	                    title:'Thông báo',
	                    msg: 'Có lỗi xảy ra'
	                });
	  			}
	  		}).catch(function(err){
  				utils.alert({
                    title:'Thông báo',
                    msg: 'Có lỗi xảy ra'
                });
	  		})
	  	}
	  	$scope.prepareEdit = function(id, name){
	  		$scope.editName = name;
	  		$scope.editId = id;
	  	}
	  	$scope.editSubmit = function(validation){
	  		console.log(validation)
	  		if(!validation) return;
	  		$http.post("/edit-level",{name:$scope.editName,id:$scope.editId},{}).then(function(res){
	  			$scope.pagging.pages = Math.ceil(res.data.count / $scope.pagging.limit);
	  			if(res.data.message == 'success'){
	  				utils.alert({
	                    title:'Thông báo',
	                    msg: 'Update thành công'
	                });
	                $('#editLevelModal').modal('hide');
	                $scope.search(function(){});
	  			}else{
	  				utils.alert({
	                    title:'Thông báo',
	                    msg: 'Có lỗi xảy ra'
	                });
	  			}
	  		});
	  	}

	  	$scope.prepareRemove = function(id){
	  		$scope.removeId = id;
	  		$http.post("/list-simple-level",{},{}).then(function(res){
	  			if(res.data.message == 'success'){
	  				$scope.changeLevers = res.data.levels;
	  				for(var i = 0; i < $scope.changeLevers.length; i++){
	  					if($scope.changeLevers[i].id == id){
	  						$scope.changeLevers.splice(i,1);
	  						break;
	  					}
	  				}
	  			}
	  		});
	  		$http.post("/level-count-course",{id:id},{}).then(function(res){
	  			if(res.data.message == 'success'){
	  				$scope.removeLevelCountCourse = res.data.count
	  			}
	  		});
	  	}
	  	$scope.removeSubmit = function(changeToLevel){
	  		if(!changeToLevel){
	  			utils.alert({
                    title:'Thông báo',
                    msg: 'Bạn cần phải chọn 1 level khác để di chuyển các khóa học sang đó'
                });
	  			return;
	  		}
	  		$http.post("/remove-level",{id:$scope.removeId, changeTo:changeToLevel},{}).then(function(res){
	  			if(res.data.message == 'success'){
	  				utils.alert({
	                    title:'Thông báo',
	                    msg: 'Remove thành công'
	                });
	                $('#removeLevelModal').modal('hide');
	                $scope.search(function(){});
	                $scope.changeToLevel = undefined;
	  			}
	  		});
	  		
	  	}
	  	$scope.removeSubmitAny = function(){
	  		$http.post("/remove-level",{id:$scope.removeId},{}).then(function(res){
	  			if(res.data.message == 'success'){
	  				utils.alert({
	                    title:'Thông báo',
	                    msg: 'Remove thành công'
	                });
	                $('#removeLevelModal').modal('hide');
	                $scope.search(function(){});
	                $scope.changeToLevel = undefined;
	  			}
	  		});
	  	}

	});
	
})();
(function () {
	myApp.controller('loginAdminCtr', function($scope, $http){
		$scope.user = {
			email:'',
			password:''
		}
		$scope.submit = function(validate){
			$http.post("/admin/login/local",$scope.user,{}).then(function(res){
				console.log(res.data)
	  			if(res.data.message == 'success'){
	  				location.reload();
	  			}else if(res.data.message == 'email_not_found'){
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Email không tồn tại'
                    });
	  			}else if(res.data.message == 'password_not_correct'){
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Sai mật khẩu'
                    });
	  			}else if(res.data.message == "account_not_active"){
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Tài khoản chưa được kích hoạt'
                    });
	  			}else{
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Có lỗi gì đó xảy ra.'
                    });
	  			}
	  		});
		}
	});
	
})();







(function () {
	myApp.controller('cartCtr', function($scope, $http, $rootScope){
		///////// CART ROOTSCOPE//////////////////////////////
		//
		$rootScope.addToCart = function(id){
			var courseId = parseInt(id);
			$http.post("/add-to-cart",{id:courseId},{}).then(function(res){
				if(res.data.message == 'not_login'){
					$('#loginModal').modal('show');
				}else if(res.data.message == 'success'){
					$rootScope.showAddToCartBtn = false;
					$rootScope.cartOpen = true;//*
					$rootScope.listCart = res.data.listCourses;
					$rootScope.listCartMoney = $rootScope.listCart.sum("price");
					// $rootScope.listCartMoneyOld = $rootScope.listCart.sum("oldPrice");
				}else if(res.data.message == 'not_student'){
					utils.alert({
                        title:'Thông báo',
                        msg: 'Hãy đăng nhập với tài khoản học sinh(thành viên)'
                    });
				}else if(res.data.message == 'course_buyed'){
					utils.alert({
                        title:'Thông báo',
                        msg: 'Bạn đã mua khóa học này rồi'
                    });
				}
	  		});
		}
		$rootScope.initCart = function(){
			$rootScope.listCart = [];
			$rootScope.listCartMoney = 0;
			$http.post("/list-cart",{},{}).then(function(res){
				if(res.data.message == 'not_login'){

				}else if(res.data.message == 'success'){
					$rootScope.listCart = res.data.listCourses;
					if($rootScope.listCart.length != 0) $rootScope.listCartMoney = $rootScope.listCart.sum("price");
					if($rootScope.listCart.length == 0) $rootScope.listCartMoney = 0;
				    	$rootScope.listCartMoneySave = $rootScope.listCart.sumSave("oldPrice","price");
				}
	  		});
		}
		$rootScope.initCart();
		$rootScope.destroyItemCart = function(id){
			$http.post("/destroy-item-cart",{id:id},{}).then(function(res){
				if(res.data.message == 'success'){
					$rootScope.initCart();
				}
	  		});
		}
		$rootScope.phoneValidation = [{
			func:function(val,cb){
				function checkPhoneNumber(phone) {
				    var flag = false;
				    if(!phone) return flag;
				    phone = phone.replace('(+84)', '0');
				    phone = phone.replace('+84', '0');
				    phone = phone.replace('0084', '0');
				    phone = phone.replace(/ /g, '');
				    if (phone != '') {
				        var firstNumber = phone.substring(0, 2);
				        if ((firstNumber == '09' || firstNumber == '08') && phone.length == 10) {
				            if (phone.match(/^\d{10}/)) {
				                flag = true;
				            }
				        } else if (firstNumber == '01' && phone.length == 11) {
				            if (phone.match(/^\d{11}/)) {
				                flag = true;
				            }
				        }
				    }
				    return flag;
				}
				cb(this.name, checkPhoneNumber(val)); 	
			},
			name:'is_phone_number',
			message:'Không phải số điện thoại'
		}];
		$rootScope.payment = function(isValid){
			if(!isValid) return;
			$http.post("/payment",{note:$rootScope.note},{}).then(function(res){
				if(res.data.message == 'success'){
					utils.alert({
                        title:'Thông báo',
                        msg: 'Đã order khóa học',
                        callback:function(){
                        	window.location.replace("/payment-history");
                        }
                    });
				}else{
					utils.alert({
                        title:'Thông báo',
                        msg: 'Có lỗi xảy ra'
                    });
				}
	  		});
		}
		Array.prototype.sum = function (prop) {
			var total = 0
			for ( var i = 0, _len = this.length; i < _len; i++ ) {
			    total += this[i][prop]
			}
			return total
		}
		Array.prototype.sumSave = function (_old, _new) {
			var total = 0
			for ( var i = 0, _len = this.length; i < _len; i++ ) {
				if(this[i][_old] > this[i][_new])
			    	total += this[i][_old]
			}
			return total
		}
		///////// CART ROOTSCOPE END//////////////////////////////
	});
	
})();

/**
 * Created by TuanAnh on 11/23/2017.
 */
(function () {
    myApp.controller('changePasswordStudentCtr', function($scope, $http){
            $scope.changePass = {
                password:'',
                password_confirm:''
            }

            $scope.disable = false;
            $scope.submit = function(validate){

                if(!validate || $scope.disable) return;
                $scope.disable = true;
                $http.post("/changePassword",$scope.changePass,{}).then(function(res){
                    $scope.disable = false;

                    if(res.data.message == 'success'){
                        utils.alert({
                            title:'Thông báo',
                            msg: 'Đổi mật khẩu thành công !'
                        });
                    }
                });
            }

///

            $scope.confirmNewPasswordValidation = [{
                func:function(val,cb){
                    if(val == $scope.changePass.password){
                        cb(this.name,true);
                    }else{
                        cb(this.name, false);
                    }
                },
                name:'confirm_password',
                message:'Mật khẩu không khớp'
            }];


//


        }



    );

})();
(function () {
	myApp.controller('courseDetailCtr', function($scope, $http, $sce){
		$scope.courseId = location.pathname.split('/')[location.pathname.split('/').length-1];
		$scope.get = function(){
			$http.post("/get-course-paid",{id:$scope.courseId},{}).then(function(res){
				console.log(res.data)
	  			if(res.data.message == 'success'){
	  				$scope.course = res.data.course;
	  				var iChapter = res.data.orderCourse.lastTrace.split('-')[0];
	  				var iLesson = res.data.orderCourse.lastTrace.split('-')[1];
	  				var x = $scope.course.listCourseCategory.getDeep('order',iChapter).listLesson.getDeep('order',iLesson);
	  				$scope.setCurentLesson(x, iChapter, iLesson);
	  			}else{
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Có lỗi gì đó xảy ra.'
                    });
	  			}
	  		});
		}
		$scope.get();
		$scope.getVideoStream = function(iChapter, iLesson){
			if($scope.currentLesson.typeVideo == 'youtube'){
				var streamId = utils.getLinkYoutube($scope.currentLesson.linkVideo);
				if(!streamId){
					$scope.currentLesson.streamLink = false;
					return;
				}
				$scope.currentLesson.streamLink = $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + streamId + '?rel=0&amp;showinfo=0');
			}else if($scope.currentLesson.typeVideo == 'drive'){
				var streamId = utils.getLinkDrive($scope.currentLesson.linkVideo);
				if(!streamId){
					$scope.currentLesson.streamLink = false;
					return;
				}
				$scope.currentLesson.streamLink = $sce.trustAsResourceUrl('https://drive.google.com/file/d/' + streamId + '/preview');
			}else{
				// $scope.currentLesson.streamLink = false;
				// $timeout(function () {
				// 	$scope.currentLesson.streamLink = $sce.trustAsResourceUrl($scope.currentLesson.linkVideo);
				// }, 100);
			}
		}
		$scope.setCurentLesson = function(lesson,iChapter,iLesson){
			$scope.currentLesson = lesson;
			$scope.currentLesson.iQuestion = 0;
			$scope.currentLesson.total = 0;
			$scope.iChapter = iChapter;
			$scope.iLesson = iLesson;
			$scope.getVideoStream();
			$http.post("/update-last-trace",{id:$scope.courseId, lastTrace:iChapter + '-' + iLesson},{}).then(function(res){
	  		});
		}
		$scope.formatCurrentLesson = function(){
			$scope.get();
		}
		$scope.nextLesson = function(){
			var deep1 = $scope.course.listCourseCategory.getDeep('order',$scope.iChapter).listLesson.getDeep('order',$scope.iLesson + 1);
			if(deep1){
				$scope.setCurentLesson(deep1,$scope.iChapter, ++$scope.iLesson);
				return;
			}
			if($scope.course.listCourseCategory.length == $scope.iChapter + 1){
				return;
			}
			var deep2 = $scope.course.listCourseCategory.getDeep('order',$scope.iChapter + 1).listLesson.getDeep('order',0);
			if(deep2){
				$scope.setCurentLesson(deep2,++$scope.iChapter, 0);
				return;
			}
			
		}

		$scope.preLesson = function(){
			var deep1 = $scope.course.listCourseCategory.getDeep('order',$scope.iChapter).listLesson.getDeep('order',$scope.iLesson - 1);
			if(deep1){
				$scope.setCurentLesson(deep1,$scope.iChapter, --$scope.iLesson);
				return;
			}
			if(0 == $scope.iChapter){
				return;
			}
			var l = $scope.course.listCourseCategory.getDeep('order',$scope.iChapter - 1).listLesson.length - 1;
			var deep2 = $scope.course.listCourseCategory.getDeep('order',$scope.iChapter - 1).listLesson.getDeep('order',l);
			if(deep2){
				$scope.setCurentLesson(deep2,--$scope.iChapter, l);
				return;
			}
		}

		$scope.checkAnswer = function(){
			for(var i = 0; i < $scope.currentLesson.listQuestion[$scope.currentLesson.iQuestion].listAnswer.length; i++){
				var x = $scope.currentLesson.listQuestion[$scope.currentLesson.iQuestion].listAnswer[i];
				if(x.myAns == undefined) x.myAns = false;
				if(x.isTrue != x.myAns){
					$scope.currentLesson.listQuestion[$scope.currentLesson.iQuestion].isCorrect = 'no';
					return;
				}
			}
			$scope.currentLesson.listQuestion[$scope.currentLesson.iQuestion].isCorrect = 'yes';
			$scope.currentLesson.total++;
		}

		Array.prototype.getDeep = function (prop, val) {
			for ( var i = 0, _len = this.length; i < _len; i++ ) {
			    if(this[i][prop] == val){
			    	return this[i]
			    }
			}
			
		}
	});
	
})();









(function () {
	myApp.controller('homepageCtr', function($scope, $http){
		$scope.user = {
			email:'',
			password:''
		}
		$scope.disable = false;
		$scope.submit = function(validate){
			if(!validate || $scope.disable) return;
			$scope.disable = true;
			$http.post("/login/local",$scope.user,{}).then(function(res){
				$scope.disable = false;
				console.log(res.data)
	  			if(res.data.message == 'success'){
	  				location.reload();
	  			}else if(res.data.message == 'email_not_found'){
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Email không tồn tại'
                    });
	  			}else if(res.data.message == 'password_not_correct'){
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Sai mật khẩu'
                    });
	  			}else if(res.data.message == "account_not_active"){
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Tài khoản chưa được kích hoạt'
                    });
	  			}else{
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Có lỗi gì đó xảy ra.'
                    });
	  			}
	  		});
		}
	});
	
})();
(function () {
	myApp.controller('loginStudentCtr', function($scope, $http){
		$scope.user = {
			email:'',
			password:''
		}
		$scope.disable = false;
		$scope.submit = function(validate){
			if(!validate || $scope.disable) return;
			$scope.disable = true;
			$http.post("/student/login/local",$scope.user,{}).then(function(res){
				$scope.disable = false;
				console.log(res.data)
	  			if(res.data.message == 'success'){
	  				location.reload();
	  			}else if(res.data.message == 'email_not_found'){
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Email không tồn tại'
                    });
	  			}else if(res.data.message == 'password_not_correct'){
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Sai mật khẩu'
                    });
	  			}else if(res.data.message == "account_not_active"){
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Tài khoản chưa được kích hoạt'
                    });
	  			}else{
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Có lỗi gì đó xảy ra.'
                    });
	  			}
	  		});
		}
	});
	
})();
(function () {
	myApp.controller('myProfileCtr', function($scope, $http){
		$scope.user = {}

		//GET PROFILE
		$scope.getProfile = function(){
			$http.post("/user/myprofile",{},{}).then(function(res){
				$scope.user = res.data.user;
				console.log(res)

	  		});
		}
		$scope.getProfile();
		//UPLOAD IMAGE & EDIT PROFILE
		function readURL(input) {
		    if (input.files && input.files[0]) {
		        var reader = new FileReader();
		        reader.onload = function (e) {
		            $('#img-in-modal').attr('src', e.target.result);
		        }
		        reader.readAsDataURL(input.files[0]);
		    }
		}
		$scope.openInputFile = function(){
			$("#upload-img").click();
			$("#upload-img").change(function(){
				var file = $("#upload-img")[0].files[0];
				var fileType = file["type"];
				var ValidImageTypes = ["image/gif", "image/jpeg", "image/png"];
				if ($.inArray(fileType, ValidImageTypes) < 0) {
					//NOT A IMAGE
						$('#upload-img').val("");
						utils.alert({
		                title:'Thông Báo',
		                msg: 'Bạn phải lựa chọn hình ảnh'
		            });
		            return;
				}
				readURL(this);
		 		$('#review_upload_img').modal('show');
			});
			$('#review_upload_img').on('shown.bs.modal', function () {
				$('#img-in-modal').cropper({
					viewMode:2,
					autoCropArea: 1,
					aspectRatio: 1 / 1
				});
			}).on('hidden.bs.modal', function () {
				$('#img-in-modal').cropper('destroy');
				$('#upload-img').val("");
			});
			$('#cut-picture-btn').click(function(){
				var dataImg = $('#img-in-modal').cropper('getData');
				var c=document.getElementById("crop-canvas");
			    var ctx=c.getContext("2d");
			    var img=document.getElementById("img-in-modal");
			    ctx.drawImage(img,dataImg.x,dataImg.y,dataImg.width,dataImg.height,0,0,320,320);
			    $scope.user.avatar = c.toDataURL('image/png', 1.0);
			    $scope.user.isUpload = true;
			    $scope.$apply();
				$('#avatar-image-root').attr('src',$scope.course.pictureData);
			});
		}
		$scope.submitEdit = function(validate){
			if(!validate) return;
			$http.post("/user/edit",$scope.user,{}).then(function(res){
				$scope.disable = false;
	  			if(res.data.message == 'success'){
	  				location.reload(true);
	  			}else if(res.data.message == 'error'){
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Có lỗi gì đó xảy ra'
                    });
	  			}
	  		});
		}
		$scope.submitAprove = function(){
			$http.post("/teacher/submit-approve-teacher",{},{}).then(function(res){
	  			if(res.data.message == 'success'){
	  				location.reload(true);
	  			}else if(res.data.message == 'error'){
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Có lỗi gì đó xảy ra'
                    });
	  			}
	  		});
		}
		$scope.phoneValidation = [{
			func:function(val,cb){
				function checkPhoneNumber(phone) {
				    var flag = false;
				    if(!phone) return flag;
				    phone = phone.replace('(+84)', '0');
				    phone = phone.replace('+84', '0');
				    phone = phone.replace('0084', '0');
				    phone = phone.replace(/ /g, '');
				    if (phone != '') {
				        var firstNumber = phone.substring(0, 2);
				        if ((firstNumber == '09' || firstNumber == '08') && phone.length == 10) {
				            if (phone.match(/^\d{10}/)) {
				                flag = true;
				            }
				        } else if (firstNumber == '01' && phone.length == 11) {
				            if (phone.match(/^\d{11}/)) {
				                flag = true;
				            }
				        }
				    }
				    return flag;
				}
				cb(this.name, checkPhoneNumber(val)); 	
			},
			name:'is_phone_number',
			message:'Không phải số điện thoại'
		}];
	});
	
})();
(function () {
	myApp.controller('registerStudentCtr', function($scope, $http){
		$scope.user = {
			fullname:'',
			email:'',
			password:''
		}
		$scope.disable = false;
		$scope.submit = function(validate){
			if(!validate || $scope.disable) return;
			$scope.disable = true;
			$http.post("/student/register",$scope.user,{}).then(function(res){
				$scope.disable = false;
	  			if(res.data.message == 'success'){
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Chúng tôi đã gửi 1 link kích hoạt đến email : ' + $scope.user.email
                    });
	  			}else if(res.data.message == 'email_exist'){
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Email đã được đăng ký'
                    });
	  			}else{
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Có lỗi gì đó xảy ra.'
                    });
	  			}
	  		});
		}

///

$scope.confirmPasswordValidation = [{
			func:function(val,cb){
				if(val == $scope.user.password){
					cb(this.name,true);
				}else{
					cb(this.name, false);
				}  	
			},
			name:'confirm_password',
			message:'Mật khẩu không khớp'
		}];


//


	}



	);
	
})();
(function () {
	myApp.controller('searchCourseCtr', function($scope, $http){
		$scope.searchStr = '';

		$scope.search = function(){
// link parameter on link
			var query = location.search;
			if(query==''){
				query = '?';
			}
			if(query.indexOf('page') !== -1){
				var arr = query.split('&');
				console.log(arr)
				for(var i = 0; i < arr.length; i++){
					if(arr[i].indexOf('page') !== -1){
						arr.splice(i, 1);
					}
				}
				query = arr.join('&');
			}
			if(query.indexOf('coursename') !== -1){
				var arr = query.split('&');
				console.log(arr)
				for(var i = 0; i < arr.length; i++){
					if(arr[i].indexOf('coursename') !== -1){
						arr.splice(i, 1);
					}
				}
				query = arr.join('&');
			}
			if(query=='' || query=='&'){
				query = '?';
			}
			if($scope.searchStr != ''){
				query +='&coursename=' + encodeURIComponent($scope.searchStr);
			}
			location.href = '/' + query
		}
	});
	
})();
(function () {
	myApp.controller('addLessionCtr', function($scope, $http, $sce, $timeout){
		$scope.editorModel = '!!!';
		// định dạng course
		$scope.course = {
			name:'',
			category:undefined,
			level:undefined,
			price:undefined,
			oldPrice:undefined,
			pictureData: undefined,
			generalDescription:'',
			requirement:'',
			benefit:'',
			objectAndGoals:'',
			listCourseCategory:[],
		}
		//UPLOAD IMAGE
		function readURL(input) {
		    if (input.files && input.files[0]) {
		        var reader = new FileReader();
		        reader.onload = function (e) {
		            $('#img-in-modal').attr('src', e.target.result);
		        }
		        reader.readAsDataURL(input.files[0]);
		    }
		}
		// tải ảnh lên
		$scope.openInputFile = function(){
			$("#upload-img").click();
			$("#upload-img").change(function(){
				var file = $("#upload-img")[0].files[0];
				var fileType = file["type"];
				var ValidImageTypes = ["image/gif", "image/jpeg", "image/png"];
				if ($.inArray(fileType, ValidImageTypes) < 0) {
					//NOT A IMAGE
						$('#upload-img').val("");
							utils.alert({
			                title:'Thong bao',
			                msg: 'Ban phai chon 1 file la hinh anh'
		            	});
		            return;
				}
				readURL(this);
		 		$('#review_upload_img').modal('show');
			});
			$('#review_upload_img').on('shown.bs.modal', function () {
				$('#img-in-modal').cropper({
					viewMode:2,
					autoCropArea: 1,
					aspectRatio: 8 / 5
				});
			}).on('hidden.bs.modal', function () {
				$('#img-in-modal').cropper('destroy');
				$('#upload-img').val("");
			});
			$('#cut-picture-btn').click(function(){
				var dataImg = $('#img-in-modal').cropper('getData');
				var c=document.getElementById("crop-canvas");
			    var ctx=c.getContext("2d");
			    var img=document.getElementById("img-in-modal");
			    ctx.drawImage(img,dataImg.x,dataImg.y,dataImg.width,dataImg.height,0,0,800,500);
			    $scope.course.pictureData = c.toDataURL('image/png', 1.0);
			    $scope.$apply();
				$('#picture-preview').attr('src',$scope.course.pictureData);
			});
		}
		// tạo levels và cate admin tạo sẵn ,
		$scope.default = {
			levels:[],
			categories:[]
		}
		// nhận data từ server đẩy lên cho category và level
		$scope.loadLevelAndCategory = function(){
			$http.post("/list-simple-level",{name:'',skip:0,limit:999999999},{}).then(function(res){
	  			if(res.data.message == 'success'){
	  				$scope.default.levels = res.data.levels;
	  			}
	  		});
	  		$http.post("/list-simple-category",{name:'',skip:0,limit:999999999},{}).then(function(res){
	  			if(res.data.message == 'success'){
	  				$scope.default.categories = res.data.categories;
	  			}
	  		});
		}
		$scope.loadLevelAndCategory();

		//////////////////////////////////
		// tạo model cho chapter mới
		$scope.newChapter = function(){
			$scope.course.listCourseCategory.push({
				UIshow:true,
				listLesson:[],
				name:'',
				order:$scope.course.listCourseCategory.length
			});
		}
		// tạo model cho lesson, truyền vào chỉ số của chapter để xác định .
		$scope.newLesson = function(iChapter){
			$scope.course.listCourseCategory[iChapter].listLesson.push({
				UIshow:true,
				name:'',
				listQuestion:[],
				linkVideo:'',
				typeVideo:'youtube',
				content:'',
				streamLink:'<h1>sa</h1>',
				order:$scope.course.listCourseCategory[iChapter].listLesson.length
			});
		}
		// tạo model cho newQuestion, truyền vào chỉ số của chapter Lesson để xác định .
		$scope.newQuestion = function(iChapter, iLesson){
			$scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion.push({
				listAnswer:[],
				content:''
			});
		}
		// tạo model cho newAnswer, truyền vào chỉ số của chapter iChapter iLesson iQuestion  để xác định ,
		$scope.newAnswer = function(iChapter, iLesson, iQuestion){
			$scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer.push({
				content:'',
				isTrue:false
			});
		}
		///////////////
		// xóa chapter
		$scope.deleteChapter = function(iChapter){
			for(var i = iChapter; i < $scope.course.listCourseCategory.length; i++){
				$scope.course.listCourseCategory[i].order--;
			}
			$scope.course.listCourseCategory.splice (iChapter, 1);
		}
		// đảo chapter
		$scope.swapChapter = function(src,des){
			console.log(des)
			if(des < 0 || des >= $scope.course.listCourseCategory.length){
				console.log('die')
				return;
			}
			var srcO = $scope.course.listCourseCategory[src].order;
			var desO = $scope.course.listCourseCategory[des].order;
			$scope.course.listCourseCategory[src].order = desO;
			$scope.course.listCourseCategory[des].order = srcO;
			

			var mid = $scope.course.listCourseCategory[src];
			$scope.course.listCourseCategory[src] =  $scope.course.listCourseCategory[des];
			$scope.course.listCourseCategory[des] = mid;
		}
		///////////////
		$scope.deleteLesson = function(iChapter, iLesson){
			for(var i = iLesson; i < $scope.course.listCourseCategory[iChapter].listLesson.length; i++){
				$scope.course.listCourseCategory[iChapter].listLesson[i].order--;
			}
			$scope.course.listCourseCategory[iChapter].listLesson.splice (iLesson, 1);
		}
		$scope.swapLesson = function(iChapter,src,des){
			if(des < 0 || des >= $scope.course.listCourseCategory[iChapter].listLesson.length){
				console.log('die')
				return;
			}
			var srcO = $scope.course.listCourseCategory[iChapter].listLesson[src].order;
			var desO = $scope.course.listCourseCategory[iChapter].listLesson[des].order;
			$scope.course.listCourseCategory[iChapter].listLesson[src].order = desO;
			$scope.course.listCourseCategory[iChapter].listLesson[des].order = srcO;
			

			var mid = $scope.course.listCourseCategory[iChapter].listLesson[src];
			$scope.course.listCourseCategory[iChapter].listLesson[src] =  $scope.course.listCourseCategory[iChapter].listLesson[des];
			$scope.course.listCourseCategory[iChapter].listLesson[des] = mid;
		}
		///////////
		$scope.deleteQuestion = function(iChapter, iLesson, iQuestion){
			$scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion.splice (iQuestion, 1);
		}
		///////////
		$scope.deleteAnswer = function(iChapter, iLesson, iQuestion, iAnswer){
			$scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer.splice (iAnswer, 1);
		}
		//////////////////////
		$scope.getVideoStream = function(iChapter, iLesson){
			if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].typeVideo == 'youtube'){
				var streamId = utils.getLinkYoutube($scope.course.listCourseCategory[iChapter].listLesson[iLesson].linkVideo);
				if(!streamId){
					$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = false;
					return;
				}
				$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + streamId + '?rel=0&amp;showinfo=0');
			}else if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].typeVideo == 'drive'){
				var streamId = utils.getLinkDrive($scope.course.listCourseCategory[iChapter].listLesson[iLesson].linkVideo);
				if(!streamId){
					$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = false;
					return;
				}
				$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = $sce.trustAsResourceUrl('https://drive.google.com/file/d/' + streamId + '/preview');
			}else{
				$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = false;
				$timeout(function () {
					$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = $sce.trustAsResourceUrl($scope.course.listCourseCategory[iChapter].listLesson[iLesson].linkVideo);
				}, 100);
			}
		}
		////////// validation new course
		$scope.validation = function(validation,action){
			if(!validation) return;
			if(!$scope.course.pictureData){
				utils.alert({
					title:'Thông báo',
					msg: 'Bạn phải chọn ảnh bìa khóa học'
				});
				return;
			}
			if($scope.course.listCourseCategory.length == 0){
				utils.alert({
					title:'Thông báo',
					msg: 'Bạn chưa tạo chapter nào'
				});
				return;
			}
			for (var iChapter = 0; iChapter < $scope.course.listCourseCategory.length; iChapter++) {
				if($scope.course.listCourseCategory[iChapter].name == ''){
					utils.alert({
						title:'Thông báo',
						msg: 'Bạn chưa đặt tên cho chapter ' + (iChapter + 1)
					});
					return;
				}
				if($scope.course.listCourseCategory[iChapter].listLesson.length == 0){
					utils.alert({
						title:'Thông báo',
						msg: 'Chapter ' + (iChapter + 1) + ' chưa có bài học nào'
					});
					return;
				}
				for (var iLesson = 0; iLesson < $scope.course.listCourseCategory[iChapter].listLesson.length; iLesson++) {
					if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].name == ''){
						utils.alert({
							title:'Thông báo',
							msg: 'Bạn chưa đặt tên cho bài học ' + (iChapter + 1) + '.' + (iLesson + 1)
						});
						return;
					}

					for (var iQuestion = 0; iQuestion < $scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion.length; iQuestion++) {
						if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].content == ''){
							utils.alert({
								title:'Thông báo',
								msg: 'Bạn chưa đặt viết nội dung câu hỏi thứ ' + (iQuestion + 1) + ' của bài học ' + (iChapter + 1) + '.' + (iLesson + 1)
							});
							return;
						}
						if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer.length == 0){
							utils.alert({
								title:'Thông báo',
								msg: 'Câu hỏi thứ ' + (iQuestion + 1) + ' bài học ' + + (iChapter + 1) + '.' + (iLesson + 1) + 	' không có đáp án'
							});
							return;
						}
						var isTrueFlag = false;
						for (var iAnswer = 0; iAnswer < $scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer.length; iAnswer++) {
							if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer[iAnswer].content == ''){
								utils.alert({
									title:'Thông báo',
									msg: 'Bạn chưa đặt viết nội dung câu trả lời thứ ' + (iAnswer + 1) + ' câu hỏi thứ ' + (iQuestion + 1) + ' bài học ' + + (iChapter + 1) + '.' + (iLesson + 1)
								});
								return;
							}
							if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer[iAnswer].isTrue){
								isTrueFlag = true;
							}
						}
						if(!isTrueFlag){
							utils.alert({
								title:'Thông báo',
								msg: 'Câu hỏi thứ ' + (iQuestion + 1) + ' bài học ' + + (iChapter + 1) + '.' + (iLesson + 1) + 	' không có đáp án đúng'
							});
							return;
						}
					}
				}
			}
		if(action == 'approve')	$scope.submit();
        if(action == 'save') $scope.submitSave();
		}
		$scope.submitSave = function() {
			console.log("submitSave")
			$http.post("/teacher/save-course",$scope.course,{}).then(function (res) {

				if(res.data.message =='saved'){
					utils.alert({
						title:'Thông Báo',
						msg:'Đã tạo và lưu khóa học',
						callback:function() {
							window.location='/repository/save'
						}
					})
				}
				else{
					utils.alert({
						title:'Thông báo',
						msg: 'Có lỗi xảy ra,tạo không thành công'
					});
				}

			}
			)
		}

		$scope.submit = function(){

            // var btnSave =document.getElementById('btnSave').value;
            // var btnApprove =document.getElementById('btnApprove').value;
				console.log("submit")


			$http.post("/teacher/new-course",$scope.course,{}).then(function(res){
			//	document.getElementById('check').value = $('btnWaitApprove').text();
	  			if(res.data.message == 'success'){
	  				utils.alert({
	                    title:'Thông báo',
	                    msg: 'Đã tạo và yêu cầu duyệt khóa học này',
	                    callback:function(){
	                    	window.location = '/repository/waiting';
	                    }
	                });
	  			}else{
	  				utils.alert({
	                    title:'Thông báo',
	                    msg: 'Có lỗi xảy ra,tạo không thành công'
	                });
	  			}
	  		});
		}




	});
	
})();
/**
 * Created by TuanAnh on 11/23/2017.
 */
(function () {
    myApp.controller('changePasswordTeacherCtr', function($scope, $http){
            $scope.changePass = {
                password:'',
                password_confirm:''
            }

            $scope.disable = false;
            $scope.submit = function(validate){

                if(!validate || $scope.disable) return;
                $scope.disable = true;
                $http.post("/changePasswordTeacher",$scope.changePass,{}).then(function(res){
                    $scope.disable = false;

                    if(res.data.message == 'success'){
                        utils.alert({
                            title:'Thông báo',
                            msg: 'Đổi mật khẩu thành công !'
                        });
                    }
                });
            }

///

            $scope.confirmNewPasswordValidation = [{
                func:function(val,cb){
                    if(val == $scope.changePass.password){
                        cb(this.name,true);
                    }else{
                        cb(this.name, false);
                    }
                },
                name:'confirm_password',
                message:'Mật khẩu không khớp'
            }];


//


        }



    );

})();
(function () {
	myApp.controller('editCourseCtr', function($scope, $http, $sce, $timeout){
		// $scope.course = {
		// 	name:'',
		// 	category:undefined,
		// 	level:undefined,
		// 	price:undefined,
		// 	oldPrice:undefined,
		// 	pictureData: undefined,
		// 	generalDescription:'',
		// 	requirement:'',
		// 	benefit:'',
		// 	objectAndGoals:'',
		// 	listCourseCategory:[],
		// }
		///////////////LOAD DATA////
		$scope.load = function(){
			var id = parseInt(location.pathname.split('/')[3]);
			$http.post("/course/get-details",{id:id},{}).then(function(res){
				console.log(res)
	  			if(res.data.message == 'success'){
	  				$scope.course = res.data.course;
	  				for(var iChapter = 0; iChapter < $scope.course.listCourseCategory.length; iChapter++){
	  					$scope.course.listCourseCategory[iChapter].UIshow = true;
	  				}
	  				$scope.course.pictureUpload = false;
	  				$scope.course.listCourseCategoryDelete = [];
	  				$scope.course.listLessonDelete  = [];
	  				$scope.course.listQuestionDelete  = [];
	  				$scope.course.listAnswerDelete  = [];
	  				$scope.course.listCourseCategory.sort(function(a, b){
						var keyA = new Date(a.order),
						keyB = new Date(b.order);
						// Compare the 2 dates
						if(keyA < keyB) return -1;
						if(keyA > keyB) return 1;
						return 0;
					});
					for(var iChapter = 0; iChapter < $scope.course.listCourseCategory.length; iChapter++){
						$scope.course.listCourseCategory[iChapter].listLesson.sort(function(a, b){
							var keyA = new Date(a.order),
							keyB = new Date(b.order);
							// Compare the 2 dates
							if(keyA < keyB) return -1;
							if(keyA > keyB) return 1;
							return 0;
						});
					}

					for(var iChapter = 0; iChapter < $scope.course.listCourseCategory.length; iChapter++){
	  					for(var iLesson = 0; iLesson < $scope.course.listCourseCategory[iChapter].listLesson.length; iLesson++){
	  						console.log('sa')
	  						console.log(iChapter,iLesson)
	  						$scope.getVideoStream(iChapter,iLesson);
	  					}
	  				}
	  			}
	  		});
		}
		$scope.load();



		//UPLOAD IMAGE
		function readURL(input) {
		    if (input.files && input.files[0]) {
		        var reader = new FileReader();
		        reader.onload = function (e) {
		            $('#img-in-modal').attr('src', e.target.result);
		        }
		        reader.readAsDataURL(input.files[0]);
		    }
		}
		$scope.openInputFile = function(){
			$("#upload-img").click();
			$("#upload-img").change(function(){
				var file = $("#upload-img")[0].files[0];
				var fileType = file["type"];
				var ValidImageTypes = ["image/gif", "image/jpeg", "image/png"];
				if ($.inArray(fileType, ValidImageTypes) < 0) {
					//NOT A IMAGE
						$('#upload-img').val("");
							utils.alert({
			                title:'Thong bao',
			                msg: 'Ban phai chon 1 file la hinh anh'
		            	});
		            return;
				}
				readURL(this);
		 		$('#review_upload_img').modal('show');
			});
			$('#review_upload_img').on('shown.bs.modal', function () {
				$('#img-in-modal').cropper({
					viewMode:2,
					autoCropArea: 1,
					aspectRatio: 8 / 5
				});
			}).on('hidden.bs.modal', function () {
				$('#img-in-modal').cropper('destroy');
				$('#upload-img').val("");
			});
			$('#cut-picture-btn').click(function(){
				var dataImg = $('#img-in-modal').cropper('getData');
				var c=document.getElementById("crop-canvas");
			    var ctx=c.getContext("2d");
			    var img=document.getElementById("img-in-modal");
			    ctx.drawImage(img,dataImg.x,dataImg.y,dataImg.width,dataImg.height,0,0,800,500);
			    $scope.course.pictureData = c.toDataURL('image/png', 1.0);
			    $scope.course.pictureUpload = true;
			    $scope.$apply();
				$('#picture-preview').attr('src',$scope.course.pictureData);
			});
		}
		$scope.default = {
			levels:[],
			categories:[]
		}
		$scope.loadLevelAndCategory = function(){
			$http.post("/list-simple-level",{name:'',skip:0,limit:999999999},{}).then(function(res){
	  			if(res.data.message == 'success'){
	  				$scope.default.levels = res.data.levels;
	  			}
	  		});
	  		$http.post("/list-simple-category",{name:'',skip:0,limit:999999999},{}).then(function(res){
	  			if(res.data.message == 'success'){
	  				$scope.default.categories = res.data.categories;
	  			}
	  		});
		}
		$scope.loadLevelAndCategory();

		//////////////////////////////////

		$scope.newChapter = function(){
			$scope.course.listCourseCategory.push({
				UIshow:true,
				listLesson:[],
				name:'',
				order:$scope.course.listCourseCategory.length,
				isNew: true
			});
		}
		$scope.newLesson = function(iChapter){
			$scope.course.listCourseCategory[iChapter].listLesson.push({
				UIshow:true,
				name:'',
				listQuestion:[],
				linkVideo:'',
				typeVideo:'youtube',
				content:'',
				streamLink:'',
				order:$scope.course.listCourseCategory[iChapter].listLesson.length,
				isNew: true
			});
		}
		$scope.newQuestion = function(iChapter, iLesson){
			$scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion.push({
				listAnswer:[],
				content:'',
				isNew:true
			});
		}
		$scope.newAnswer = function(iChapter, iLesson, iQuestion){
			$scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer.push({
				content:'',
				isTrue:false,
				isNew:true
			});
		}
		///////////////
		$scope.deleteChapter = function(iChapter){
			for(var i = iChapter; i < $scope.course.listCourseCategory.length; i++){
				$scope.course.listCourseCategory[i].order--;
			}
			if($scope.course.listCourseCategory[iChapter].id){
				$scope.course.listCourseCategoryDelete.push($scope.course.listCourseCategory[iChapter].id);
			}
			$scope.course.listCourseCategory.splice (iChapter, 1);
		}
		$scope.swapChapter = function(src,des){
			console.log(des)
			if(des < 0 || des >= $scope.course.listCourseCategory.length){
				console.log('die')
				return;
			}
			var srcO = $scope.course.listCourseCategory[src].order;
			var desO = $scope.course.listCourseCategory[des].order;
			$scope.course.listCourseCategory[src].order = desO;
			$scope.course.listCourseCategory[des].order = srcO;
			

			var mid = $scope.course.listCourseCategory[src];
			$scope.course.listCourseCategory[src] =  $scope.course.listCourseCategory[des];
			$scope.course.listCourseCategory[des] = mid;
		}
		///////////////
		$scope.deleteLesson = function(iChapter, iLesson){
			for(var i = iLesson; i < $scope.course.listCourseCategory[iChapter].listLesson.length; i++){
				$scope.course.listCourseCategory[iChapter].listLesson[i].order--;
			}
			if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].id){
				$scope.course.listLessonDelete.push($scope.course.listCourseCategory[iChapter].listLesson[iLesson].id);
			}
			$scope.course.listCourseCategory[iChapter].listLesson.splice (iLesson, 1);
		}
		$scope.swapLesson = function(iChapter,src,des){
			if(des < 0 || des >= $scope.course.listCourseCategory[iChapter].listLesson.length){
				console.log('die')
				return;
			}
			var srcO = $scope.course.listCourseCategory[iChapter].listLesson[src].order;
			var desO = $scope.course.listCourseCategory[iChapter].listLesson[des].order;
			$scope.course.listCourseCategory[iChapter].listLesson[src].order = desO;
			$scope.course.listCourseCategory[iChapter].listLesson[des].order = srcO;
			

			var mid = $scope.course.listCourseCategory[iChapter].listLesson[src];
			$scope.course.listCourseCategory[iChapter].listLesson[src] =  $scope.course.listCourseCategory[iChapter].listLesson[des];
			$scope.course.listCourseCategory[iChapter].listLesson[des] = mid;
		}
		///////////
		$scope.deleteQuestion = function(iChapter, iLesson, iQuestion){
			console.log($scope.course.listCourseCategory[iChapter])
			if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].id){
				$scope.course.listQuestionDelete.push($scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].id);
			}
			$scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion.splice (iQuestion, 1);
		}
		///////////
		$scope.deleteAnswer = function(iChapter, iLesson, iQuestion, iAnswer){
			console.log(iChapter, iLesson, iQuestion, iAnswer)
			if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer[iAnswer].id){
				$scope.course.listAnswerDelete.push($scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer[iAnswer].id);
			}
			$scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer.splice (iAnswer, 1);
		}
		//////////////////////
		$scope.getVideoStream = function(iChapter, iLesson){
			if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].typeVideo == 'youtube'){
				var streamId = utils.getLinkYoutube($scope.course.listCourseCategory[iChapter].listLesson[iLesson].linkVideo);
				if(!streamId){
					$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = false;
					return;
				}
				$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + streamId + '?rel=0&amp;showinfo=0');
			}else if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].typeVideo == 'drive'){
				var streamId = utils.getLinkDrive($scope.course.listCourseCategory[iChapter].listLesson[iLesson].linkVideo);
				if(!streamId){
					$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = false;
					return;
				}
				$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = $sce.trustAsResourceUrl('https://drive.google.com/file/d/' + streamId + '/preview');
			}else{
				$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = false;
				$timeout(function () {
					$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = $sce.trustAsResourceUrl($scope.course.listCourseCategory[iChapter].listLesson[iLesson].linkVideo);
				}, 100);
			}
		}
		//////////
		$scope.validation = function(validation,action){
			if(!validation) return;
			if(!$scope.course.pictureData){
				utils.alert({
					title:'Thông báo',
					msg: 'Bạn phải chọn ảnh bìa khóa học'
				});
				return;
			}
			if($scope.course.listCourseCategory.length == 0){
				utils.alert({
					title:'Thông báo',
					msg: 'Bạn chưa tạo chapter nào'
				});
				return;
			}
			for (var iChapter = 0; iChapter < $scope.course.listCourseCategory.length; iChapter++) {
				if($scope.course.listCourseCategory[iChapter].name == ''){
					utils.alert({
						title:'Thông báo',
						msg: 'Bạn chưa đặt tên cho chapter ' + (iChapter + 1)
					});
					return;
				}
				if($scope.course.listCourseCategory[iChapter].listLesson.length == 0){
					utils.alert({
						title:'Thông báo',
						msg: 'Chapter ' + (iChapter + 1) + ' chưa có bài học nào'
					});
					return;
				}
				for (var iLesson = 0; iLesson < $scope.course.listCourseCategory[iChapter].listLesson.length; iLesson++) {
					if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].name == ''){
						utils.alert({
							title:'Thông báo',
							msg: 'Bạn chưa đặt tên cho bài học ' + (iChapter + 1) + '.' + (iLesson + 1)
						});
						return;
					}

					for (var iQuestion = 0; iQuestion < $scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion.length; iQuestion++) {
						if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].content == ''){
							utils.alert({
								title:'Thông báo',
								msg: 'Bạn chưa đặt viết nội dung câu hỏi thứ ' + (iQuestion + 1) + ' của bài học ' + (iChapter + 1) + '.' + (iLesson + 1)
							});
							return;
						}
						if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer.length == 0){
							utils.alert({
								title:'Thông báo',
								msg: 'Câu hỏi thứ ' + (iQuestion + 1) + ' bài học ' + + (iChapter + 1) + '.' + (iLesson + 1) + 	' không có đáp án'
							});
							return;
						}
						var isTrueFlag = false;
						for (var iAnswer = 0; iAnswer < $scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer.length; iAnswer++) {
							if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer[iAnswer].content == ''){
								utils.alert({
									title:'Thông báo',
									msg: 'Bạn chưa đặt viết nội dung câu trả lời thứ ' + (iAnswer + 1) + ' câu hỏi thứ ' + (iQuestion + 1) + ' bài học ' + + (iChapter + 1) + '.' + (iLesson + 1)
								});
								return;
							}
							if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer[iAnswer].isTrue){
								isTrueFlag = true;
							}
						}
						if(!isTrueFlag){
							utils.alert({
								title:'Thông báo',
								msg: 'Câu hỏi thứ ' + (iQuestion + 1) + ' bài học ' + + (iChapter + 1) + '.' + (iLesson + 1) + 	' không có đáp án đúng'
							});
							return;
						}
					}
				}
			}
			if(action == 'update') $scope.submit();
			if(action == 'resend') $scope.reSend ();
			
		}
		$scope.submit = function(){
			utils.confirm({
                title:'Thông báo',
                msg: 'Bạn muốn update?',
                callback:function(){
                	$http.post("/course/update",$scope.course,{}).then(function(res){
			  			if(res.data.message == 'success'){
			  				utils.alert({
			                    title:'Thông báo',
			                    msg: 'Đã update khóa học này',
			                    callback:function(){
			                    	window.location.reload();
			                    }
			                });
			  			}else{
			  				utils.alert({
			                    title:'Thông báo',
			                    msg: 'Có lỗi xảy ra,update không thành công'
			                });
			                console.log(res.data)
			  			}
			  		});
                }
            });
			
		}
		$scope.deleteCourse = function(){
			utils.confirm({
                title:'Thông báo',
                msg: 'Bạn muốn xóa?',
                callback:function(){
                	$http.post("/course/delete",$scope.course,{}).then(function(res){
			  			if(res.data.message == 'success'){
			  				utils.alert({
			                    title:'Thông báo',
			                    msg: 'Đã xóa khóa học này',
			                    callback:function(){
			                    	window.location = '/repository/waiting';
			                    }
			                });
			  			}else{
			  				utils.alert({
			                    title:'Thông báo',
			                    msg: 'Có lỗi xảy ra,xóa không thành công'
			                });
			  			}
			  		});
                }
            });
			
		}
		$scope.reSend = function(){
			utils.confirm({
                title:'Thông báo',
                msg: 'Bạn muốn nộp lại xét duyệt khóa học?',
                callback:function(){
                	$http.post("/course/re-active",$scope.course,{}).then(function(res){
			  			if(res.data.message == 'success'){
			  				utils.alert({
			                    title:'Thông báo',
			                    msg: 'Đã nộp đơn reactive khóa học này',
			                    callback:function(){
			                    	window.location.reload();
			                    }
			                });
			  			}else{
			  				utils.alert({
			                    title:'Thông báo',
			                    msg: 'Có lỗi xảy ra,nộp đơn reactive không thành công'
			                });
			                console.log(res.data)
			  			}
			  		});
                }
            });
		}
	});
	
})();
(function () {
	myApp.controller('loginTeacherCtr', function($scope, $http){
		$scope.user = {
			email:'',
			password:''
		}
		$scope.submit = function(validate){
			if(!validate) return;
			$http.post("/teacher/login/local",$scope.user,{}).then(function(res){
				$scope.disable = false;
				console.log(res.data)
	  			if(res.data.message == 'success'){
	  				location.reload();
	  			}else if(res.data.message == 'email_not_found'){
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Email không tồn tại'
                    });
	  			}else if(res.data.message == 'password_not_correct'){
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Sai mật khẩu'
                    });
	  			}else if(res.data.message == "account_not_active"){
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Tài khoản chưa được kích hoạt'
                    });
	  			}else{
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Có lỗi gì đó xảy ra.'
                    });
	  			}
	  		});
		}
	});
	
})();
(function () {
	myApp.controller('registerTeacherCtr', function($scope, $http){
		$scope.user = {}
		$scope.submit = function(validate){
			if(!validate) return;
			$http.post("/teacher/register",$scope.user,{}).then(function(res){
	  			if(res.data.message == 'success'){
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Chúng tôi đã gửi 1 link kích hoạt đến email : ' + $scope.user.email,
                        callback: function(){
	  						window.location.replace("/teacher/login");
                        }
                    });
	  			}else if(res.data.message == 'email_exist'){
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Email đã được đăng ký'
                    });
	  			}else{
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Có lỗi gì đó xảy ra.'
                    });
	  			}
	  		});
		}


		$scope.phoneValidation = [{
			func:function(val,cb){
				function checkPhoneNumber(phone) {
				    var flag = false;
				    if(!phone) return flag;
				    phone = phone.replace('(+84)', '0');
				    phone = phone.replace('+84', '0');
				    phone = phone.replace('0084', '0');
				    phone = phone.replace(/ /g, '');
				    if (phone != '') {
				        var firstNumber = phone.substring(0, 2);
				        if ((firstNumber == '09' || firstNumber == '08') && phone.length == 10) {
				            if (phone.match(/^\d{10}/)) {
				                flag = true;
				            }
				        } else if (firstNumber == '01' && phone.length == 11) {
				            if (phone.match(/^\d{11}/)) {
				                flag = true;
				            }
				        }
				    }
				    return flag;
				}
				cb(this.name, checkPhoneNumber(val)); 	
			},
			name:'is_phone_number',
			message:'Không phải số điện thoại'
		}];

		$scope.confirmPasswordValidation = [{
			func:function(val,cb){
				if(val == $scope.user.password){
					cb(this.name,true);
				}else{
					cb(this.name, false);
				}  	
			},
			name:'confirm_password',
			message:'Mật khẩu không khớp'
		}];
	});
	
})();

(function () {
	myApp.controller('withdrawCtr', function($scope, $http){
		$scope.submit = function(validate){
			if(!validate) return;
			$http.post("/withdraw",{reqMoney:$scope.money, note:$scope.note},{}).then(function(res){
				console.log(res.data)

	  			if(res.data.message == 'success'){
	  				location.reload();
	  			}else if(res.data.message == 'not_enough_money'){
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Không đủ tiền trong tài khoản'
                    });
	  			}else{
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Có lỗi gì đó xảy ra.'
                    });
	  			}
	  		});
		}
	});
	
})();