var myApp;
(function () {
	myApp = angular.module('myApp',['ui.bootstrap','trumbowyg-ng','ngSanitize','chart.js']);
	//filter:search name have this string
	myApp.filter('vnd', function() {
		return function(input) {
			//funkyStringSplit: split 1 element have 3 character
			function funkyStringSplit( s ){
			    var i = s.length % 3;
			    var parts = i ? [ s.substr( 0, i ) ] : [];
			    for( ; i < s.length ; i += 3 )
			    {
			        parts.push( s.substr( i, 3 ) );
			    }
			    return parts;
			}
			var str = input + '';
			arr = funkyStringSplit(str);
			if(arr.length == 0 || input==undefined) return '';
			if(arr.length ==1) return str + ' đ';
			if(arr.length > 1){
				var x = arr[0];
				for(var i = 1; i < arr.length; i++){
					x += ',' + arr[i]; 
				}
				x += 'đ';
				return x;
			}
		};
	});
	// count percent of sale
	myApp.filter('pricepercent', function() {
		return function(input) {
			var arr = input.split('-');
			var old = parseInt(arr[0]);
			var _new = parseInt(arr[1]);
			var x = parseInt((old - _new) / old * 100);
			return x + '%';
		};
	});
	//
	myApp.filter('space', function() {
		return function(input) {
			console.log(input)
			input = input.replace(/\n/g, "<br>");
			return input;
		};
	});
	//format datetime
	myApp.filter('datetime', function() {
		return function(input) {
			x = new Date(input)
			dd= x.getDate();
			MM = x.getMonth() + 1;
			yyyy = x.getFullYear();
			HH = x.getHours();
			mm = x.getMinutes();
			return dd + ', tháng ' + MM + ', ' + yyyy + ' lúc ' + HH + ':' + mm;
		};
	});
	myApp.filter('startFrom', function() {
	    return function(input, start) {
	        start = +start; //parse to int
	        return input.slice(start);
	    }
	});


})();
(function () {
	// define error //define content of tooltip to report user
	var strVar="";
	strVar += "<div class=\"validate-input\">";
	strVar += "	<input type=\"{{vType}}\" class=\"form-control\" placeholder=\"{{vPlaceholder}}\" name=\"{{vName}}\" ng-model=\"vModel\" tooltip-enable=\"{{!vForm[vName].$valid}}\" tooltip-placement=\"{{vTooltipPlacement}}\" uib-tooltip-template=\"'validate.html'\" ng-class=\"!vForm[vName].$valid&&vForm.$submitted?'err':''\" ng-required=\"{{vRequired}}\" ng-minlength=\"{{vMinLength}}\" ng-maxlength=\"{{vMaxLength}}\" ng-min=\"{{vMin}}\" ng-max=\"{{vMax}}\">";
	strVar += "	<!-- VALIDATE TEN KHOA HOC -->";
	strVar += "	<script type=\"text\/ng-template\" id=\"validate.html\">";
	strVar += "		<div ng-show=\"vForm[vName].$error.required\">Không được bỏ trống<\/div>";
	strVar += "		<div ng-show=\"vForm[vName].$error.email\">Phải là email<\/div>";
	strVar += "		<div ng-show=\"vForm[vName].$error.minlength\">Lớn hơn {{vMinLength}} ký tự<\/div>";
	strVar += "		<div ng-show=\"vForm[vName].$error.maxlength\">Nhỏ hơn {{vMaxLength}} ký tự<\/div>";
	strVar += "		<div ng-show=\"vForm[vName].$error.min\">Lớn hơn {{vMin}}<\/div>";
	strVar += "		<div ng-show=\"vForm[vName].$error.max\">Nhỏ hơn {{vMax}}<\/div>";
	strVar += "		<div ng-repeat=\"validation in vCustomValidations\">";
	strVar += "			<div ng-show=\"vForm[vName].$error[validation.name]\">{{validation.message}}<\/div>";
	strVar += "		<\/div>";
	strVar += "	<\/script>";
	strVar += "	<!-- END -->";
	strVar += "<\/div>";

	myApp.directive('validateInput', function(){
		return{
			restrict: 'AEM',
			template: strVar,
			replace: true,
			scope:{
				vModel: '=',
				vForm: '=',
				vName: '@',
				vType: '@',
				vPlaceholder: '@',
				vTooltipPlacement: '@',
				vRequired: '@',
				vMinLength: '@',
				vMaxLength: '@',
				vMin: '@',
				vMax: '@',
				vCustomValidations : '='
			},
			link: function(scope, elements, attrs){
				if(!scope.vCustomValidations) return;
				scope.$watch('vModel', function(newValue, oldValue) {
	                for(var i = 0; i < scope.vCustomValidations.length; i++){
						scope.vCustomValidations[i].func(newValue,function(name, isValid){
			                scope.vForm[scope.vName].$setValidity(name, isValid);
						});
					}
	            });
			},
			transclude: true,
			controller: function($scope){
			}
		}
	});
})(); 