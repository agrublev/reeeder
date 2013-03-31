var reeeder = angular.module('reeeder', ['reeeder.store','ngResource','LocalStorageModule'])
.config(function($routeProvider) {
$routeProvider.
	when('/', {controller:ListCtrl, templateUrl:'list.html'}).
	// when('/edit/:projectId', {controller:EditCtrl, templateUrl:'detail.html'}).
	//when('/new', {controller:CreateCtrl, templateUrl:'detail.html'}).
	otherwise({redirectTo:'/'});
});

// Main app controller
function MainCtrl($scope, items, scroll, bgPage) {

	$scope.items = items;

	$scope.refresh = function() {
		bgPage.refreshFeeds();
	};

	$scope.handleSpace = function() {
		if (!scroll.pageDown()) {
			items.next();
		}
	};

	$scope.$watch('items.selectedIdx', function(newVal) {
		if (newVal !== null) scroll.toCurrent();
	});
}


// Top Menu/Nav Bar
function NavBarController($scope, items) {

	$scope.showAll = function() {
		items.clearFilter();
	};

	$scope.showUnread = function() {
		items.filterBy('read', false);
	};

	$scope.showStarred = function() {
		items.filterBy('starred', true);
	};

	$scope.showRead = function() {
		items.filterBy('read', true);
	};
}