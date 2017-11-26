(function () {
	myApp.controller('registerTeacherCtr', function($scope, $http){
		$scope.user = {}
		$scope.submit = function(validate){
			if(!validate) return;
			$http.post("/teacher/register",$scope.user,{}).then(function(res){
	  			if(res.data.message == 'success'){
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Chúng tôi đã gửi 1 link kích hoạt đến email : ' + $scope.user.email,
                        callback: function(){
	  						window.location.replace("/teacher/login");
                        }
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


		$scope.phoneValidation = [{
			func:function(val,cb){
				function checkPhoneNumber(phone) {
				    var flag = false;
				    if(!phone) return flag;
				    phone = phone.replace('(+84)', '0');
				    phone = phone.replace('+84', '0');
				    phone = phone.replace('0084', '0');
				    phone = phone.replace(/ /g, '');
				    if (phone != '') {
				        var firstNumber = phone.substring(0, 2);
				        if ((firstNumber == '09' || firstNumber == '08') && phone.length == 10) {
				            if (phone.match(/^\d{10}/)) {
				                flag = true;
				            }
				        } else if (firstNumber == '01' && phone.length == 11) {
				            if (phone.match(/^\d{11}/)) {
				                flag = true;
				            }
				        }
				    }
				    return flag;
				}
				cb(this.name, checkPhoneNumber(val)); 	
			},
			name:'is_phone_number',
			message:'Không phải số điện thoại'
		}];

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
	});
	
})();
