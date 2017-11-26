(function () {
	myApp.controller('addLessionCtr', function($scope, $http, $sce, $timeout){
		$scope.editorModel = '!!!';
		// định dạng course
		$scope.course = {
			name:'',
			category:undefined,
			level:undefined,
			price:undefined,
			oldPrice:undefined,
			pictureData: undefined,
			generalDescription:'',
			requirement:'',
			benefit:'',
			objectAndGoals:'',
			listCourseCategory:[],
		}
		//UPLOAD IMAGE
		function readURL(input) {
		    if (input.files && input.files[0]) {
		        var reader = new FileReader();
		        reader.onload = function (e) {
		            $('#img-in-modal').attr('src', e.target.result);
		        }
		        reader.readAsDataURL(input.files[0]);
		    }
		}
		// tải ảnh lên
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
			                title:'Thong bao',
			                msg: 'Ban phai chon 1 file la hinh anh'
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
					aspectRatio: 8 / 5
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
			    ctx.drawImage(img,dataImg.x,dataImg.y,dataImg.width,dataImg.height,0,0,800,500);
			    $scope.course.pictureData = c.toDataURL('image/png', 1.0);
			    $scope.$apply();
				$('#picture-preview').attr('src',$scope.course.pictureData);
			});
		}
		// tạo levels và cate admin tạo sẵn ,
		$scope.default = {
			levels:[],
			categories:[]
		}
		// nhận data từ server đẩy lên cho category và level
		$scope.loadLevelAndCategory = function(){
			$http.post("/list-simple-level",{name:'',skip:0,limit:999999999},{}).then(function(res){
	  			if(res.data.message == 'success'){
	  				$scope.default.levels = res.data.levels;
	  			}
	  		});
	  		$http.post("/list-simple-category",{name:'',skip:0,limit:999999999},{}).then(function(res){
	  			if(res.data.message == 'success'){
	  				$scope.default.categories = res.data.categories;
	  			}
	  		});
		}
		$scope.loadLevelAndCategory();

		//////////////////////////////////
		// tạo model cho chapter mới
		$scope.newChapter = function(){
			$scope.course.listCourseCategory.push({
				UIshow:true,
				listLesson:[],
				name:'',
				order:$scope.course.listCourseCategory.length
			});
		}
		// tạo model cho lesson, truyền vào chỉ số của chapter để xác định .
		$scope.newLesson = function(iChapter){
			$scope.course.listCourseCategory[iChapter].listLesson.push({
				UIshow:true,
				name:'',
				listQuestion:[],
				linkVideo:'',
				typeVideo:'youtube',
				content:'',
				streamLink:'<h1>sa</h1>',
				order:$scope.course.listCourseCategory[iChapter].listLesson.length
			});
		}
		// tạo model cho newQuestion, truyền vào chỉ số của chapter Lesson để xác định .
		$scope.newQuestion = function(iChapter, iLesson){
			$scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion.push({
				listAnswer:[],
				content:''
			});
		}
		// tạo model cho newAnswer, truyền vào chỉ số của chapter iChapter iLesson iQuestion  để xác định ,
		$scope.newAnswer = function(iChapter, iLesson, iQuestion){
			$scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer.push({
				content:'',
				isTrue:false
			});
		}
		///////////////
		// xóa chapter
		$scope.deleteChapter = function(iChapter){
			for(var i = iChapter; i < $scope.course.listCourseCategory.length; i++){
				$scope.course.listCourseCategory[i].order--;
			}
			$scope.course.listCourseCategory.splice (iChapter, 1);
		}
		// đảo chapter
		$scope.swapChapter = function(src,des){
			console.log(des)
			if(des < 0 || des >= $scope.course.listCourseCategory.length){
				console.log('die')
				return;
			}
			var srcO = $scope.course.listCourseCategory[src].order;
			var desO = $scope.course.listCourseCategory[des].order;
			$scope.course.listCourseCategory[src].order = desO;
			$scope.course.listCourseCategory[des].order = srcO;
			

			var mid = $scope.course.listCourseCategory[src];
			$scope.course.listCourseCategory[src] =  $scope.course.listCourseCategory[des];
			$scope.course.listCourseCategory[des] = mid;
		}
		///////////////
		$scope.deleteLesson = function(iChapter, iLesson){
			for(var i = iLesson; i < $scope.course.listCourseCategory[iChapter].listLesson.length; i++){
				$scope.course.listCourseCategory[iChapter].listLesson[i].order--;
			}
			$scope.course.listCourseCategory[iChapter].listLesson.splice (iLesson, 1);
		}
		$scope.swapLesson = function(iChapter,src,des){
			if(des < 0 || des >= $scope.course.listCourseCategory[iChapter].listLesson.length){
				console.log('die')
				return;
			}
			var srcO = $scope.course.listCourseCategory[iChapter].listLesson[src].order;
			var desO = $scope.course.listCourseCategory[iChapter].listLesson[des].order;
			$scope.course.listCourseCategory[iChapter].listLesson[src].order = desO;
			$scope.course.listCourseCategory[iChapter].listLesson[des].order = srcO;
			

			var mid = $scope.course.listCourseCategory[iChapter].listLesson[src];
			$scope.course.listCourseCategory[iChapter].listLesson[src] =  $scope.course.listCourseCategory[iChapter].listLesson[des];
			$scope.course.listCourseCategory[iChapter].listLesson[des] = mid;
		}
		///////////
		$scope.deleteQuestion = function(iChapter, iLesson, iQuestion){
			$scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion.splice (iQuestion, 1);
		}
		///////////
		$scope.deleteAnswer = function(iChapter, iLesson, iQuestion, iAnswer){
			$scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer.splice (iAnswer, 1);
		}
		//////////////////////
		$scope.getVideoStream = function(iChapter, iLesson){
			if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].typeVideo == 'youtube'){
				var streamId = utils.getLinkYoutube($scope.course.listCourseCategory[iChapter].listLesson[iLesson].linkVideo);
				if(!streamId){
					$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = false;
					return;
				}
				$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + streamId + '?rel=0&amp;showinfo=0');
			}else if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].typeVideo == 'drive'){
				var streamId = utils.getLinkDrive($scope.course.listCourseCategory[iChapter].listLesson[iLesson].linkVideo);
				if(!streamId){
					$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = false;
					return;
				}
				$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = $sce.trustAsResourceUrl('https://drive.google.com/file/d/' + streamId + '/preview');
			}else{
				$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = false;
				$timeout(function () {
					$scope.course.listCourseCategory[iChapter].listLesson[iLesson].streamLink = $sce.trustAsResourceUrl($scope.course.listCourseCategory[iChapter].listLesson[iLesson].linkVideo);
				}, 100);
			}
		}
		////////// validation new course
		$scope.validation = function(validation,action){
			if(!validation) return;
			if(!$scope.course.pictureData){
				utils.alert({
					title:'Thông báo',
					msg: 'Bạn phải chọn ảnh bìa khóa học'
				});
				return;
			}
			if($scope.course.listCourseCategory.length == 0){
				utils.alert({
					title:'Thông báo',
					msg: 'Bạn chưa tạo chapter nào'
				});
				return;
			}
			for (var iChapter = 0; iChapter < $scope.course.listCourseCategory.length; iChapter++) {
				if($scope.course.listCourseCategory[iChapter].name == ''){
					utils.alert({
						title:'Thông báo',
						msg: 'Bạn chưa đặt tên cho chapter ' + (iChapter + 1)
					});
					return;
				}
				if($scope.course.listCourseCategory[iChapter].listLesson.length == 0){
					utils.alert({
						title:'Thông báo',
						msg: 'Chapter ' + (iChapter + 1) + ' chưa có bài học nào'
					});
					return;
				}
				for (var iLesson = 0; iLesson < $scope.course.listCourseCategory[iChapter].listLesson.length; iLesson++) {
					if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].name == ''){
						utils.alert({
							title:'Thông báo',
							msg: 'Bạn chưa đặt tên cho bài học ' + (iChapter + 1) + '.' + (iLesson + 1)
						});
						return;
					}

					for (var iQuestion = 0; iQuestion < $scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion.length; iQuestion++) {
						if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].content == ''){
							utils.alert({
								title:'Thông báo',
								msg: 'Bạn chưa đặt viết nội dung câu hỏi thứ ' + (iQuestion + 1) + ' của bài học ' + (iChapter + 1) + '.' + (iLesson + 1)
							});
							return;
						}
						if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer.length == 0){
							utils.alert({
								title:'Thông báo',
								msg: 'Câu hỏi thứ ' + (iQuestion + 1) + ' bài học ' + + (iChapter + 1) + '.' + (iLesson + 1) + 	' không có đáp án'
							});
							return;
						}
						var isTrueFlag = false;
						for (var iAnswer = 0; iAnswer < $scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer.length; iAnswer++) {
							if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer[iAnswer].content == ''){
								utils.alert({
									title:'Thông báo',
									msg: 'Bạn chưa đặt viết nội dung câu trả lời thứ ' + (iAnswer + 1) + ' câu hỏi thứ ' + (iQuestion + 1) + ' bài học ' + + (iChapter + 1) + '.' + (iLesson + 1)
								});
								return;
							}
							if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer[iAnswer].isTrue){
								isTrueFlag = true;
							}
						}
						if(!isTrueFlag){
							utils.alert({
								title:'Thông báo',
								msg: 'Câu hỏi thứ ' + (iQuestion + 1) + ' bài học ' + + (iChapter + 1) + '.' + (iLesson + 1) + 	' không có đáp án đúng'
							});
							return;
						}
					}
				}
			}
		if(action == 'approve')	$scope.submit();
        if(action == 'save') $scope.submitSave();
		}
		$scope.submitSave = function() {
			console.log("submitSave")
			$http.post("/teacher/save-course",$scope.course,{}).then(function (res) {

				if(res.data.message =='saved'){
					utils.alert({
						title:'Thông Báo',
						msg:'Đã tạo và lưu khóa học',
						callback:function() {
							window.location='/repository/save'
						}
					})
				}
				else{
					utils.alert({
						title:'Thông báo',
						msg: 'Có lỗi xảy ra,tạo không thành công'
					});
				}

			}
			)
		}

		$scope.submit = function(){

            // var btnSave =document.getElementById('btnSave').value;
            // var btnApprove =document.getElementById('btnApprove').value;
				console.log("submit")


			$http.post("/teacher/new-course",$scope.course,{}).then(function(res){
			//	document.getElementById('check').value = $('btnWaitApprove').text();
	  			if(res.data.message == 'success'){
	  				utils.alert({
	                    title:'Thông báo',
	                    msg: 'Đã tạo và yêu cầu duyệt khóa học này',
	                    callback:function(){
	                    	window.location = '/repository/waiting';
	                    }
	                });
	  			}else{
	  				utils.alert({
	                    title:'Thông báo',
	                    msg: 'Có lỗi xảy ra,tạo không thành công'
	                });
	  			}
	  		});
		}




	});
	
})();