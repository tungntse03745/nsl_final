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