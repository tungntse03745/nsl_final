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

