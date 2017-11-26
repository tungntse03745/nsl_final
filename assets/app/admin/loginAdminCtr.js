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






