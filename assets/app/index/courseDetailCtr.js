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








