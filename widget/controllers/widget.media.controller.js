(function (angular, window) {
    angular
        .module('mediaCenterWidget')
        .controller('WidgetMediaCtrl', ['$scope', '$window', 'AppConfig', 'Messaging', 'Buildfire', 'COLLECTIONS', 'media', 'EVENTS', '$timeout', "$sce", "DB", function ($scope, $window, AppConfig, Messaging, Buildfire, COLLECTIONS, media, EVENTS, $timeout, $sce, DB) {
            var WidgetMedia = this;
            WidgetMedia.API = null;
            var MediaCenter = new DB(COLLECTIONS.MediaCenter);
            WidgetMedia.onPlayerReady = function ($API) {
                WidgetMedia.API = $API;
            };

            WidgetMedia.videoPlayerConfig = {
                autoHide: false,
                preload: "none",
                sources: undefined,
                tracks: undefined,
                theme: {
                    url: "http://www.videogular.com/styles/themes/default/latest/videogular.css"
                }
            };
            WidgetMedia.changeVideoSrc = function () {
                if (WidgetMedia.item.data.videoUrl)
                    WidgetMedia.videoPlayerConfig.sources = [{
                        src: $sce.trustAsResourceUrl(WidgetMedia.item.data.videoUrl),
                        type: 'video/' + WidgetMedia.item.data.videoUrl.split('.').pop() //"video/mp4"
                    }];
            };
            if (AppConfig.getSettings()) {
                WidgetMedia.media = {
                    data: AppConfig.getSettings()
                };
            }
            else {
                MediaCenter.get().then(function (data) {
                    WidgetMedia.media = {
                        data: data.data
                    };
                    console.log('Get Info---', data, 'data---');
                }, function (err) {
                    WidgetMedia.media = {
                        data: {}
                    };
                    console.log('Get Error---', err);
                });
            }


            WidgetMedia.sourceChanged = function ($source) {
                WidgetMedia.API.stop();
            };

            WidgetMedia.item = {
                data: {
                    audioUrl: "",
                    body: "",
                    bodyHTML: "",
                    deepLinkUrl: "",
                    image: "",
                    links: [],
                    srcUrl: "",
                    summary: "",
                    title: "",
                    topImage: "",
                    videoUrl: ""
                }
            };
            if (media) {
                WidgetMedia.item = media;
                console.log('initial', WidgetMedia.item);
                WidgetMedia.changeVideoSrc();
            }

            if (WidgetMedia.media && WidgetMedia.media.data && WidgetMedia.media.data.design && WidgetMedia.media.data.design.backgroundImage)
                AppConfig.changeBackgroundTheme(WidgetMedia.media.data.design.backgroundImage);
            Messaging.onReceivedMessage(function (event) {
                if (event) {
                    switch (event.name) {
                        case EVENTS.ROUTE_CHANGE:
                            var path = event.message.path,
                                id = event.message.id;
                            var url = "#/";
                            switch (path) {
                                case PATHS.MEDIA:
                                    url = url + "media";
                                    if (id) {
                                        url = url + "/" + id;
                                    }
                                    break
                                default :

                                    break
                            }
                            Location.go("#/media");
                            break;
                    }
                }
            });
            WidgetMedia.onUpdateFn = Buildfire.datastore.onUpdate(function (event) {
                switch (event.tag) {
                    case COLLECTIONS.MediaContent:
                        if (event.data) {
                            WidgetMedia.item = event;
                            console.log('change', WidgetMedia.item);
                            $scope.$digest();
                        }
                        break;
                    case COLLECTIONS.MediaCenter:
                        WidgetMedia.media.data.design.itemLayout = event.data.design.itemLayout;

                        break;
                }
            });
            var initializing = true;
            $scope.$watch(function () {
                return WidgetMedia.item.data.videoUrl;
            }, function () {
                if (initializing) {
                    $timeout(function () {
                        initializing = false;
                    });
                } else {
                    WidgetMedia.changeVideoSrc();
                }
            });
            $scope.$on("$destroy", function () {
                WidgetMedia.onUpdateFn.clear();
            });
        }]);
})(window.angular, window);