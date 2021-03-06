/**
 * Created by TuanAnh on 11/23/2017.
 */
(function () {
    myApp.controller('changePasswordTeacherCtr', function($scope, $http){
            $scope.changePass = {
                 oldPassword:'',
                password:'',
                password_confirm:''
            }

            $scope.disable = false;
            $scope.submit = function(validate){

                if(!validate || $scope.disable) return;
                $scope.disable = true;
                $http.post("/changePasswordTeacher",$scope.changePass,{}).then(function(res){
                    $scope.disable = false;

                    if(res.data.message == 'success'){
                        utils.alert({
                            title:'Thông báo',
                            msg: 'Đổi mật khẩu thành công !',
                            callback:function(){
                                    window.location = 'http://localhost:1337/';
                                }
                        });
                    }
                    if(res.data.message == 'notSuccess'){
                        utils.alert({
                            title:'Thông báo',
                            msg: 'Mật khẩu cũ sai!'
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

        }

    );

})();