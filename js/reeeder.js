var reeeder = angular.module('reeeder', ['ngResource','LocalStorageModule']).
config(function($routeProvider,$locationProvider) {
	//$locationProvider.html5Mode(true);
	$routeProvider.
		when('/', {controller:MainCtrl, templateUrl:'main.html'}).
		when('/view/:feedUrl', {controller:ListCtrl, templateUrl:'list.html'}).
		//when('/new', {controller:CreateCtrl, templateUrl:'detail.html'}).
		otherwise({redirectTo:'/'});
}).
run(function($rootScope,localStorageService,User,FeedService){
	var feedsCache = angular.fromJson(localStorageService.get('feeds')) || {};

	$rootScope.feeds =  angular.copy(feedsCache) || {};

	var usr = User.get(function(u, getResponseHeaders) {
		angular.forEach(u.feeds,function(value,key){
			FeedService.parseFeed(value.xmlUrl).then(function(res){
				var unique_name = value.name.replace(/ /g,"_");
				var entries = res.data.responseData.feed.entries;
				$rootScope.feeds[unique_name] = value;
				var lastArticle = (typeof feedsCache[unique_name] == "undefined")? '' : feedsCache[unique_name]['stories'][0].publishedDate;
				if(lastArticle != entries[0].publishedDate) {
					$rootScope.feeds[unique_name]['stories'] = entries;
					localStorageService.add('feeds',angular.toJson($rootScope.feeds));
				}
			});
		});
	});
});

function MainCtrl($scope,$rootScope) {
	$scope.feeds = $rootScope.feeds;
}

function ListCtrl($scope,$rootScope,$routeParams,localStorageService) {
	var feedsCache = angular.fromJson(localStorageService.get('feeds'));
	$scope.feed = feedsCache[$routeParams.feedUrl];
};

reeeder.factory('FeedService',['$http','localStorageService',function($http,localStorageService){
	var thisService = {
		parseFeed : function(url){
			return $http.jsonp('//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(url));
		},
		updateFeeds: function(userFeeds) {
			angular.forEach(userFeeds,function(value,key){
				thisService.parseFeed(value.xmlUrl).then(function(res){

					console.log(entries);
					if(typeof value.stories === "undefined") {
						value['stories'] = entries;
					} else {
						console.log("ASDASDAS");
						console.log('first' + entries[0] + ' and last: ' + entries[entries.length]);
					}
//					u.feeds[fd].stories = stories_temp;
//					//console.log(u);
//					var nu = {"feeds":u.feeds};
//					u.update(nu,function(){ console.log("IASDJISADIOSAJDIUASDFHI"); });
//					// Check if there are any stories in existing db object
//					if ($.isEmptyObject(u.feeds[fd].stories)) {
//
//					} else {
//						for (i in stories_temp) {
//							// u.feeds[fd].stories
//						}
//					}

					// Check if newest date inside db is older than newest from pull

					//console.log(stories_temp[0]);
					//if (stories_temp[0].publishedDate
					//
				});
			});
			localStorageService.add('feeds',angular.toJson(userFeeds));
			return userFeeds;
		}
	};
	return thisService;
}]);
//        for (fd in u.feeds) {

//            //$scope.feeds.push($scope.loadFeed(fd.xmlUrl));
//        }
// User.update(function(){ alert("AA"); });
//usr = u;

// console.log(u.feeds);



// This is a module for cloud persistance in mongolab - https://mongolab.com
reeeder.factory('User', function($resource) {

	var User = $resource('https://api.mongolab.com/api/1/databases/reeeder/collections/users/:userId',
		{ apiKey: '4y9TFs_oLip1Y3_AKd4i8gb8tbsyp2db', userId:'514c9c64e4b0c5268d211a55' }, {
			update: { method: 'PUT' }
		}
	);

	User.prototype.update = function(ob,cb) {
		return User.update({}, ob, cb);
	};

	User.prototype.destroy = function(cb) {
		return User.remove({id: this._id.$oid}, cb);
	};

	return User;
});