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