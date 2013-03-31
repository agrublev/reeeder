var storeModule = angular.module('reeeder.store', []);

/**
 * Persistence service for all feeds data. Abstracts away all persistence operation on the local and cloud storage
 * and synchronization of data between the two.
 */
storeModule.factory('feedStore', function($q, $rootScope) {
	var syncInProgress = false;


	/**
	 * @param
	 * @return {Object} New Refreshed Feeds
	 */
	function getFeeds() {
		// return feeds;
	}


	return {
		/**
		 * Merges the new feed dump, existing feed content in local store and feed states from the cloud.
		 *
		 * @param updatedFeed Data for a single feed.
		 * @return {Promise} Promise to be resolved with feeds object after the merge.
		 */
		updateFeed: function(updatedFeed) {
			var deferred = $q.defer();

			getFeedsFrom(contentStorage).then(function(feeds) {
				var feed = feeds[updatedFeed.url] || (feeds[updatedFeed.url] = {url: updatedFeed.url, entries: {}});

				feed.title = updatedFeed.title;
				angular.forEach(updatedFeed.entries, function(entry, entryId) {
					if (feed.entries[entryId]) {
						entry.read = feed.entries[entryId].read;
						entry.starred = feed.entries[entryId].starred;
					}
					feed.entries[entryId] = entry;
				});


				getFeedsFrom(stateStorage).then(function(feedStates) {
					syncStorages(feeds, feedStates).then(function(feeds) {
						deferred.resolve(feeds);
						if (!$rootScope.$$phase) $rootScope.$apply();
					});
				});
			});

			return deferred.promise;
		},


		/**
		 * Updates a single feed entry property in both local and cloud storages.
		 *
		 * @param feedUrl
		 * @param entryId
		 * @param propName
		 * @param propValue
		 */
		updateEntryProp: function(feedUrl, entryId, propName, propValue) {
			getFeedsFrom(contentStorage).then(function(feeds) {
				feeds[feedUrl].entries[entryId][propName] = propValue;
				contentStorage.set({feeds: feeds});
			});
			getFeedsFrom(stateStorage).then(function(feeds) {
				if (!feeds[feedUrl]) feeds[feedUrl] = {entries:{}};
				if (!feeds[feedUrl].entries[entryId]) feeds[feedUrl].entries[entryId] = {};
				feeds[feedUrl].entries[entryId][propName] = propValue;
				stateStorage.set({feeds: feeds}, function() {
					console.log('cloud storage updated');
				});
			});
		},


		/**
		 * Will first check cache and return it, then will continue to update the cache with fresh ajaxed in content
		 * @return {Object} Promise to be resolved with all feeds data from the local storage.
		 */
		getAll: function() {

		},


		/**
		 *
		 * @return {Promise} Promise to be resolved when all syncing is done.
		 */
		sync: function() {
			if (!syncInProgress) {
				syncInProgress = true;

				return $q.all([getFeedsFrom(contentStorage), getFeedsFrom(stateStorage)]).then(function(results) {

					return syncStorages(results[0], results[1]).then(function() {
						syncInProgress = false;
					});

				}, function() {
					syncInProgress = false;
				});
			}
		}
	}
});