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


//Updates the output time to need to be calculated when data is entered
function dataEntry()
{

	var inputTracer = document.activityForm.inputTracer.value;

	var gammaConstant = 0; //uSv/hr/MBq at 1 meter with patient attenuation
	var halfLife = 0; //in Minutes
	
	switch (inputTracer)
	{
		case "F18": gammaConstant = 0.092; halfLife = 110; break; //usv/hr @ 1m AAPM 108
		case "Tc99m": gammaConstant = 0.0149; halfLife=6.006*60.0; break; //usv/hr @ 1m ( Johnson and Birkey, Health Physics and Radiological Health, Table 6.21)
	}

	const EarlyExposure = document.activityForm.ptExternalDoseRate.value;
	const EarlyTime = document.activityForm.refTime1.value;
	
	document.activityForm.ptEarlyDoseEstimate.value = (EarlyExposure / gammaConstant).toFixed(1);

	
	const ptTopUpActivity = document.activityForm.ptTopUpActivity.value;
	const ptTopUpActivityRefTime = document.activityForm.refTimeTopUpCalc.value;

	
	
	const refTime2 = document.activityForm.refTime2.value;
	const refExposure2 = document.activityForm.ptExternalDoseRate2.value;

	const residualActivity = document.activityForm.residualActivity.value;
	const residualTime = document.activityForm.residualTime.value;

    // Convert time strings to Date objects
    const time1Date = new Date(`1970-01-01T${EarlyTime}:00Z`);
    const time2Date = new Date(`1970-01-01T${refTime2}:00Z`);	
    const timeTopUpRefDate = new Date(`1970-01-01T${ptTopUpActivityRefTime}:00Z`);	
    const timeResidual = new Date(`1970-01-01T${residualTime}:00Z`);	

	//The decay corrected exposure at the top up measurment time
	var diffTopUpTime2 = (time2Date -timeTopUpRefDate)/(1000.0*60.0);
	var diffTime1Time2 = (time2Date -  time1Date)/(1000.0*60.0);
	var diffResidualTime2 = (time2Date -  timeResidual)/(1000.0*60.0);
	
	var decayCorrectedTopActivity =  ptTopUpActivity * Math.pow(0.5,diffTopUpTime2/halfLife) - residualActivity* Math.pow(0.5,diffResidualTime2 / halfLife); ;
	var decayCorrectedExposure1 = EarlyExposure * Math.pow(0.5,diffTime1Time2 / halfLife);
	
	var ptGammaConstant = (refExposure2 - decayCorrectedExposure1 ) / decayCorrectedTopActivity;
	
	document.activityForm.ptActivityFinal.value =  (refExposure2/ptGammaConstant).toFixed(1) ;
	document.activityForm.refTimeFinal.value = refTime2;
	

	
	
	
	
	
	//outputting the final calculation
	

	
	return;


}