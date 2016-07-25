angular.module('tidepoolsServices')
	.factory('dialogs', ['$rootScope', '$compile', 'contest',
		function($rootScope, $compile, contest) {
			var dialogs = {
				dialogTemplate: null
			} //used to manage different popup dialogs and modals

			dialogs.showDialog = function(name) {
				dialogs.template = 'components/dialogs/' + name;
				dialogs.show = true;
			}

			dialogs.close = function($event) {
				if($event.target.className.indexOf('dialog-bg')>-1 || $event.target.className.indexOf('closeElement')>-1){ 
					dialogs.show = false;
					// contest.close(new Date); // DEPRACATED for wtgt contest
				}
			}

			return dialogs;
		}]);