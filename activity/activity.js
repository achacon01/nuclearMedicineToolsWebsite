/*
    User License Agreement

    This code and associated data were created by Andrew Chacon and Graeme O'Keefe (the "Creators"). 
    By using this code and associated data (the "Software"), you agree to the following terms:

    1. The Software is provided "as is", without warranty of any kind, express or implied, including but not limited to 
       the warranties of merchantability, fitness for a particular purpose, and non-infringement. In no event shall the 
       Creator be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, 
       arising from, out of, or in connection with the Software or the use or other dealings in the Software.

    2. The Software is intended for non-clinical use only. The Creator does not provide any guarantees or assurances 
       regarding the suitability of the Software for medical or clinical purposes. Users assume all responsibility for 
       any application of the Software in any setting.

    3. Redistribution and use of the Software, with or without modification, are permitted provided that the following 
       conditions are met:
       - The above copyright notice and this permission notice shall be included in all copies or substantial portions 
         of the Software.
       - Proper attribution to the Creator must be provided in all derivative works or reproductions.

    4. The Creator reserves the right to modify or discontinue the Software at any time without prior notice.

    5. Any disputes arising from the use of the Software shall be governed by and construed in accordance with the laws 
       of Australia.

    © 2024 Andrew Chacon and Graeme O'Keefe. All rights reserved.
*/

function resetBackgrounds()
{
    document.getElementById('resultsForm').style.display = 'block';
    document.getElementById('Message').style.display = 'none'; 

    document.getElementById('PreInjectedActivity').style.backgroundColor = 'rgba(255, 0, 0, 0)';
    document.getElementById('PreInjectedTime').style.backgroundColor = 'rgba(255, 0, 0, 0)';

    document.getElementById('PostInjectedActivity').style.backgroundColor = 'rgba(255, 0, 0, 0)';  
    document.getElementById('PostInjectedTime').style.backgroundColor = 'rgba(255, 0, 0, 0)';  

    document.getElementById('RefInjectedTime').style.backgroundColor = 'rgba(255, 0, 0, 0)';  
    document.getElementById('isotope').style.backgroundColor = 'rgba(255, 0, 0, 0)';

}

function clearData()
{
		
	document.getElementById('RefInjectedTime').value = "";
	document.getElementById('PreInjectedActivity').value = "";
	document.getElementById('PreInjectedTime').value = "";
	document.getElementById('PostInjectedActivity').value = "";
	document.getElementById('PostInjectedTime').value = "";
	
	document.getElementById('RefPreInjectedActivity').value = "";
	document.getElementById('RefPostInjectedActivity').value = "";
	document.getElementById('RefInjectedActivity').value = "";

	document.getElementById('Message').value = "";
	
	resetBackgrounds();
    document.getElementById('resultsForm').style.display = 'none';

	
}

 function onCalculateActivity() 
{
	resetBackgrounds()

  if(!validateActivity())
  {	  
	document.getElementById('resultsForm').style.display = 'none';
    document.getElementById('Message').style.display = 'block'; 
	
	return;
  }
  var halflife = halfLifeInMins(document.activityForm.isotope.value);

  document.activityForm.HalfLife.value = halflife.toFixed(2);
  var PreInjectedTime  = hhmm2min(document.activityForm.PreInjectedTime.value);
  var PostInjectedTime = hhmm2min(document.activityForm.PostInjectedTime.value);
  var RefInjectedTime  = hhmm2min(document.activityForm.RefInjectedTime.value);

  var PreInjectedActivity  = document.activityForm.PreInjectedActivity.value;
  var PostInjectedActivity = document.activityForm.PostInjectedActivity.value;

  var RefPreInjectedActivity  = PreInjectedActivity  * Math.pow(2.0, -(RefInjectedTime-PreInjectedTime)/halflife);
  var RefPostInjectedActivity = PostInjectedActivity * Math.pow(2.0, -(RefInjectedTime-PostInjectedTime)/halflife);
  var RefInjectedActivity     = RefPreInjectedActivity - RefPostInjectedActivity;

  document.resultsForm.RefPreInjectedActivity.value  = RefPreInjectedActivity.toFixed(2);
  document.resultsForm.RefPostInjectedActivity.value = RefPostInjectedActivity.toFixed(2);
  document.resultsForm.RefInjectedActivity.value     = RefInjectedActivity.toFixed(0);
}


function month2str(dt) { return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.getMonth()]; }
function date2str(dt)  { return dt.getDate().pad(2) + "-" + month2str(dt) + "-" + dt.getFullYear().pad(4); }
function time2str(dt)  { return dt.getHours().pad(2) + ":" + dt.getMinutes().pad(2) + ":" + dt.getSeconds().pad(2); }
function datetime2Date(datestr, timestr) {
  var dt = parseMyDate(datestr);

  var hh = 0, mm = 0, ss = 0;
  var p = timestr.split(':'), plen = p.length;
  if(plen >= 3) { ss = parseInt(p.pop(), 10); }
  if(plen >= 2) { mm = parseInt(p.pop(), 10); }
  if(plen >= 1) { hh = parseInt(p.pop(), 10); }

  dt.setSeconds(ss);
  dt.setMinutes(mm);
  dt.setHours(hh);

  return dt;
}

