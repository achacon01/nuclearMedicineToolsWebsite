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


function getBase (givenUnit)
{
	var base = -9999;
	
	switch (givenUnit)
	{
		//activity
		case ("Bq"): base = 1; break;
		case ("kBq"): base = 1E3; break;
		case ("MBq"): base = 1E6; break;
		case ("GBq"): base = 1E9; break;
	
		case ("nCi"): base = 37; break;
		case ("uCi"): base = 37000; break;
		case ("mCi"): base = 3.7E7; break;
		case ("Ci"): base =  37000000000; break;
	}
	
	return base;
}

//Updates the output time to need to be calculated when data is entered
function dataEntry()
{
	document.getElementById("CalculatedVolume").value = "Need to Update";
	document.getElementById("CalculatedVolume").style.width = '200px'
}

//Calculating the required flow rate
function calculate()
{
	//getting the variables from the input form
	var givenmL = document.getElementById('inputmL').value;
	var givenActiviy = document.getElementById('stockActivity').value;
	var inputActivityUnit = document.getElementById('inputActivityUnit').value;

	givenActiviy = givenActiviy * getBase(inputActivityUnit); //now in Bq
	
	var wantActivity = document.getElementById('wantActivity').value;
	var wantActivityUnit = document.getElementById('wantActivityUnit').value;
	wantActivity = wantActivity * getBase(wantActivityUnit); //now in Bq

	var needVolume = 1.0* givenmL / givenActiviy * wantActivity;


	// if time < 0 or result is in error (NaN or infinity)
	if (needVolume < 0 || !isFinite(needVolume) || needVolume >= givenmL )
	{
		document.getElementById("CalculatedVolume").value = 'error';
		document.getElementById("CalculatedVolume").style.width = '90px';
	}
	else
	{
	
		//putting the variables in a file
		document.getElementById("CalculatedVolume").value = needVolume.toFixed(2) + " mL";
		document.getElementById("CalculatedVolume").style.width = '200px';
	}
}