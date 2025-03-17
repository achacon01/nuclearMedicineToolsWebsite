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


//All activities are stored in Bq. 
// All absorbed dose is stored in Gy base units
// All Equivalent dose is stored in Sv base units
// exposure is c/kg
//Use * to give it the unit. Use / to convert to the unit from the base unit
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
	
		//absorbed dose
		case ("uGy"): base = 1E-6; break;
		case ("mGy"): base = 1E-3; break;
		case ("Gy"): base = 1; break;
		case ("kGy"): base = 1E3; break;		
		
		case ("urad"): base = 1E-8; break;
		case ("mrad"): base = 1E-5; break;
		case ("rad"): base = 1E-2; break;
		case ("krad"): base = 1E1; brea
	
		//Equivalent dose
		case ("uSv"): base = 1E-6; break;
		case ("mSv"): base = 1E-3; break;
		case ("Sv"): base = 1; break;
		case ("kSv"): base = 1E3; break;
	
		case ("urem"): base = 1E-8; break;
		case ("mrem"): base = 1E-5; break;
		case ("rem"): base = 1E-2; break;
		case ("krem"): base = 1E1; break;
	
		//exposure
		case ("c/kg"): base = 1; break;
		
		case ("R"): base = 0.000257731; break;
	
		default: -999; break;
	
	
	}
	
	return base;
}

function calculateConversion(whichCalculate)
{
	var inputUnitName =  "input"+ whichCalculate +"Unit";
	var ConvertedUnitName = "converted"+ whichCalculate +"Unit";
	var inputValue = "input" + whichCalculate;
	var convertedValue = "converted" + whichCalculate;
		
	
	
	var inputUnit = document.getElementById(inputUnitName).value; 
	var convertedUnit = document.getElementById(ConvertedUnitName).value; 
	
	var inputUnitFactor = getBase(inputUnit);
	var convertedUnitFactor = getBase(convertedUnit);
	
	inputActivity = document.getElementById(inputValue).value * inputUnitFactor ; 
	var convertedActivity = inputActivity / convertedUnitFactor ;
	
	document.getElementById(convertedValue).value = convertedActivity;
	
	
	
}