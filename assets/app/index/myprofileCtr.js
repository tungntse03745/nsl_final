(function () {
	myApp.controller('myProfileCtr', function($scope, $http){
		$scope.user = {}

		//GET PROFILE
		$scope.getProfile = function(){
			$http.post("/user/myprofile",{},{}).then(function(res){
				$scope.user = res.data.user;
				console.log(res)

	  		});
		}
		$scope.getProfile();
		//UPLOAD IMAGE & EDIT PROFILE
		function readURL(input) {
		    if (input.files && input.files[0]) {
		        var reader = new FileReader();
		        reader.onload = function (e) {
		            $('#img-in-modal').attr('src', e.target.result);
		        }
		        reader.readAsDataURL(input.files[0]);
		    }
		}
		$scope.openInputFile = function(){
			$("#upload-img").click();
			$("#upload-img").change(function(){
				var file = $("#upload-img")[0].files[0];
				var fileType = file["type"];
				var ValidImageTypes = ["image/gif", "image/jpeg", "image/png"];
				if ($.inArray(fileType, ValidImageTypes) < 0) {
					//NOT A IMAGE
						$('#upload-img').val("");
						utils.alert({
		                title:'Thông Báo',
		                msg: 'Bạn phải lựa chọn hình ảnh'
		            });
		            return;
				}
				readURL(this);
		 		$('#review_upload_img').modal('show');
			});
			$('#review_upload_img').on('shown.bs.modal', function () {
				$('#img-in-modal').cropper({
					viewMode:2,
					autoCropArea: 1,
					aspectRatio: 1 / 1
				});
			}).on('hidden.bs.modal', function () {
				$('#img-in-modal').cropper('destroy');
				$('#upload-img').val("");
			});
			$('#cut-picture-btn').click(function(){
				var dataImg = $('#img-in-modal').cropper('getData');
				var c=document.getElementById("crop-canvas");
			    var ctx=c.getContext("2d");
			    var img=document.getElementById("img-in-modal");
			    ctx.drawImage(img,dataImg.x,dataImg.y,dataImg.width,dataImg.height,0,0,320,320);
			    $scope.user.avatar = c.toDataURL('image/png', 1.0);
			    $scope.user.isUpload = true;
			    $scope.$apply();
				$('#avatar-image-root').attr('src',$scope.course.pictureData);
			});
		}
		$scope.submitEdit = function(validate){
			if(!validate) return;
			$http.post("/user/edit",$scope.user,{}).then(function(res){
				$scope.disable = false;
	  			if(res.data.message == 'success'){
	  				location.reload(true);
	  			}else if(res.data.message == 'error'){
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Có lỗi gì đó xảy ra'
                    });
	  			}
	  		});
		}
		$scope.submitAprove = function(){
			$http.post("/teacher/submit-approve-teacher",{},{}).then(function(res){
	  			if(res.data.message == 'success'){
	  				location.reload(true);
	  			}else if(res.data.message == 'error'){
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Có lỗi gì đó xảy ra'
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
	});
	
})();