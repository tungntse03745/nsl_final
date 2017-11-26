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