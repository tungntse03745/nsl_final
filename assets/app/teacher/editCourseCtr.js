(function () {
	myApp.controller('editCourseCtr', function($scope, $http, $sce, $timeout){
		// $scope.course = {
		// 	name:'',
		// 	category:undefined,
		// 	level:undefined,
		// 	price:undefined,
		// 	oldPrice:undefined,
		// 	pictureData: undefined,
		// 	generalDescription:'',
		// 	requirement:'',
		// 	benefit:'',
		// 	objectAndGoals:'',
		// 	listCourseCategory:[],
		// }
		///////////////LOAD DATA////
		$scope.load = function(){
			var id = parseInt(location.pathname.split('/')[3]);
			$http.post("/course/get-details",{id:id},{}).then(function(res){
				console.log(res)
	  			if(res.data.message == 'success'){
	  				$scope.course = res.data.course;
	  				for(var iChapter = 0; iChapter < $scope.course.listCourseCategory.length; iChapter++){
	  					$scope.course.listCourseCategory[iChapter].UIshow = true;
	  				}
	  				$scope.course.pictureUpload = false;
	  				$scope.course.listCourseCategoryDelete = [];
	  				$scope.course.listLessonDelete  = [];
	  				$scope.course.listQuestionDelete  = [];
	  				$scope.course.listAnswerDelete  = [];
	  				$scope.course.listCourseCategory.sort(function(a, b){
						var keyA = new Date(a.order),
						keyB = new Date(b.order);
						// Compare the 2 dates
						if(keyA < keyB) return -1;
						if(keyA > keyB) return 1;
						return 0;
					});
					for(var iChapter = 0; iChapter < $scope.course.listCourseCategory.length; iChapter++){
						$scope.course.listCourseCategory[iChapter].listLesson.sort(function(a, b){
							var keyA = new Date(a.order),
							keyB = new Date(b.order);
							// Compare the 2 dates
							if(keyA < keyB) return -1;
							if(keyA > keyB) return 1;
							return 0;
						});
					}

					for(var iChapter = 0; iChapter < $scope.course.listCourseCategory.length; iChapter++){
	  					for(var iLesson = 0; iLesson < $scope.course.listCourseCategory[iChapter].listLesson.length; iLesson++){
	  						console.log('sa')
	  						console.log(iChapter,iLesson)
	  						$scope.getVideoStream(iChapter,iLesson);
	  					}
	  				}
	  			}
	  		});
		}
		$scope.load();



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
			    $scope.course.pictureUpload = true;
			    $scope.$apply();
				$('#picture-preview').attr('src',$scope.course.pictureData);
			});
		}
		$scope.default = {
			levels:[],
			categories:[]
		}
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

		$scope.newChapter = function(){
			$scope.course.listCourseCategory.push({
				UIshow:true,
				listLesson:[],
				name:'',
				order:$scope.course.listCourseCategory.length,
				isNew: true
			});
		}
		$scope.newLesson = function(iChapter){
			$scope.course.listCourseCategory[iChapter].listLesson.push({
				UIshow:true,
				name:'',
				listQuestion:[],
				linkVideo:'',
				typeVideo:'youtube',
				content:'',
				streamLink:'',
				order:$scope.course.listCourseCategory[iChapter].listLesson.length,
				isNew: true
			});
		}
		$scope.newQuestion = function(iChapter, iLesson){
			$scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion.push({
				listAnswer:[],
				content:'',
				isNew:true
			});
		}
		$scope.newAnswer = function(iChapter, iLesson, iQuestion){
			$scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer.push({
				content:'',
				isTrue:false,
				isNew:true
			});
		}
		///////////////
		$scope.deleteChapter = function(iChapter){
			for(var i = iChapter; i < $scope.course.listCourseCategory.length; i++){
				$scope.course.listCourseCategory[i].order--;
			}
			if($scope.course.listCourseCategory[iChapter].id){
				$scope.course.listCourseCategoryDelete.push($scope.course.listCourseCategory[iChapter].id);
			}
			$scope.course.listCourseCategory.splice (iChapter, 1);
		}
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
			if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].id){
				$scope.course.listLessonDelete.push($scope.course.listCourseCategory[iChapter].listLesson[iLesson].id);
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
			console.log($scope.course.listCourseCategory[iChapter])
			if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].id){
				$scope.course.listQuestionDelete.push($scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].id);
			}
			$scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion.splice (iQuestion, 1);
		}
		///////////
		$scope.deleteAnswer = function(iChapter, iLesson, iQuestion, iAnswer){
			console.log(iChapter, iLesson, iQuestion, iAnswer)
			if($scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer[iAnswer].id){
				$scope.course.listAnswerDelete.push($scope.course.listCourseCategory[iChapter].listLesson[iLesson].listQuestion[iQuestion].listAnswer[iAnswer].id);
			}
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
		//////////
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
			if(action == 'update') $scope.submit();
			if(action == 'resend') $scope.reSend ();
			
		}
		$scope.submit = function(){
			utils.confirm({
                title:'Thông báo',
                msg: 'Bạn muốn update?',
                callback:function(){
                	$http.post("/course/update",$scope.course,{}).then(function(res){
			  			if(res.data.message == 'success'){
			  				utils.alert({
			                    title:'Thông báo',
			                    msg: 'Đã update khóa học này',
			                    callback:function(){
			                    	window.location.reload();
			                    }
			                });
			  			}else{
			  				utils.alert({
			                    title:'Thông báo',
			                    msg: 'Có lỗi xảy ra,update không thành công'
			                });
			                console.log(res.data)
			  			}
			  		});
                }
            });
			
		}
		$scope.deleteCourse = function(){
			utils.confirm({
                title:'Thông báo',
                msg: 'Bạn muốn xóa?',
                callback:function(){
                	$http.post("/course/delete",$scope.course,{}).then(function(res){
			  			if(res.data.message == 'success'){
			  				utils.alert({
			                    title:'Thông báo',
			                    msg: 'Đã xóa khóa học này',
			                    callback:function(){
			                    	window.location = '/repository/waiting';
			                    }
			                });
			  			}else{
			  				utils.alert({
			                    title:'Thông báo',
			                    msg: 'Có lỗi xảy ra,xóa không thành công'
			                });
			  			}
			  		});
                }
            });
			
		}
		$scope.reSend = function(){
			utils.confirm({
                title:'Thông báo',
                msg: 'Bạn muốn nộp lại xét duyệt khóa học?',
                callback:function(){
                	$http.post("/course/re-active",$scope.course,{}).then(function(res){
			  			if(res.data.message == 'success'){
			  				utils.alert({
			                    title:'Thông báo',
			                    msg: 'Đã nộp đơn reactive khóa học này',
			                    callback:function(){
			                    	window.location.reload();
			                    }
			                });
			  			}else{
			  				utils.alert({
			                    title:'Thông báo',
			                    msg: 'Có lỗi xảy ra,nộp đơn reactive không thành công'
			                });
			                console.log(res.data)
			  			}
			  		});
                }
            });
		}
	});
	
})();