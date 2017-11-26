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