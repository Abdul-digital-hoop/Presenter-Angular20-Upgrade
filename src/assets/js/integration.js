const urlParams = new URLSearchParams(window.location.search);
const queryStringValue = urlParams.get('integration_medium');
var _IntegrationMediumGSlides = false;
var _initializeOfficeObjects = false;
var _IntegrationMediumOffice = false;
var _IntegrationMediumZoom = false;
var _ZoomContextValue=false;
async function  configureZoomApp() {
    if (typeof zoomSdk !== 'undefined') {
      const configResponse = await zoomSdk.config({
      version: "0.16",
      popoutSize: { width: 480, height: 360 },
      capabilities: ["shareApp","onShareApp","launchAppInMeeting",
      "getRunningContext","openUrl","onRunningContextChange","onCollaborateChange",
      "getMeetingUUID","getMeetingContext","getUserContext","startCollaborate","onShareapp","sendAppInvitationToAllParticipants",
      "onMeeting","onMessage","onConnect","postMessage","connect","runRenderingContext","joinCollaborate"],
      });
      const runningContextValue = configResponse['runningContext'];
      localStorage.setItem("contextValue", runningContextValue);

    }
}
if(queryStringValue){
     localStorage.setItem('integration_medium', queryStringValue);  
 }
 if (localStorage.getItem("integration_medium") && localStorage.getItem("integration_medium") == "powerpoint"){
     var scriptElement = document.createElement('script');
     scriptElement.setAttribute('preload', '');
     scriptElement.src = 'https://appsforoffice.microsoft.com/lib/1/hosted/office.js';
     scriptElement.type = 'text/javascript';
     document.head.appendChild(scriptElement);
     scriptElement.onload = function () {
        _initializeOfficeObjects = true;
    };
    _IntegrationMediumOffice = true;
 }
 if (localStorage.getItem("integration_medium") && localStorage.getItem("integration_medium") == "zoom"){
    var scriptElement = document.createElement('script');
    scriptElement.setAttribute('preload', '');
    scriptElement.src = 'https://appssdk.zoom.us/sdk.js';
    scriptElement.type = 'text/javascript';
    document.head.appendChild(scriptElement);
    scriptElement.onload = function () {
       _initializeZoomObjects = true;
       configureZoomApp();
   };
   _IntegrationMediumZoom  = true;
   _ZoomContextValue=true;
}
if (queryStringValue == "googleslides") {
    _IntegrationMediumGSlides = true;
}

