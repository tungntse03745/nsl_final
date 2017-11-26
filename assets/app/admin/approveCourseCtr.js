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