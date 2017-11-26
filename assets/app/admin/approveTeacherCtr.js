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