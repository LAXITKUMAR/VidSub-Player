(function () {
    'use strict';
    let vidSub = angular.module("VidSub", ['ngRoute', "VidSub.player"]);

    vidSub.config(['$routeProvider', function ($routeProvider) {

        $routeProvider
            .otherwise({ redirectTo: '/player' });
    }]);

})();

