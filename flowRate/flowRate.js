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


//Fixes the output to make it look pretty
function str_pad_left(string, pad, length) 
{
  return (new Array(length + 1).join(pad) + string).slice(-length);
}

//Updates the output time to need to be calculated when data is entered
function dataEntry()
{
	document.getElementById("CalculatedDoseRate").value = "Need to Update";
	document.getElementById("CalculatedDoseRate").style.width = '200px'
}

//Calculating the required flow rate
function calculate()
{
	//getting the variables from the input form
	var givenmL = document.getElementById('inputmL').value;
	var givenmLperMin = document.getElementById('givenmlperMin').value;
	var result = givenmL / givenmLperMin;

	// if time < 0 or result is in error (NaN or infinity)
	if (result < 0 || !isFinite(result) || result >= 1000 )
	{
		document.getElementById("CalculatedDoseRate").value = 'error';
		document.getElementById("CalculatedDoseRate").style.width = '90px';
	}
	else
	{
		//calculting the minutes and seconds
		const minutes = Math.floor(result);
		const seconds = Math.round ((result - minutes) * 60);
		//const finalTime = str_pad_left(minutes, '0', 3) + ':' + str_pad_left(seconds, '0', 2);
		const finalTime = minutes + ' min ' + str_pad_left(seconds, '0', 2) + ' sec';
		
		//putting the variables in a file
		document.getElementById("CalculatedDoseRate").value = finalTime;
		document.getElementById("CalculatedDoseRate").style.width = '200px';
	}
}