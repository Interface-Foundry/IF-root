app.factory('alertManager', ['$timeout', function ($timeout) {
   		var alerts = {
   			'list':[ 
	   			//@IFDEF WEB
	   			{msg: 'Try Bubbl.li on iOS to get access to iBeacons and more! <strong>Click here</strong>!', id: 'testflightapp', href: '
http://www.testflightapp.com/install/f9cd284ebf67e62965cf79f4667180fa-MTQwNTM3MTQ/'}
	   			//@ENDIF
   			]
   		};

   		alerts.addAlert = function(alertType, alertMsg, timeout) {
   			var alertClass;
   			switch (alertType) {
	   			case 'success':
	   				alertClass = 'alert-success';
	   				break;
	   			case 'info':
	   				alertClass = 'alert-info';
	   				break;
	   			case 'warning':
	   				alertClass = 'alert-warning';
	   				break;
	   			case 'danger': 
	   				alertClass = 'alert-danger';
	   				break;
   			}
   			var len = alerts.list.push(
 {class: alertClass, msg: alertMsg, id: alertMsg});
   			if (timeout) {
   			$timeout(function () {
	   			alerts.list.splice(len-1, 1);
   			}, 1500);
   			
   			}
   		}

   		alerts.closeAlert = function(index) {
   			alerts.list.splice(index, 1);
   		}
   		
   		alerts.notify = function(alert) {
	   		alerts.list.push(alert); 
   		}

   		return alerts;
   }])