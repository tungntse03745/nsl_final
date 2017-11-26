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