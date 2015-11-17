(function () {
    'use strict';

    angular.module('app', [
        // Core modules
         'app.core'
        // Custom Feature modules
        ,'app.chart'
        ,'app.ui'
        ,'app.ui.form'
        ,'app.ui.form.validation'
        ,'app.ui.map'
        ,'app.page'
        ,'app.table'
        ,'app.status'
        ,'app.query'
        ,'app.errors'
        
        // 3rd party feature modules
        ,'easypiechart'
        ,'ui.tree'
        ,'ngMap'
        ,'textAngular'
    ]);

})();