function hhmm2min(str) {
  var h = 0, m = 0;
  var p = str.split(' ');

  if(p[0].indexOf(':') < 0) {
    m = parseInt(p[0].substr(p[0].length - 2, p[0].length), 10);
    h = parseInt(p[0].substr(0, p[0].length - 2), 10);

  }
  else {
    var q = p[0].split(':'), qlen = q.length;
    if(qlen >= 2) { m = parseInt(q.pop(), 10); }
    if(qlen >= 1) { h = parseInt(q.pop(), 10); }

  }

  if(p.length == 2 && p[1].toUpperCase() == 'PM') { h += 12; }

//  document.decayForm.Message.value = "h = " + h + ", m = " + m;

  var mins = 60*h + m;
  if(!(mins >= 0 && mins <= 24*60)) return -1;

  return mins;
}

function validateActivity() {
  document.getElementById('Message').value = "";

  var isotope = document.activityForm.isotope.value;
  var PreInjectedTime  = hhmm2min(document.activityForm.PreInjectedTime.value);
  var PostInjectedTime = hhmm2min(document.activityForm.PostInjectedTime.value);
  var RefInjectedTime  = hhmm2min(document.activityForm.RefInjectedTime.value);

  document.activityForm.HalfLife.value = halfLifeInMins(isotope).toFixed(2);

  if(document.activityForm.PreInjectedTime.value.length > 0) {
    document.activityForm.PreInjectedTime.value = min2hhmm(PreInjectedTime);
  }
  if(document.activityForm.PostInjectedTime.value.length > 0) {
    document.activityForm.PostInjectedTime.value = min2hhmm(PostInjectedTime);
  }
  if(document.activityForm.RefInjectedTime.value.length > 0) {
    document.activityForm.RefInjectedTime.value = min2hhmm(RefInjectedTime);
  }

  var PreInjectedActivity  = document.activityForm.PreInjectedActivity.value;
  var PostInjectedActivity = document.activityForm.PostInjectedActivity.value;

  if(halfLifeInMins(isotope) == 0) {
    document.getElementById('Message').value = "invalid isotope : " + isotope;
    document.getElementById('isotope').style.backgroundColor = 'rgba(255, 0, 0, 0.5)';

    return false;
  }
  
    if(RefInjectedTime < 0)  {
    document.getElementById('Message').value = "invalid RefInjectedTime.value: " + RefInjectedTime;
    document.getElementById('RefInjectedTime').style.backgroundColor = 'rgba(255, 0, 0, 0.5)';  
    return false;
  }
  


  if(PreInjectedActivity.length == 0) {
    document.getElementById('Message').value = "invalid PreInjectedActivity.value: " + PreInjectedActivity;
    document.getElementById('PreInjectedActivity').style.backgroundColor = 'rgba(255, 0, 0, 0.5)';  
    return false;
  }


  if(PreInjectedTime  < 0) {
    document.getElementById('Message').value = "invalid PreInjectedTime.value: " + PreInjectedTime;
    document.getElementById('PreInjectedTime').style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
    return false;
  }







  if(PostInjectedActivity.length == 0)  {
    document.getElementById('Message').value = "invalid PostInjectedActivity.value: " + PostInjectedActivity;
    document.getElementById('PostInjectedActivity').style.backgroundColor = 'rgba(255, 0, 0, 0.5)';  
    return false;
  }
   if(PostInjectedTime < 0)  {
    document.getElementById('Message').value = "invalid PostInjectedTime.value: " + PostInjectedTime;
    document.getElementById('PostInjectedTime').style.backgroundColor = 'rgba(255, 0, 0, 0.5)';  
	return false;
  }   
  return true;
}

function hhmm2min(str) 
{
  var h = 0, m = 0;
  var p = str.split(' ');

  if(p[0].indexOf(':') < 0) {
    m = parseInt(p[0].substr(p[0].length - 2, p[0].length), 10);
    h = parseInt(p[0].substr(0, p[0].length - 2), 10);

  }
  else {
    var q = p[0].split(':'), qlen = q.length;
    if(qlen >= 2) { m = parseInt(q.pop(), 10); }
    if(qlen >= 1) { h = parseInt(q.pop(), 10); }

  }

  if(p.length == 2 && p[1].toUpperCase() == 'PM') { h += 12; }

//  document.decayForm.Message.value = "h = " + h + ", m = " + m;

  var mins = 60*h + m;
  if(!(mins >= 0 && mins <= 24*60)) return -1;

  return mins;
}

function min2hhmm(mins) {
  var h = Math.floor(mins/60);
  var m = mins % 60;

//  document.decayForm.Message.value = "t = " + t;

  return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
}

function halfLifeInMins(val) {
  switch(val) {
  case 'O15'   : return 122.24 / 60;
  case 'N13'   : return 9.965;
  case 'C11'   : return 20.39;
  case 'Ga68'  : return 67.3;
  case 'F18'   : return 109.8;
  case 'Tc99m' : return 6.01 * 60;
  case 'Cu64'  : return 12.7 * 60;
  case 'I123'  : return 13.27 * 60;
  case 'Y90'   : return 64.0 * 60;
  case 'In111' : return 67.3176 * 60;
  case 'Tl201' : return 72.9120 * 60;
  case 'Ga67'  : return 78.3 * 60;
  case 'Zr89'  : return 78.4 * 60;
  case 'I124'  : return 4.2 * 24 * 60;
  case 'I131'  : return 8.0207 * 24 * 60;
  case 'I125'  : return 59.4080 * 24 * 60;
  case 'Ge68'  : return 270.95 * 24 * 60;
  case 'Na22'  : return 951.00 * 24 * 60;
  case 'Lu177'  : return 6.6 * 24 * 60;
  default : return 0;
  }
}