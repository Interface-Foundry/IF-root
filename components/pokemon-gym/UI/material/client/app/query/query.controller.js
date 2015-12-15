(function () {
    'use strict';

    angular.module('app.query')
        .controller('QueryCtrl', ['$scope', '$filter', '$http',QueryCtrl]);

    function QueryCtrl($scope, $filter, $http) {



      // the response will be: {
      //   elasticsearchQuery: {a big document},
      //   results: [{
      //     elasticsearchDoc: {},
      //     mongoDoc: {}
      //   }]
      // }

        var init;

        $scope.stores = [];
        $scope.searchKeywords = '';
        $scope.filteredStores = [];
        $scope.row = '';
        $scope.select = select;
        $scope.onFilterChange = onFilterChange;
        $scope.onNumPerPageChange = onNumPerPageChange;
        $scope.onOrderChange = onOrderChange;
        $scope.search = search;
        $scope.order = order;
        $scope.numPerPageOpt = [3, 5, 10, 20];
        $scope.numPerPage = $scope.numPerPageOpt[2];
        $scope.currentPage = 1;
        $scope.currentPage = [];

        $scope.radius = 5;

    $scope.searchItems = function() {

        $scope.results;

        if (!$scope.query){
          $scope.query = 'null';
        }
        if (!$scope.userLat || !$scope.userLng){
          $scope.userLat = 40.739432799999996;
          $scope.userLng = -73.9891253;
        }
        if (!$scope.radius){
          $scope.radius = 5;
        }

        $http.post('http://pikachu.kipapp.co:9999/query', {
            text: $scope.query,
            loc: {
                lat: $scope.userLat,
                lon: $scope.userLng
            },
            radius: $scope.radius,
        }).then(function(res) {

          $scope.results = res.data;

          console.log(res.data)

        }); 
    }
        // $http.post('/query',data).
        // then(function(res) {        
        //     console.log(res);

        //     // for (var i = 0; i < res.data.length; i++) {
        //     //     var marker = L.marker(new L.LatLng(res.data[i].lat, res.data[i].lng), {
        //     //         icon: L.mapbox.marker.icon({'marker-symbol': 'post', 'marker-color': '0044FF'}),
        //     //         title: res.data[i].name
        //     //     });
        //     //     marker.bindPopup('<p>'+res.data[i].name+'<br>Item Id: '+res.data[i].item_id+'<br>Parent Id: '+res.data[i].parent_id+'</p>');
        //     //     $scope.markers.addLayer(marker);
        //     // }

        //     // $scope.itemCount = res.data.length;
        //     // map.addLayer($scope.markers);
        //     // $scope.loading = false;

        // });




        //get loc from GPS
        $scope.getGPSLocation = function() {

            $scope.loadingLoc = true;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            } else {
                console.log('no geolocation support');
            }
        }

        function showPosition(position) {
            console.log(position);
            $scope.userLat = position.coords.latitude;
            $scope.userLng = position.coords.longitude;
            $scope.loadingLoc = false;
            $scope.$apply();
        }



        $scope.timestamp = "2015-11-16T20:00:55.395Z";
        $scope.servhost = "audax";
        $scope.ips = "en0: 192.168.1.20";
        $scope.drives = [{
          "mount_point": "/",
          "total": "120G",
          "free": "23G"    
        }];
        $scope.cpu = [
            {
              "percent": 2.1,
              "command": "/usr/sbin/coreaudiod"
            },
            {
              "percent": 2,
              "command": "/Applications/MuseScore 2.app/Contents/MacOS/mscore"
            },
            {
              "percent": 2,
              "command": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome -psn_0_1704352"
            },
            {
              "percent": 1.9,
              "command": "/Applications/iTerm.app/Contents/MacOS/iTerm -psn_0_1700255"
            },
            {
              "percent": 1,
              "command": "/Applications/Google Chrome.app/Contents/Versions/46.0.2490.86/Google Chrome Helper NP.app/Contents/MacOS/Google Chrome Helper NP --type=nacl-loader --channel=1924.12.718305278"
            },
            {
              "percent": 0.8,
              "command": "/System/Library/Frameworks/ApplicationServices.framework/Frameworks/CoreGraphics.framework/Resources/WindowServer -daemon"
            },
            {
              "percent": 0.5,
              "command": "/Applications/Google Chrome.app/Contents/Versions/46.0.2490.86/Google Chrome Helper.app/Contents/MacOS/Google Chrome Helper --type=renderer --lang=en-US --force-fieldtrials=*AffiliationBasedMatching/Enabled/AppBannerTriggering/Aggressive/AudioProcessing48kHzSupport/Default/*AutofillClassifier/Enabled/CaptivePortalInterstitial/Enabled/*ChildAccountDetection/Disabled/ChromeDashboard/Default/ChromotingQUIC/Disabled/*ClientSideDetectionModel/Model0/*DomRel-Enable/enable/*EmbeddedSearch/Group1 pct:10a stable:pp2 prefetch_results:1 reuse_instant_search_base_page:1/EnableGoogleCachedCopyTextExperiment/Button/*EnhancedBookmarks/Default/*ExtensionContentVerification/Enforce/*ExtensionDeveloperModeWarning/Default/*ExtensionInstallVerification/Enforce/*FlashHardwareVideoDecode/HwVideo/*GoogleNow/Enable/InstanceID/Enabled/*IntelligentSessionRestore/Enabled2/*NewProfileManagement/Enabled/*NewVideoRendererTrial/Enabled/*OmniboxBundledExperimentV1/Stable_EthersuggestPrefix_A4/*PasswordGeneration/Disabled/PasswordLinkInSettings/Enabled/*PasswordManagerUI/Infobar/*PrerenderFromOmnibox/OmniboxPrerenderEnabled/*QUIC/EnabledNoId/ReportCertificateErrors/ShowAndPossiblySend/SHA1IdentityUIWarning/Enabled/SHA1ToolbarUIJanuary2016/Warning/SHA1ToolbarUIJanuary2017/Error/*SafeBrowsingIncidentReportingService/Default/SafeBrowsingReportPhishingErrorLink/Disabled/SafeBrowsingSocialEngineeringStrings/Enabled/*SdchPersistence/Enabled/SessionRestoreBackgroundLoading/Restore/*SlimmingPaint/EnableSlimmingPaint/SyncBackingDatabase32K/Enabled/*UMA-Dynamic-Binary-Uniformity-Trial/default/*UMA-Dynamic-Uniformity-Trial/Group6/*UMA-Population-Restrict/normal/*UMA-Uniformity-Trial-100-Percent/group_01/*UMA-Uniformity-Trial-20-Percent/default/*UMA-Uniformity-Trial-50-Percent/group_01/*UseDelayAgnosticAEC/DefaultEnabled/*VarationsServiceControl/Interval_30min/VoiceTrigger/Install/ --extension-process --enable-webrtc-hw-h264-encoding --enable-offline-auto-reload --enable-offline-auto-reload-visible-only --enable-delegated-renderer --num-raster-threads=2 --content-image-texture-target=3553,3553,3553,3553,3553,34037,3553,3553,3553,34037,3553,34037 --video-image-texture-target=34037 --channel=1924.266.141916612"
            },
            {
              "percent": 0.5,
              "command": "/Applications/Google Chrome.app/Contents/Versions/46.0.2490.86/Google Chrome Helper.app/Contents/MacOS/Google Chrome Helper --type=renderer --lang=en-US --force-fieldtrials=*AffiliationBasedMatching/Enabled/AppBannerTriggering/Aggressive/AudioProcessing48kHzSupport/Default/*AutofillClassifier/Enabled/CaptivePortalInterstitial/Enabled/*ChildAccountDetection/Disabled/ChromeDashboard/Default/ChromotingQUIC/Disabled/*ClientSideDetectionModel/Model0/*DomRel-Enable/enable/*EmbeddedSearch/Group1 pct:10a stable:pp2 prefetch_results:1 reuse_instant_search_base_page:1/EnableGoogleCachedCopyTextExperiment/Button/*EnhancedBookmarks/Default/*ExtensionContentVerification/Enforce/*ExtensionDeveloperModeWarning/Default/*ExtensionInstallVerification/Enforce/FlashHardwareVideoDecode/HwVideo/*GoogleNow/Enable/InstanceID/Enabled/*IntelligentSessionRestore/Enabled2/*NewProfileManagement/Enabled/NewVideoRendererTrial/Enabled/*OmniboxBundledExperimentV1/Stable_EthersuggestPrefix_A4/*PasswordGeneration/Disabled/PasswordLinkInSettings/Enabled/PasswordManagerUI/Infobar/PrerenderFromOmnibox/OmniboxPrerenderEnabled/*QUIC/EnabledNoId/ReportCertificateErrors/ShowAndPossiblySend/SHA1IdentityUIWarning/Enabled/SHA1ToolbarUIJanuary2016/Warning/SHA1ToolbarUIJanuary2017/Error/*SafeBrowsingIncidentReportingService/Default/SafeBrowsingReportPhishingErrorLink/Disabled/SafeBrowsingSocialEngineeringStrings/Enabled/*SdchPersistence/Enabled/SessionRestoreBackgroundLoading/Restore/*SlimmingPaint/EnableSlimmingPaint/SyncBackingDatabase32K/Enabled/*UMA-Dynamic-Binary-Uniformity-Trial/default/*UMA-Dynamic-Uniformity-Trial/Group6/*UMA-Population-Restrict/normal/*UMA-Uniformity-Trial-100-Percent/group_01/*UMA-Uniformity-Trial-20-Percent/default/*UMA-Uniformity-Trial-50-Percent/group_01/*UseDelayAgnosticAEC/DefaultEnabled/*VarationsServiceControl/Interval_30min/VoiceTrigger/Install/ --extension-process --enable-webrtc-hw-h264-encoding --enable-offline-auto-reload --enable-offline-auto-reload-visible-only --enable-delegated-renderer --num-raster-threads=2 --content-image-texture-target=3553,3553,3553,3553,3553,34037,3553,3553,3553,34037,3553,34037 --video-image-texture-target=34037 --channel=1924.10.1527474361"
            }
        ];
        $scope.mem = [
            {
              "percent": 3.4,
              "command": "/Applications/Google Chrome.app/Contents/Versions/46.0.2490.86/Google Chrome Helper.app/Contents/MacOS/Google Chrome Helper --type=renderer --lang=en-US --force-fieldtrials=*AffiliationBasedMatching/Enabled/AppBannerTriggering/Aggressive/AudioProcessing48kHzSupport/Default/*AutofillClassifier/Enabled/CaptivePortalInterstitial/Enabled/*ChildAccountDetection/Disabled/ChromeDashboard/Default/ChromotingQUIC/Disabled/*ClientSideDetectionModel/Model0/*DomRel-Enable/enable/*EmbeddedSearch/Group1 pct:10a stable:pp2 prefetch_results:1 reuse_instant_search_base_page:1/EnableGoogleCachedCopyTextExperiment/Button/*EnhancedBookmarks/Default/*ExtensionContentVerification/Enforce/*ExtensionDeveloperModeWarning/Default/*ExtensionInstallVerification/Enforce/*FlashHardwareVideoDecode/HwVideo/*GoogleNow/Enable/InstanceID/Enabled/*IntelligentSessionRestore/Enabled2/*NewProfileManagement/Enabled/*NewVideoRendererTrial/Enabled/*OmniboxBundledExperimentV1/Stable_EthersuggestPrefix_A4/*PasswordGeneration/Disabled/PasswordLinkInSettings/Enabled/*PasswordManagerUI/Infobar/*PrerenderFromOmnibox/OmniboxPrerenderEnabled/*QUIC/EnabledNoId/ReportCertificateErrors/ShowAndPossiblySend/SHA1IdentityUIWarning/Enabled/SHA1ToolbarUIJanuary2016/Warning/SHA1ToolbarUIJanuary2017/Error/*SafeBrowsingIncidentReportingService/Default/SafeBrowsingReportPhishingErrorLink/Disabled/SafeBrowsingSocialEngineeringStrings/Enabled/*SdchPersistence/Enabled/SessionRestoreBackgroundLoading/Restore/*SlimmingPaint/EnableSlimmingPaint/SyncBackingDatabase32K/Enabled/*UMA-Dynamic-Binary-Uniformity-Trial/default/*UMA-Dynamic-Uniformity-Trial/Group6/*UMA-Population-Restrict/normal/*UMA-Uniformity-Trial-100-Percent/group_01/*UMA-Uniformity-Trial-20-Percent/default/*UMA-Uniformity-Trial-50-Percent/group_01/*UseDelayAgnosticAEC/DefaultEnabled/*VarationsServiceControl/Interval_30min/VoiceTrigger/Install/ --extension-process --enable-webrtc-hw-h264-encoding --enable-offline-auto-reload --enable-offline-auto-reload-visible-only --enable-delegated-renderer --num-raster-threads=2 --content-image-texture-target=3553,3553,3553,3553,3553,34037,3553,3553,3553,34037,3553,34037 --video-image-texture-target=34037 --channel=1924.261.1773448711"
            },
            {
              "percent": 3.3,
              "command": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome -psn_0_1704352"
            },
            {
              "percent": 3.2,
              "command": "/Applications/Google Chrome.app/Contents/Versions/46.0.2490.86/Google Chrome Helper.app/Contents/MacOS/Google Chrome Helper --type=renderer --lang=en-US --force-fieldtrials=*AffiliationBasedMatching/Enabled/AppBannerTriggering/Aggressive/AudioProcessing48kHzSupport/Default/*AutofillClassifier/Enabled/CaptivePortalInterstitial/Enabled/*ChildAccountDetection/Disabled/ChromeDashboard/Default/ChromotingQUIC/Disabled/*ClientSideDetectionModel/Model0/*DomRel-Enable/enable/*EmbeddedSearch/Group1 pct:10a stable:pp2 prefetch_results:1 reuse_instant_search_base_page:1/EnableGoogleCachedCopyTextExperiment/Button/*EnhancedBookmarks/Default/*ExtensionContentVerification/Enforce/*ExtensionDeveloperModeWarning/Default/*ExtensionInstallVerification/Enforce/*FlashHardwareVideoDecode/HwVideo/*GoogleNow/Enable/InstanceID/Enabled/*IntelligentSessionRestore/Enabled2/*NewProfileManagement/Enabled/*NewVideoRendererTrial/Enabled/*OmniboxBundledExperimentV1/Stable_EthersuggestPrefix_A4/*PasswordGeneration/Disabled/PasswordLinkInSettings/Enabled/*PasswordManagerUI/Infobar/*PrerenderFromOmnibox/OmniboxPrerenderEnabled/*QUIC/EnabledNoId/ReportCertificateErrors/ShowAndPossiblySend/SHA1IdentityUIWarning/Enabled/SHA1ToolbarUIJanuary2016/Warning/SHA1ToolbarUIJanuary2017/Error/*SafeBrowsingIncidentReportingService/Default/SafeBrowsingReportPhishingErrorLink/Disabled/SafeBrowsingSocialEngineeringStrings/Enabled/*SdchPersistence/Enabled/SessionRestoreBackgroundLoading/Restore/*SlimmingPaint/EnableSlimmingPaint/SyncBackingDatabase32K/Enabled/*UMA-Dynamic-Binary-Uniformity-Trial/default/*UMA-Dynamic-Uniformity-Trial/Group6/*UMA-Population-Restrict/normal/*UMA-Uniformity-Trial-100-Percent/group_01/*UMA-Uniformity-Trial-20-Percent/default/*UMA-Uniformity-Trial-50-Percent/group_01/*UseDelayAgnosticAEC/DefaultEnabled/*VarationsServiceControl/Interval_30min/VoiceTrigger/Install/ --extension-process --enable-webrtc-hw-h264-encoding --enable-offline-auto-reload --enable-offline-auto-reload-visible-only --enable-delegated-renderer --num-raster-threads=2 --content-image-texture-target=3553,3553,3553,3553,3553,34037,3553,3553,3553,34037,3553,34037 --video-image-texture-target=34037 --channel=1924.266.141916612"
            },
            {
              "percent": 3.2,
              "command": "/Applications/Google Chrome.app/Contents/Versions/46.0.2490.86/Google Chrome Helper.app/Contents/MacOS/Google Chrome Helper --type=renderer --lang=en-US --force-fieldtrials=*AffiliationBasedMatching/Enabled/AppBannerTriggering/Aggressive/AudioProcessing48kHzSupport/Default/*AutofillClassifier/Enabled/CaptivePortalInterstitial/Enabled/*ChildAccountDetection/Disabled/ChromeDashboard/Default/ChromotingQUIC/Disabled/*ClientSideDetectionModel/Model0/*DomRel-Enable/enable/*EmbeddedSearch/Group1 pct:10a stable:pp2 prefetch_results:1 reuse_instant_search_base_page:1/EnableGoogleCachedCopyTextExperiment/Button/*EnhancedBookmarks/Default/*ExtensionContentVerification/Enforce/*ExtensionDeveloperModeWarning/Default/*ExtensionInstallVerification/Enforce/*FlashHardwareVideoDecode/HwVideo/*GoogleNow/Enable/InstanceID/Enabled/*IntelligentSessionRestore/Enabled2/*NewProfileManagement/Enabled/*NewVideoRendererTrial/Enabled/*OmniboxBundledExperimentV1/Stable_EthersuggestPrefix_A4/*PasswordGeneration/Disabled/PasswordLinkInSettings/Enabled/*PasswordManagerUI/Infobar/*PrerenderFromOmnibox/OmniboxPrerenderEnabled/*QUIC/EnabledNoId/ReportCertificateErrors/ShowAndPossiblySend/SHA1IdentityUIWarning/Enabled/SHA1ToolbarUIJanuary2016/Warning/SHA1ToolbarUIJanuary2017/Error/*SafeBrowsingIncidentReportingService/Default/SafeBrowsingReportPhishingErrorLink/Disabled/SafeBrowsingSocialEngineeringStrings/Enabled/*SdchPersistence/Enabled/SessionRestoreBackgroundLoading/Restore/*SlimmingPaint/EnableSlimmingPaint/SyncBackingDatabase32K/Enabled/*UMA-Dynamic-Binary-Uniformity-Trial/default/*UMA-Dynamic-Uniformity-Trial/Group6/*UMA-Population-Restrict/normal/*UMA-Uniformity-Trial-100-Percent/group_01/*UMA-Uniformity-Trial-20-Percent/default/*UMA-Uniformity-Trial-50-Percent/group_01/*UseDelayAgnosticAEC/DefaultEnabled/*VarationsServiceControl/Interval_30min/VoiceTrigger/Install/ --enable-offline-auto-reload --enable-offline-auto-reload-visible-only --enable-delegated-renderer --num-raster-threads=2 --content-image-texture-target=3553,3553,3553,3553,3553,34037,3553,3553,3553,34037,3553,34037 --video-image-texture-target=34037 --channel=1924.257.2046763170"
            },
            {
              "percent": 2.8,
              "command": "/Applications/Google Chrome.app/Contents/Versions/46.0.2490.86/Google Chrome Helper.app/Contents/MacOS/Google Chrome Helper --type=renderer --lang=en-US --force-fieldtrials=*AffiliationBasedMatching/Enabled/AppBannerTriggering/Aggressive/AudioProcessing48kHzSupport/Default/*AutofillClassifier/Enabled/CaptivePortalInterstitial/Enabled/*ChildAccountDetection/Disabled/ChromeDashboard/Default/ChromotingQUIC/Disabled/*ClientSideDetectionModel/Model0/*DomRel-Enable/enable/*EmbeddedSearch/Group1 pct:10a stable:pp2 prefetch_results:1 reuse_instant_search_base_page:1/EnableGoogleCachedCopyTextExperiment/Button/*EnhancedBookmarks/Default/*ExtensionContentVerification/Enforce/*ExtensionDeveloperModeWarning/Default/*ExtensionInstallVerification/Enforce/*FlashHardwareVideoDecode/HwVideo/*GoogleNow/Enable/InstanceID/Enabled/*IntelligentSessionRestore/Enabled2/*NewProfileManagement/Enabled/*NewVideoRendererTrial/Enabled/*OmniboxBundledExperimentV1/Stable_EthersuggestPrefix_A4/*PasswordGeneration/Disabled/PasswordLinkInSettings/Enabled/*PasswordManagerUI/Infobar/*PrerenderFromOmnibox/OmniboxPrerenderEnabled/*QUIC/EnabledNoId/ReportCertificateErrors/ShowAndPossiblySend/SHA1IdentityUIWarning/Enabled/SHA1ToolbarUIJanuary2016/Warning/SHA1ToolbarUIJanuary2017/Error/*SafeBrowsingIncidentReportingService/Default/SafeBrowsingReportPhishingErrorLink/Disabled/SafeBrowsingSocialEngineeringStrings/Enabled/*SdchPersistence/Enabled/SessionRestoreBackgroundLoading/Restore/*SlimmingPaint/EnableSlimmingPaint/SyncBackingDatabase32K/Enabled/*UMA-Dynamic-Binary-Uniformity-Trial/default/*UMA-Dynamic-Uniformity-Trial/Group6/*UMA-Population-Restrict/normal/*UMA-Uniformity-Trial-100-Percent/group_01/*UMA-Uniformity-Trial-20-Percent/default/*UMA-Uniformity-Trial-50-Percent/group_01/*UseDelayAgnosticAEC/DefaultEnabled/*VarationsServiceControl/Interval_30min/VoiceTrigger/Install/ --enable-offline-auto-reload --enable-offline-auto-reload-visible-only --enable-delegated-renderer --num-raster-threads=2 --content-image-texture-target=3553,3553,3553,3553,3553,34037,3553,3553,3553,34037,3553,34037 --video-image-texture-target=34037 --channel=1924.339.335967747"
            },
            {
              "percent": 2.8,
              "command": "/Applications/Google Chrome.app/Contents/Versions/46.0.2490.86/Google Chrome Helper.app/Contents/MacOS/Google Chrome Helper --type=renderer --lang=en-US --force-fieldtrials=*AffiliationBasedMatching/Enabled/AppBannerTriggering/Aggressive/AudioProcessing48kHzSupport/Default/*AutofillClassifier/Enabled/CaptivePortalInterstitial/Enabled/*ChildAccountDetection/Disabled/ChromeDashboard/Default/ChromotingQUIC/Disabled/*ClientSideDetectionModel/Model0/*DomRel-Enable/enable/*EmbeddedSearch/Group1 pct:10a stable:pp2 prefetch_results:1 reuse_instant_search_base_page:1/EnableGoogleCachedCopyTextExperiment/Button/*EnhancedBookmarks/Default/*ExtensionContentVerification/Enforce/*ExtensionDeveloperModeWarning/Default/*ExtensionInstallVerification/Enforce/*FlashHardwareVideoDecode/HwVideo/*GoogleNow/Enable/InstanceID/Enabled/*IntelligentSessionRestore/Enabled2/*NewProfileManagement/Enabled/*NewVideoRendererTrial/Enabled/*OmniboxBundledExperimentV1/Stable_EthersuggestPrefix_A4/*PasswordGeneration/Disabled/PasswordLinkInSettings/Enabled/*PasswordManagerUI/Infobar/*PrerenderFromOmnibox/OmniboxPrerenderEnabled/*QUIC/EnabledNoId/ReportCertificateErrors/ShowAndPossiblySend/SHA1IdentityUIWarning/Enabled/SHA1ToolbarUIJanuary2016/Warning/SHA1ToolbarUIJanuary2017/Error/*SafeBrowsingIncidentReportingService/Default/SafeBrowsingReportPhishingErrorLink/Disabled/SafeBrowsingSocialEngineeringStrings/Enabled/*SdchPersistence/Enabled/SessionRestoreBackgroundLoading/Restore/*SlimmingPaint/EnableSlimmingPaint/SyncBackingDatabase32K/Enabled/*UMA-Dynamic-Binary-Uniformity-Trial/default/*UMA-Dynamic-Uniformity-Trial/Group6/*UMA-Population-Restrict/normal/*UMA-Uniformity-Trial-100-Percent/group_01/*UMA-Uniformity-Trial-20-Percent/default/*UMA-Uniformity-Trial-50-Percent/group_01/*UseDelayAgnosticAEC/DefaultEnabled/*VarationsServiceControl/Interval_30min/VoiceTrigger/Install/ --enable-offline-auto-reload --enable-offline-auto-reload-visible-only --enable-delegated-renderer --num-raster-threads=2 --content-image-texture-target=3553,3553,3553,3553,3553,34037,3553,3553,3553,34037,3553,34037 --video-image-texture-target=34037 --channel=1924.313.256461449"
            },
            {
              "percent": 2.7,
              "command": "/Applications/Google Chrome.app/Contents/Versions/46.0.2490.86/Google Chrome Helper.app/Contents/MacOS/Google Chrome Helper --type=renderer --lang=en-US --force-fieldtrials=*AffiliationBasedMatching/Enabled/AppBannerTriggering/Aggressive/AudioProcessing48kHzSupport/Default/*AutofillClassifier/Enabled/CaptivePortalInterstitial/Enabled/*ChildAccountDetection/Disabled/ChromeDashboard/Default/ChromotingQUIC/Disabled/*ClientSideDetectionModel/Model0/*DomRel-Enable/enable/*EmbeddedSearch/Group1 pct:10a stable:pp2 prefetch_results:1 reuse_instant_search_base_page:1/EnableGoogleCachedCopyTextExperiment/Button/*EnhancedBookmarks/Default/*ExtensionContentVerification/Enforce/*ExtensionDeveloperModeWarning/Default/*ExtensionInstallVerification/Enforce/*FlashHardwareVideoDecode/HwVideo/*GoogleNow/Enable/InstanceID/Enabled/*IntelligentSessionRestore/Enabled2/*NewProfileManagement/Enabled/*NewVideoRendererTrial/Enabled/*OmniboxBundledExperimentV1/Stable_EthersuggestPrefix_A4/*PasswordGeneration/Disabled/PasswordLinkInSettings/Enabled/*PasswordManagerUI/Infobar/*PrerenderFromOmnibox/OmniboxPrerenderEnabled/*QUIC/EnabledNoId/ReportCertificateErrors/ShowAndPossiblySend/SHA1IdentityUIWarning/Enabled/SHA1ToolbarUIJanuary2016/Warning/SHA1ToolbarUIJanuary2017/Error/*SafeBrowsingIncidentReportingService/Default/SafeBrowsingReportPhishingErrorLink/Disabled/SafeBrowsingSocialEngineeringStrings/Enabled/*SdchPersistence/Enabled/SessionRestoreBackgroundLoading/Restore/*SlimmingPaint/EnableSlimmingPaint/SyncBackingDatabase32K/Enabled/*UMA-Dynamic-Binary-Uniformity-Trial/default/*UMA-Dynamic-Uniformity-Trial/Group6/*UMA-Population-Restrict/normal/*UMA-Uniformity-Trial-100-Percent/group_01/*UMA-Uniformity-Trial-20-Percent/default/*UMA-Uniformity-Trial-50-Percent/group_01/*UseDelayAgnosticAEC/DefaultEnabled/*VarationsServiceControl/Interval_30min/VoiceTrigger/Install/ --enable-offline-auto-reload --enable-offline-auto-reload-visible-only --enable-delegated-renderer --num-raster-threads=2 --content-image-texture-target=3553,3553,3553,3553,3553,34037,3553,3553,3553,34037,3553,34037 --video-image-texture-target=34037 --channel=1924.288.1181284327"
            },
            {
              "percent": 2.4,
              "command": "/Applications/Google Chrome.app/Contents/Versions/46.0.2490.86/Google Chrome Helper.app/Contents/MacOS/Google Chrome Helper --type=renderer --lang=en-US --force-fieldtrials=*AffiliationBasedMatching/Enabled/AppBannerTriggering/Aggressive/AudioProcessing48kHzSupport/Default/*AutofillClassifier/Enabled/CaptivePortalInterstitial/Enabled/*ChildAccountDetection/Disabled/ChromeDashboard/Default/ChromotingQUIC/Disabled/*ClientSideDetectionModel/Model0/*DomRel-Enable/enable/*EmbeddedSearch/Group1 pct:10a stable:pp2 prefetch_results:1 reuse_instant_search_base_page:1/EnableGoogleCachedCopyTextExperiment/Button/*EnhancedBookmarks/Default/*ExtensionContentVerification/Enforce/*ExtensionDeveloperModeWarning/Default/*ExtensionInstallVerification/Enforce/*FlashHardwareVideoDecode/HwVideo/*GoogleNow/Enable/InstanceID/Enabled/*IntelligentSessionRestore/Enabled2/*NewProfileManagement/Enabled/*NewVideoRendererTrial/Enabled/*OmniboxBundledExperimentV1/Stable_EthersuggestPrefix_A4/*PasswordGeneration/Disabled/PasswordLinkInSettings/Enabled/*PasswordManagerUI/Infobar/*PrerenderFromOmnibox/OmniboxPrerenderEnabled/*QUIC/EnabledNoId/ReportCertificateErrors/ShowAndPossiblySend/SHA1IdentityUIWarning/Enabled/SHA1ToolbarUIJanuary2016/Warning/SHA1ToolbarUIJanuary2017/Error/*SafeBrowsingIncidentReportingService/Default/SafeBrowsingReportPhishingErrorLink/Disabled/SafeBrowsingSocialEngineeringStrings/Enabled/*SdchPersistence/Enabled/SessionRestoreBackgroundLoading/Restore/*SlimmingPaint/EnableSlimmingPaint/SyncBackingDatabase32K/Enabled/*UMA-Dynamic-Binary-Uniformity-Trial/default/*UMA-Dynamic-Uniformity-Trial/Group6/*UMA-Population-Restrict/normal/*UMA-Uniformity-Trial-100-Percent/group_01/*UMA-Uniformity-Trial-20-Percent/default/*UMA-Uniformity-Trial-50-Percent/group_01/*UseDelayAgnosticAEC/DefaultEnabled/*VarationsServiceControl/Interval_30min/VoiceTrigger/Install/ --extension-process --enable-webrtc-hw-h264-encoding --enable-offline-auto-reload --enable-offline-auto-reload-visible-only --enable-delegated-renderer --num-raster-threads=2 --content-image-texture-target=3553,3553,3553,3553,3553,34037,3553,3553,3553,34037,3553,34037 --video-image-texture-target=34037 --channel=1924.262.921623663"
            },
            {
              "percent": 2.2,
              "command": "/Applications/MuseScore 2.app/Contents/MacOS/mscore"
            }
        ];


        ////
        $scope.stores = [
            {
            name: 'Nijiya sMarket',
            price: '$$',
            sales: 292,
            rating: 4.0
            }, {
            name: 'Eat On Monday Truck',
            price: '$',
            sales: 119,
            rating: 4.3
            }, {
            name: 'Tea Era',
            price: '$',
            sales: 874,
            rating: 4.0
            }, {
            name: 'Rogers Deli',
            price: '$',
            sales: 347,
            rating: 4.2
            }, {
            name: 'MoBowl',
            price: '$$$',
            sales: 24,
            rating: 4.6
            }, {
            name: 'The Milk Pail Market',
            price: '$',
            sales: 543,
            rating: 4.5
            }, {
            name: 'Nob Hill Foods',
            price: '$$',
            sales: 874,
            rating: 4.0
            }, {
            name: 'Scratch',
            price: '$$$',
            sales: 643,
            rating: 3.6
            }, {
            name: 'Gochi Japanese Fusion Tapas',
            price: '$$$',
            sales: 56,
            rating: 4.1
            }, {
            name: 'Cost Plus World Market',
            price: '$$',
            sales: 79,
            rating: 4.0
            }, {
            name: 'Bumble Bee Health Foods',
            price: '$$',
            sales: 43,
            rating: 4.3
            }, {
            name: 'Costco',
            price: '$$',
            sales: 219,
            rating: 3.6
            }, {
            name: 'Red Rock Coffee Co',
            price: '$',
            sales: 765,
            rating: 4.1
            }, {
            name: '99 Ranch Market',
            price: '$',
            sales: 181,
            rating: 3.4
            }, {
            name: 'Mi Pueblo Food Center',
            price: '$',
            sales: 78,
            rating: 4.0
            }, {
            name: 'Cucina Venti',
            price: '$$',
            sales: 163,
            rating: 3.3
            }, {
            name: 'Sufi Coffee Shop',
            price: '$',
            sales: 113,
            rating: 3.3
            }, {
            name: 'Dana Street Roasting',
            price: '$',
            sales: 316,
            rating: 4.1
            }, {
            name: 'Pearl Cafe',
            price: '$',
            sales: 173,
            rating: 3.4
            }, {
            name: 'Posh Bagel',
            price: '$',
            sales: 140,
            rating: 4.0
            }, {
            name: 'Artisan Wine Depot',
            price: '$$',
            sales: 26,
            rating: 4.1
            }, {
            name: 'Hong Kong Chinese Bakery',
            price: '$',
            sales: 182,
            rating: 3.4
            }, {
            name: 'Starbucks',
            price: '$$',
            sales: 97,
            rating: 3.7
            }, {
            name: 'Tapioca Express',
            price: '$',
            sales: 301,
            rating: 3.0
            }, {
            name: 'House of Bagels',
            price: '$',
            sales: 82,
            rating: 4.4
            }
        ];

        function select(page) {
            var end, start;
            start = (page - 1) * $scope.numPerPage;
            end = start + $scope.numPerPage;
            return $scope.currentPageStores = $scope.filteredStores.slice(start, end);
        };

        function onFilterChange() {
            $scope.select(1);
            $scope.currentPage = 1;
            return $scope.row = '';
        };

        function onNumPerPageChange() {
            $scope.select(1);
            return $scope.currentPage = 1;
        };

        function onOrderChange() {
            $scope.select(1);
            return $scope.currentPage = 1;
        };

        function search() {
            $scope.filteredStores = $filter('filter')($scope.stores, $scope.searchKeywords);
            return $scope.onFilterChange();
        };

        function order(rowName) {
            if ($scope.row === rowName) {
            return;
            }
            $scope.row = rowName;
            $scope.filteredStores = $filter('orderBy')($scope.stores, rowName);
            return $scope.onOrderChange();
        };

        init = function() {
            $scope.search();
            return $scope.select($scope.currentPage);
        };

        init();
    }

})(); 