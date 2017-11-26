/**
 * Created by TuanAnh on 11/23/2017.
 */
(function () {
    myApp.controller('changePasswordStudentCtr', function($scope, $http){
            $scope.changePass = {
                password:'',
                password_confirm:''
            }

            $scope.disable = false;
            $scope.submit = function(validate){

                if(!validate || $scope.disable) return;
                $scope.disable = true;
                $http.post("/changePassword",$scope.changePass,{}).then(function(res){
                    $scope.disable = false;

                    if(res.data.message == 'success'){
                        utils.alert({
                            title:'Thông báo',
                            msg: 'Đổi mật khẩu thành công !'
                        });
                    }
                });
            }

///

            $scope.confirmNewPasswordValidation = [{
                func:function(val,cb){
                    if(val == $scope.changePass.password){
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