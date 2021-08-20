//////////////////////////////////////////////////////////////////////////
//									    
// 	CHROME EXTENSION: CUSTODIET					
//	CREATED BY:	      GREG PAYE	
//	DATE(DD-MM-YY):   09-07-2021					
//	DESCRIPTION:	    REAL TIME VISUAL UPDATE ON A SERVER'S STATUS	
//                    ON YOUR CHROME BROWSER
//									
//////////////////////////////////////////////////////////////////////////
//  FUNCTIONALITY:    AFTER INSTALLATION, THE EXTENSION CHECKS THE URL
//                    AND SETS ITS ICON DEPENDING ON THE SERVER STATUS
//                    RESULT FROM THE URL: GREEN FOR UP, RED FOR DOWN.
//                    IT SETS UP AN ALARM WHICH WILL CHECK THAT URL 
//                    AGAIN IN HOWEVER MANY MINUTES YOU CONFIGURE IT 
//                    TO HERE. WHEN THE ALARM REACHES THE WAIT TIME,
//                    IT GETS THE SERVER STATUS FROM THE URL, CHANGES
//                    THE ICON, THEN RESETS THE ALARM TO REPEAT AGAIN.
//
//////////////////////////////////////////////////////////////////////////
//									
//	CONFIGURED GLOBAL VARIABLES				
//									
//////////////////////////////////////////////////////////////////////////
const URL_SERVER	  = process.env.SERVER_URL_BEING_MONITORED;
const PATH_ICON_RED 	  = process.env.SERVER_MONITOR_ICON_RED;
const PATH_ICON_GREEN 	  = process.env.SERVER_MONITOR_ICON_GREEN;
const STRING_ALARM_NAME	  = process.env.EXTENSION_ALARM_NAME;  
const PING_SERVER_MINUTES = process.env.EXTENSION_ALARM_INTERVAL_MINUTES; 
//////////////////////////////////////////////////////////////////////////
//									
//	FUNCTIONS						
//									
//////////////////////////////////////////////////////////////////////////
//
// using fetch to get the JSON of the server's status from the URL
//
async function getServerStatusJsonAsText() {
	return await window.fetch(URL_SERVER)
	.then(response => {
		if (!response.ok) {
      			throw new Error('error: unable to fetch from: '+URL_SERVER);
    		}
    		return response.text();
  	})
};
//
//parse what was fetch'ed from the URL_SERVER
//in the base example, we are looking for: "status"
//then returning the JSON pair: "status":1  (or 0 if down)
//
async function getServerStatus() {
	let returntext = await getServerStatusJsonAsText();
	console.log('fetch returned: '+returntext);
  var status = 'error: getServerStatus';
  var foundStatus = returntext.indexOf('\"status\":');
  if ( foundStatus > -1) {
	  status = returntext.substr(foundStatus+9, 1);
  }
	return status;
};
//
//get the tab object you are on right now
//needed by setIcon(path) function
//
async function getCurrentTab() {
	return chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
  		console.log('get tab');
		return tabs[0];
	});
};
//
//stop the alarm, start a new one
//
function resetAlarm() {
	chrome.alarms.clear(process.env.EXTENSION_ALARM_NAME);
	chrome.alarms.create(process.env.EXTENSION_ALARM_NAME, 
                       { periodInMinutes: process.env.EXTENSION_ALARM_INTERVAL_MINUTES });
	console.log('Done: resetAlarm');
};
//
//When the user of the extension mouses over the icon, 
//a time stamp will show the last time the URL_SERVER
//was checked. This function parses the time and makes
//it more user-friendly, returning standard AM/PM time
//
async function howSoonIsNow() {
	var returnHowSoonIsNow;
	var d = new Date();
	var nowHour = d.getHours();
	var nowMinutes = d.getMinutes();
	if (nowMinutes < 10)
		nowMinutes = "0" + nowMinutes;
	var ampm;
	if (nowHour > 11) {
		ampm = "PM";
	}
	if (nowHour > 12) {
		nowHour = nowHour - 12;
	} else {
		ampm = "AM";
	}
	returnHowSoonIsNow = nowHour + ":" + nowMinutes + " " + ampm;
	return returnHowSoonIsNow;
};
//
//check the status of the server
//set the extension icon based on server status
//set the title of extension (mouseover text)
//to show when the status was last checked
//
async function setExtensionIcon(){
	let status = await getServerStatus();
	var iconPath = '';
	if (status == 0)
		iconPath = PATH_ICON_RED;
	else
		iconPath = PATH_ICON_GREEN;
	thisTab = getCurrentTab();
	chrome.browserAction.setIcon({
    path: iconPath,
    tabId: thisTab.id
  });
  var time = await howSoonIsNow();
	chrome.browserAction.setTitle({title: `last updated: `+time});
};
//////////////////////////////////////////////////////////////////////////
//									
//	      EVENT HANDLERS							
//									
//////////////////////////////////////////////////////////////////////////
//
//when extension is installed, check coders status and 
//set up an alarm to check again in one minute
//
chrome.runtime.onInstalled.addListener(async function() {
	console.log('installed listener');
	var time = await howSoonIsNow();
	chrome.browserAction.setTitle({title: `last updated: `+time});
	getServerStatus();
	resetAlarm();
});
//
//when extension (via browser) starts, check coders status and 
//set up an alarm to check again in one minute
//
chrome.runtime.onStartup.addListener(async function() {
	console.log('startup listener');
	setExtensionIcon();
	resetAlarm();
});
//
//when the alarm sounds, re-do the check, reset the alarm
//
chrome.alarms.onAlarm.addListener(async function(alarm) {
	console.log('alarm addlistener');
	if (alarm && alarm.name === process.env.EXTENSION_ALARM_NAME) {
		setExtensionIcon();
		resetAlarm();
	};
});
//
//clicking the icon checks the server status and
//resets the alarm
//
chrome.browserAction.onClicked.addListener(async function(tab) {
	console.log('onclicked listener');
	setExtensionIcon();
	resetAlarm();
});
//////////////////////////////////////////////////////////////////////////
//								
//        END OF FILE
//
//////////////////////////////////////////////////////////////////////////

