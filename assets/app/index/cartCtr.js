(function () {
	myApp.controller('cartCtr', function($scope, $http, $rootScope){
		///////// CART ROOTSCOPE//////////////////////////////
		//
		$rootScope.addToCart = function(id){
			var courseId = parseInt(id);
			$http.post("/add-to-cart",{id:courseId},{}).then(function(res){
				if(res.data.message == 'not_login'){
					$('#loginModal').modal('show');
				}else if(res.data.message == 'success'){
					$rootScope.showAddToCartBtn = false;
					$rootScope.cartOpen = true;//*
					$rootScope.listCart = res.data.listCourses;
					$rootScope.listCartMoney = $rootScope.listCart.sum("price");
					// $rootScope.listCartMoneyOld = $rootScope.listCart.sum("oldPrice");
				}else if(res.data.message == 'not_student'){
					utils.alert({
                        title:'Thông báo',
                        msg: 'Hãy đăng nhập với tài khoản học sinh(thành viên)'
                    });
				}else if(res.data.message == 'course_buyed'){
					utils.alert({
                        title:'Thông báo',
                        msg: 'Bạn đã mua khóa học này rồi'
                    });
				}
	  		});
		}
		$rootScope.initCart = function(){
			$rootScope.listCart = [];
			$rootScope.listCartMoney = 0;
			$http.post("/list-cart",{},{}).then(function(res){
				if(res.data.message == 'not_login'){

				}else if(res.data.message == 'success'){
					$rootScope.listCart = res.data.listCourses;
					if($rootScope.listCart.length != 0) $rootScope.listCartMoney = $rootScope.listCart.sum("price");
					if($rootScope.listCart.length == 0) $rootScope.listCartMoney = 0;
				    	$rootScope.listCartMoneySave = $rootScope.listCart.sumSave("oldPrice","price");
				}
	  		});
		}
		$rootScope.initCart();
		$rootScope.destroyItemCart = function(id){
			$http.post("/destroy-item-cart",{id:id},{}).then(function(res){
				if(res.data.message == 'success'){
					$rootScope.initCart();
				}
	  		});
		}
		$rootScope.phoneValidation = [{
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
		$rootScope.payment = function(isValid){
			if(!isValid) return;
			$http.post("/payment",{note:$rootScope.note},{}).then(function(res){
				if(res.data.message == 'success'){
					utils.alert({
                        title:'Thông báo',
                        msg: 'Đã order khóa học',
                        callback:function(){
                        	window.location.replace("/payment-history");
                        }
                    });
				}else{
					utils.alert({
                        title:'Thông báo',
                        msg: 'Có lỗi xảy ra'
                    });
				}
	  		});
		}
		Array.prototype.sum = function (prop) {
			var total = 0
			for ( var i = 0, _len = this.length; i < _len; i++ ) {
			    total += this[i][prop]
			}
			return total
		}
		Array.prototype.sumSave = function (_old, _new) {
			var total = 0
			for ( var i = 0, _len = this.length; i < _len; i++ ) {
				if(this[i][_old] > this[i][_new])
			    	total += this[i][_old]
			}
			return total
		}
		///////// CART ROOTSCOPE END//////////////////////////////
	});
	
})();
