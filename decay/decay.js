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



function onCalculateDecay() 
{

  var halflife = halfLifeInMins(document.activityForm.isotope.value);
  var activity = document.activityForm.PreInjectedActivity.value;



  var calibrationDT = new Date(document.activityForm.CalibrationDateTime.value);
  var injectionDT   = new Date(document.activityForm.PostInjectedDateTime.value);
  var currentDT     = new Date();

  var cur_cal_mins = (currentDT.getTime() - calibrationDT.getTime()) / 1000.0 / 60.0;
  var inj_cal_mins = (injectionDT.getTime() - calibrationDT.getTime()) / 1000.0 / 60.0;


  document.currentForm.CurrentDecayed.value     = (activity * Math.pow(2.0, -cur_cal_mins / halflife)).toFixed(2);
  document.currentForm.CurrentUndecayed.value   = (activity * Math.pow(2.0,  cur_cal_mins / halflife)).toFixed(2);
  document.resultsForm.InjectionDecayed.value   = (activity * Math.pow(2.0, -inj_cal_mins / halflife)).toFixed(2);
  document.resultsForm.InjectionUndecayed.value = (activity * Math.pow(2.0,  inj_cal_mins / halflife)).toFixed(2);

}

//in minutes
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

function updateTime() 
{
    const now = new Date();
    const currentTime = now.toLocaleString();
    document.getElementById('CurrentDateTime').value = currentTime;
	onCalculateDecay();

}

window.onload = function() {
    updateTime();
    setInterval(updateTime, 1000);
};
       
document.addEventListener('DOMContentLoaded', function() 
{
	document.activityForm.addEventListener('keydown', function(event) 
	{
		if (event.key === 'Enter') 
		{
			event.preventDefault();
        }
    });
});