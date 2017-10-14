(function () {
    'use strict';
    let app = angular.module("VidSub.player", ['ngRoute', 'ngSanitize', 'ngMaterial']);
    app.filter("trustUrl", ['$sce', function ($sce) {
        return function (recordingUrl) {
            return $sce.trustAsResourceUrl(recordingUrl);
        };
    }]);
    app.controller("PlayerCtrl", ['$scope', '$mdSidenav', '$compile', '$mdDialog', function ($scope, $mdSidenav, $compile, $mdDialog) {
        const ipc = require('electron').ipcRenderer;
        const { dialog } = require('electron').remote;
        const mainWindow = require('electron').remote.getCurrentWindow();
        $scope.videoSelected = "";
        $scope.subtitleSelected = "";
        $scope.wordSelected = "";
        $scope.currentMode = 'normal-mode';
        const searchBaseURL = "https://www.bing.com/search?q=";
        $scope.searchURL = "";
        var $video = document.querySelector('video');
        var $subDiv = document.querySelector('.subtitles-container .subtitles');
        $scope.subtitlesHTML = '';

        $video.onerror = function () {
            dialog.showMessageBox(mainWindow, {
                type: "error",
                title: "Can't Play",
                message: "Some error occured while playing the video. Please check the video and its format.",
                buttons: ["CLOSE"]
            });
        };


        $('.subtitles-container .subtitles').on('click', '.subtitle-word', function (event) {
            $video.pause();
            $mdSidenav("meaning-sidebar-right").toggle();
            $scope.wordSelected = event.target.innerText;
            $scope.searchURL = searchBaseURL + "define " + event.target.innerText;
        });
        $mdSidenav("meaning-sidebar-right", true).then(function (instance) {
            $mdSidenav("meaning-sidebar-right").onClose(function () {
                $video.play();
            });
        });

        function showSubtitleInDiv() {
            var track = $video.textTracks[0];
            track.mode = 'hidden';
            $video.controls = true;
            track.oncuechange = function (e) {
                var cue = this.activeCues[0];
                if (cue) {
                    $scope.subtitlesHTML = cue.text.replace(/\b(\w+?)\b/g, '<span class="subtitle-word">$1</span>');
                    // $subDiv.appendChild(cue.getCueAsHTML());
                    // $subDiv.appendChild(cue.text);
                    $scope.$apply();
                }
            };
        }

        ipc.on('video-file-selected', function (event, arg) {
            console.log("file selected", arg);
            if (arg.length) {
                $scope.videoSelected = arg;
                $scope.$apply();
            }
        });
        //Open the about developer Dialog
        ipc.on('open-about-developer', function (event, arg) {
            console.log("opened about developer dialog");
            $mdDialog.show(
                $mdDialog.alert({
                    templateUrl: 'player/about-developer.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true
                })
            )
        });
        //Event when subtitle file is selected
        ipc.on('subtitles-file-selected', function (event, arg) {
            console.log("Subtitle file selected", arg);
            if (arg.length) {
                $scope.subtitleSelected = arg;
                $scope.$apply();
                showSubtitleInDiv();
            }
        }); ipc.on('remove-subtitles', function (event, arg) {
            console.log("Remove current subtiles if present");
            $scope.subtitleSelected = null;
            $scope.$apply();
        });
        /**
         * Attach window event for play or pause on space button click
         */
        window.addEventListener('keyup', function (event) {
            if (event.code === 'Space') {
                if ($video.currentSrc && $video.currentTime > 0) {
                    $video.paused ? $video.play() : $video.pause();
                }
            }
        });
        /**
         * Check for full screen 
         * only check for webkitfullscreenchange
        */
        $($video).on('webkitfullscreenchange', function (e) {
            $scope.currentMode = $video.webkitDisplayingFullscreen ? 'full-screen-mode' : 'normal-mode';
            var track = $video.textTracks[0];
            track.mode = 'hidden';
            $video.controls = true;
            $scope.$apply();
        });


        $scope.videoDropHandler = function (event) {
            var track = $video.textTracks[0];
            track.mode = 'hidden';
            $video.controls = true;
            $scope.videoSelected = event.dataTransfer.files.length ? event.dataTransfer.files[0].path : null;
            $scope.$apply();
            event.preventDefault();
        };
        $scope.videoDragOverHandler = function (event) {
            event.preventDefault();
            console.log("file drag stopped");
        };

    }]);
    app.config(['$routeProvider', function ($routeProvider) {

        $routeProvider
            .when("/player", {
                templateUrl: "player/player.html",
                controller: 'PlayerCtrl'

            });
    }]);


})();

