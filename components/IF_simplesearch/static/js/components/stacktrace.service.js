// from http://www.bennadel.com/blog/2542-logging-client-side-errors-with-angularjs-and-stacktrace-js.htm

simpleSearchApp.factory(
    "stacktraceService",
    function() {
        // "printStackTrace" is a global object.
        return({
            get: StackTrace.fromError.bind(StackTrace)
        });
    }
);

simpleSearchApp.provider(
    "$exceptionHandler",
    {
        $get: function( errorLogService ) {
            return( errorLogService );
        }
    }
);

simpleSearchApp.factory(
    "errorLogService",
    function( $log, $window, stacktraceService ) {
        // I log the given error to the remote server.
        function log( exception, cause ) {
            // Pass off the error to the default error handler
            // on the AngualrJS logger. This will output the
            // error to the console (and let the application
            // keep running normally for the user).
            $log.error.apply( $log, arguments );
            // Now, we need to try and log the error the server.
            // --
            // NOTE: In production, I have some debouncing
            // logic here to prevent the same client from
            // logging the same error over and over again! All
            // that would do is add noise to the log.
            try {
              debugger;
                var errorMessage = exception.toString();
                stacktraceService.get(exception).then(function(stack) {
                  var stringifiedStack = stack.map(function(sf) {
                    return sf.toString();
                  }).join('\n');
                  // Log the JavaScript error to the server.
                  // --
                  // NOTE: In this demo, the POST URL doesn't
                  // exists and will simply return a 404.
                  $.ajax({
                      type: "POST",
                      url: "https://kipapp.co/styles/api/logging/error",
                      contentType: "application/json",
                      data: angular.toJson({
                          errorUrl: $window.location.href,
                          errorMessage: errorMessage,
                          stackTrace: stringifiedStack,
                          cause: ( cause || "" )
                      })
                  });
                })
            } catch ( loggingError ) {
                // For Developers - log the log-failure.
                $log.warn( "Error logging failed" );
                $log.log( loggingError );
            }
        }
        // Return the logging function.
        return( log );
    }
);
