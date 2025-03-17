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


// This function changes the width of the input boxes so that they look nice and are inline
function updateWidth(idName) 
{
	var element;
	if (document.getElementById(idName))  // if an id has been passed to a function
	{
		element = document.getElementById(idName); //getting the element by id
	}
	else //if an element has been passed to the function
	{
		element = idName;
	}
	

	var text;
  
	if (element.tagName === 'SELECT') //the element is an drop down menu
	{
		text = element.options[element.selectedIndex].text; //getting the text
	} else if (element.tagName === 'INPUT' && ( element.type === 'number' || element.type === 'text' )) //If this is an input text box of type number
	{
		text = element.value;
	} else 
	{
		return; // Unsupported element type
	}
  
	// Create a hidden span element
	var span = document.createElement('span');
	span.className = 'hidden-span';
	span.textContent = text;
	
	// Append span to the body and measure its width
	document.body.appendChild(span);
	var width = span.offsetWidth;
	document.body.removeChild(span);
	
	// Set the width of the select element
	element.style.width = (width + 90) + 'px'; // Adding some padding
}

function printPage() //for the print page button
{
	window.print();
}
	
function refreshPage() //For refresh page button
{
	window.location.reload();
} 	

//This deletes the rows which have been added for the exposure calculation
function deleteDiv(button) 
{
	const divs = document.querySelectorAll('div');
	// Iterate over each div and check if its id is 'Chld'
	divs.forEach(div => 
	{
		if (div.id === 'duplicated') 
		{
		// Remove the div if it has the id 'Chld'
		div.remove();
		}
	});
	setFirstEntry("", "", "Single", "") 
	updateResult() 
	runningCount = 1;
}	

// use so we know how many rows there are //
var runningCount =1;

//set the value of the first row manually
function setFirstEntry(distance, time, frequency, comment) 
{
	var divs = document.getElementsByClassName('numberInputDiv');
	var firstDiv = divs[0];
	firstDiv.getElementsByClassName('numberInput')[0].value = distance;
	firstDiv.getElementsByClassName('DurationInput')[0].value = time;
	firstDiv.getElementsByClassName('ExposureTypeSelect')[0].value = frequency;
	firstDiv.getElementsByClassName('CommentInput')[0].value = comment;	
	firstDiv.getElementsByClassName('CommentInput')[0].style.width = ((firstDiv.getElementsByClassName('CommentInput')[0].value.length + 30) * 8) + 'px';
}

//Making this shifts the div to make a new row
function copyDiv(distance, time, frequency, comment) 
{
	//cloning the row div
    var original = document.getElementById("numberInputDiv");
    var clone = original.cloneNode(true); // "deep" clone
    clone.id = "duplicated"; // change the id or other attributes/contents
    
	//incrementing the number of rows
    runningCount = runningCount + 1;
	
	//<!-- Text used for activity number -->
    var labelTxt = 'Activity ' + runningCount + ': Distance (meter)';


    // Insert the clone after the last element.
	if (document.getElementById('duplicated')) //if there is more than one row
	{
		var container = document.getElementById('duplicated');
		container.appendChild(clone);
	}
	else //if this will be the 2nd row
	{
		original.parentNode.insertBefore(clone, original.nextSibling);
	}
	
	//Getting the divs which contain the data
	var divs = document.getElementsByClassName('numberInputDiv');

	
    if (distance === undefined || time === undefined || frequency === undefined || comment === undefined)
	{
		//setting the blank values and correcting the numbering of activities
		if (divs.length > 0) 
		{
			var lastDiv = divs[divs.length - 1];
			lastDiv.getElementsByClassName('numberInput')[0].value = "";
			lastDiv.getElementsByClassName('numberInput')[0].previousElementSibling.textContent = labelTxt;
			lastDiv.getElementsByClassName('DurationInput')[0].value = "";
			lastDiv.getElementsByClassName('CommentInput')[0].value = "";
			
		}
	}
	else	
	{
		if (divs.length > 0) 
		{
			var lastDiv = divs[divs.length - 1];
			lastDiv.getElementsByClassName('numberInput')[0].value = distance;
			lastDiv.getElementsByClassName('numberInput')[0].previousElementSibling.textContent = labelTxt;
			lastDiv.getElementsByClassName('DurationInput')[0].value = time;
			lastDiv.getElementsByClassName('ExposureTypeSelect')[0].value = frequency;
			lastDiv.getElementsByClassName('CommentInput')[0].value = comment;
			lastDiv.getElementsByClassName('CommentInput')[0].style.width = ((lastDiv.getElementsByClassName('CommentInput')[0].value.length + 1) * 8) + 'px';			
		}
	}
}

//Update the results section
function updateResult() 
{

	//Getting the data into variables
    var result = document.getElementById("result");
	var resultRisk = document.getElementById("resultRisk");

    var ProcedureSelect = document.getElementById("ProcedureSelect").value;
	var adminActivity = document.getElementsByClassName("ActivityNucMedInput");
    var numberInputs = document.getElementsByClassName("numberInput");
    var timeInputs = document.getElementsByClassName("DurationInput");
	var delayInput = document.getElementsByClassName("delayInput")[0].value;
    var exposureSelect = document.getElementsByClassName("ExposureTypeSelect");


	var allNumbersEntered = true;
    var product = 0; //is the multiplication of exposure * time
	var integration =0; // is the integration of exposure with respect to time
	var baselineExposure = 0; 
	var exposure = 0;
	var halfLife =0;
	var activityScalar =0;
	var closeContactExposure = 0;
	var riskMultiplier = 0; // This is the risk per Sv (NOTE Sv)
	var bioCoeff = [0,0,0];// the coefficient for a multi-exponential biological decay
	var bioHalfLife = [0,0,0]; //in hours			

	//Selecting the procedure 
    if (ProcedureSelect === "FDG" ) 
	{
		closeContactExposure = 214; // exposure at 10cm uSv / hr
        baselineExposure = 16; // uSv / hr at 1m
		halfLife = 109.0 / 60.0; //hours, physical half life
		activityScalar =  adminActivity[0].value / 285.0; //administered activity divided by reference activity
		
		bioCoeff[0] = 0.06;
		bioCoeff[1] = 0.18;
		bioCoeff[2] = 0.76;
	
		bioHalfLife[0] = 0.2;
		bioHalfLife[1] = 1.5;
		bioHalfLife[2] = 9999;
	
	
	} 
	else if(ProcedureSelect === "Bone" ) 
	{
		closeContactExposure = 26; // exposure at 10cm uSv / hr
        baselineExposure = 4; // uSv / hr at 1m
		halfLife = 6.006; //hours, physical half life
		activityScalar =  adminActivity[0].value / 864; //administered activity divided by reference activity
	
		bioCoeff[0] = 0.3;
		bioCoeff[1] = 0.3;
		bioCoeff[2] = 0.4;
	
		bioHalfLife[0] = 0.5;
		bioHalfLife[1] = 2;
		bioHalfLife[2] = 72;
	
	
	}			
	else if(ProcedureSelect === "Myocardial-99mTc-MIBI" ) 
	{
		closeContactExposure = 73; // exposure at 10cm uSv / hr
        baselineExposure = 14; // uSv / hr at 1m
		halfLife = 6.006; //hours, physical half life
		activityScalar =  adminActivity[0].value / 1356; //administered activity divided by reference activity
	
		bioCoeff[0] = 0.09;
		bioCoeff[1] = 0.1;
		bioCoeff[2] = 0.81;
	
		bioHalfLife[0] = 1.3;
		bioHalfLife[1] = 7;
		bioHalfLife[2] = 24;
	}				
	else if (ProcedureSelect === "Myocardial-201Ti" ) 
	{
		closeContactExposure = 15; // exposure at 10cm uSv / hr
        baselineExposure = 1; // uSv / hr at 1m
		halfLife = 3.0421*24; //hours, physical half life
		activityScalar =  adminActivity[0].value / 125; //administered activity divided by reference activity

		bioCoeff[0] = 0.63;
		bioCoeff[1] = 0.37;
		bioCoeff[2] = 0;
	
		bioHalfLife[0] = 7;
		bioHalfLife[1] = 28;
		bioHalfLife[2] = 9999999;
	
	
	}
	else if(ProcedureSelect === "GBP" ) 
	{
		closeContactExposure = 105; // exposure at 10cm uSv / hr
        baselineExposure = 9; // uSv / hr at 1m
		halfLife = 6.006; //hours, physical half life
		activityScalar =  adminActivity[0].value / 722; //administered activity divided by reference activity
	
		bioCoeff[0] = 1;
		bioCoeff[1] = 0;
		bioCoeff[2] = 0;
	
		bioHalfLife[0] = 9999999;
		bioHalfLife[1] = 9999999;
		bioHalfLife[2] = 9999999;
	
	}
	else if(ProcedureSelect === "VQ" ) 
	{
		closeContactExposure = 35; // exposure at 10cm uSv / hr
        baselineExposure = 3; // uSv / hr at 1m
		halfLife = 6.006; //hours, physical half life
		activityScalar =  adminActivity[0].value / 272; //administered activity divided by reference activity

		bioCoeff[0] = 0.57;
		bioCoeff[1] = 0.1;
		bioCoeff[2] = 0.5;
	
		bioHalfLife[0] = 6;
		bioHalfLife[1] = 72;
		bioHalfLife[2] = 99999999;
	
	}
	else if(ProcedureSelect === "Renal-99mTc-MAG" ) 
	{
		closeContactExposure = 13; // exposure at 10cm uSv / hr
        baselineExposure = 0.4; // uSv / hr at 1m
		halfLife = 6.006; //hours, physical half life
		activityScalar =  adminActivity[0].value / 74; //administered activity divided by reference activity

		bioCoeff[0] = 0.4;
		bioCoeff[1] = 0.4;
		bioCoeff[2] = 0.2;
	
		bioHalfLife[0] = 0.28;
		bioHalfLife[1] = 0.5;
		bioHalfLife[2] = 7.2;

	}
	else if(ProcedureSelect === "Renal-99mTc-DMSA" ) 
	{
		closeContactExposure = 21; // exposure at 10cm uSv / hr
        baselineExposure = 0.8; // uSv / hr at 1m
		halfLife = 6.006; //hours, physical half life
		activityScalar =  adminActivity[0].value / 91; //administered activity divided by reference activity

		bioCoeff[0] = 0.25;
		bioCoeff[1] = 0.25;
		bioCoeff[2] = 0.5;
	
		bioHalfLife[0] = 2;
		bioHalfLife[1] = 43;
		bioHalfLife[2] = 99999999999;

	}
	else if(ProcedureSelect === "Thyroid" ) 
	{
		closeContactExposure = 36; // exposure at 10cm uSv / hr
        baselineExposure = 3; // uSv / hr at 1m
		halfLife = 6.006; //hours, physical half life
		activityScalar =  adminActivity[0].value / 157; //administered activity divided by reference activity

		bioCoeff[0] = 0.33;
		bioCoeff[1] = 0.15;
		bioCoeff[2] = 0.42;
	
		bioHalfLife[0] = 5;
		bioHalfLife[1] = 10;
		bioHalfLife[2] = 45;

	}
	else if(ProcedureSelect === "Parathyroid" ) 
	{
		closeContactExposure = 57; // exposure at 10cm uSv / hr
        baselineExposure = 5.7; // uSv / hr at 1m
		halfLife = 6.006; //hours, physical half life
		activityScalar =  adminActivity[0].value / 813; //administered activity divided by reference activity
	
		bioCoeff[0] = 0.15;
		bioCoeff[1] = 0.14;
		bioCoeff[2] = 0.7;
	
		bioHalfLife[0] = 1.3;
		bioHalfLife[1] = 7;
		bioHalfLife[2] = 24;
	
	}
	else if(ProcedureSelect === "WBC" ) 
	{
		closeContactExposure = 155; // exposure at 10cm uSv / hr
        baselineExposure = 5; // uSv / hr at 1m
		halfLife = 6.006; //hours, physical half life
		activityScalar =  adminActivity[0].value / 744; //administered activity divided by reference activity
	
		bioCoeff[0] = 1;
		bioCoeff[1] = 0;
		bioCoeff[2] = 0;
	
		bioHalfLife[0] = 999999;
		bioHalfLife[1] = 9999999;
		bioHalfLife[2] = 9999999;
		
	
	}
	else if(ProcedureSelect === "Breast" ) 
	{
		closeContactExposure = 52; // exposure at 10cm uSv / hr
        baselineExposure = 1.6; // uSv / hr at 1m
		halfLife = 6.006; //hours, physical half life
		activityScalar =  adminActivity[0].value / 86; //administered activity divided by reference activity

		bioCoeff[0] = 1;
		bioCoeff[1] = 0;
		bioCoeff[2] = 0;
	
		bioHalfLife[0] = 999999;
		bioHalfLife[1] = 9999999;
		bioHalfLife[2] = 9999999;			
	
	}
	else if(ProcedureSelect === "F18Aborted" ) 
	{
		closeContactExposure = 872.8; // exposure at 10cm uSv / hr
        baselineExposure = 27.6; // uSv / hr at 1m
		halfLife = 110.0/60.0; //hours, physical half life
		activityScalar =  adminActivity[0].value / 300; //administered activity divided by reference activity

		bioCoeff[0] = 1;
		bioCoeff[1] = 0;
		bioCoeff[2] = 0;
	
		bioHalfLife[0] = 999999;
		bioHalfLife[1] = 9999999;
		bioHalfLife[2] = 9999999;			
	
	}
	else if(ProcedureSelect === "Tc99mAborted" ) 
	{
		closeContactExposure = 376.9; // exposure at 10cm uSv / hr
        baselineExposure = 11.92; // uSv / hr at 1m
		halfLife = 6.006; //hours, physical half life
		activityScalar =  adminActivity[0].value / 500; //administered activity divided by reference activity

		bioCoeff[0] = 1;
		bioCoeff[1] = 0;
		bioCoeff[2] = 0;
	
		bioHalfLife[0] = 999999;
		bioHalfLife[1] = 9999999;
		bioHalfLife[2] = 9999999;			
	
	}
	else if(ProcedureSelect === "I-131 Ablation therapy" ) 
	{
		closeContactExposure = 790; // exposure at 10cm uSv / hr
        baselineExposure = 25; // uSv / hr at 1m
		halfLife = 15.4; //hours, physical half life
		activityScalar =  adminActivity[0].value/3000.0; //administered activity divided by reference activity

		bioCoeff[0] = 1;
		bioCoeff[1] = 0;
		bioCoeff[2] = 0;
	
		bioHalfLife[0] = 999999;
		bioHalfLife[1] = 9999999;
		bioHalfLife[2] = 9999999;			
	
	}
	else if(ProcedureSelect === "I-131 Ablation therapy Aborted" ) 
	{
		closeContactExposure = 3448; // exposure at 10cm uSv / hr
        baselineExposure = 109.05; // uSv / hr at 1m
		halfLife = 15.4; //hours, physical half life
		activityScalar =  adminActivity[0].value/3000.0; //administered activity divided by reference activity

		bioCoeff[0] = 1;
		bioCoeff[1] = 0;
		bioCoeff[2] = 0;
	
		bioHalfLife[0] = 999999;
		bioHalfLife[1] = 9999999;
		bioHalfLife[2] = 9999999;			
	
	}
	else if(ProcedureSelect === "Lu-177 therapy" ) 
	{
		closeContactExposure = 790; // exposure at 10cm uSv / hr
        baselineExposure = 25; // uSv / hr at 1m
		halfLife = 2; //hours, physical half life
		activityScalar =  adminActivity[0].value/7000.0; //administered activity divided by reference activity

		bioCoeff[0] = 1;
		bioCoeff[1] = 0;
		bioCoeff[2] = 0;
	
		bioHalfLife[0] = 999999;
		bioHalfLife[1] = 9999999;
		bioHalfLife[2] = 9999999;			
	
	}
	else if(ProcedureSelect === "Lu-177 therapy Aborted" ) 
	{
		closeContactExposure = 1265; // exposure at 10cm uSv / hr
        baselineExposure = 40; // uSv / hr at 1m
		halfLife = 2; //hours, physical half life
		activityScalar =  adminActivity[0].value/7000.0; //administered activity divided by reference activity

		bioCoeff[0] = 1;
		bioCoeff[1] = 0;
		bioCoeff[2] = 0;
	
		bioHalfLife[0] = 999999;
		bioHalfLife[1] = 9999999;
		bioHalfLife[2] = 9999999;			
	
	}
	else if(ProcedureSelect === "Y-90 therapy" ) 
	{
		closeContactExposure = 20; // exposure at 10cm uSv / hr
        baselineExposure = 3; // uSv / hr at 1m
		halfLife = 64.2 ; //hours, physical half life
		activityScalar =  adminActivity[0].value/4500.0; //administered activity divided by reference activity

		bioCoeff[0] = 1;
		bioCoeff[1] = 0;
		bioCoeff[2] = 0;
	
		bioHalfLife[0] = 9999999;
		bioHalfLife[1] = 9999999;
		bioHalfLife[2] = 9999999;			
	
	}
	
	
	
	
	var origdelayInput = delayInput;
	//This loop calculates the effective dose 
    for (var i = 0; i < numberInputs.length; i++) 
	{
		//Some error in the data
        if (numberInputs[i].value === '' || timeInputs[i].value === '' || numberInputs[i].value < 0.1 || timeInputs[i].value < 0 ) {
            allNumbersEntered = false;
			product = "input error";                 
			break;
        }
		
		delayInput = origdelayInput;
		
		for (var dayi = 0  ; dayi <= 59; dayi++) //looping over the days
		{
			if ( exposureSelect[i].value == "Repeat" || dayi == 0 || exposureSelect[i].value == "5 Day Week" ) 
			{
			
				var doseRate = baselineExposure;
				if (numberInputs[i].value < 1 )
					doseRate = closeContactExposure* Math.pow(0.1 / numberInputs[i].value  , 1.5);
				else if (numberInputs[i].value >= 1 && numberInputs[i].value  < 3 )
					doseRate =  doseRate * Math.pow(1 / numberInputs[i].value  , 1.5);
				else if (numberInputs[i].value >= 3)
					doseRate = doseRate *  Math.pow(1 / numberInputs[i].value  , 2);
				
				
				var biologicalScalar = bioCoeff[0] * Math.pow(0.5,(dayi*24.0 + delayInput )/bioHalfLife[0]) + bioCoeff[1] * Math.pow(0.5,(dayi*24.0 + delayInput )/bioHalfLife[1]) + bioCoeff[2] * Math.pow(0.5,(dayi*24.0 + delayInput )/bioHalfLife[2])	
				
				
				//integrating to get activity
				integration += biologicalScalar *  Math.pow(0.5,(dayi*24.0 + delayInput )/halfLife) * doseRate * ( 1.0 - Math.exp(-1 * timeInputs[i].value * Math.log(2) /halfLife) ) / (Math.log(2) / halfLife )    * activityScalar;
				
				
				//simple exposure * time			
				product +=     biologicalScalar * Math.pow(0.5,(dayi*24.0 + delayInput ) /halfLife) * doseRate * timeInputs[i].value * activityScalar;
				if (exposureSelect[i].value == "5 Day Week" && dayi % 5 == 0)
				    dayi +=2; //its the weekend so no exposure
			}
			delayInput = 0;
		} //end day loop

	}//end inputs loop
	

	//Formatting the output to display nicely This also handels the red and orange text
	if (allNumbersEntered == false)
	{
		result.value = "Input Error";
		resultRisk.value = "Input Error";
	}
	else if (integration < 1)
	{
		result.value = "< 1 \u03BCSv";
	}
	else if (integration >= 0 && integration < 100 )
	{
		result.value = Math.round(integration*10)/10 +  " \u03BCSv";
		result.style.color = "";
		result.style.fontWeight = "";
	}
	else if (integration >= 100 && integration < 1000 )
	{
		result.value = Math.round(integration*10)/10 +  " \u03BCSv, Caution high dose warning";
		result.style.color = "orange";
		result.style.fontWeight = "";
		//result.style.width = ((result.value.length + 1) * 8) + 'px';
	}			
	else if (integration >= 1000 )
	{
		result.value = Math.round(integration/100)/10 +  " mSv. WARNING! DOSE IS > 1 mSV";
		result.style.color = "red";
		result.style.fontWeight = "bold";
		//result.style.width = ((result.value.length + 1) * 8) + 'px';
	}						
	
	//console.log(product);
	// This section is for updating the risk
	//riskMultiplier
    var GenderSelect = document.getElementById("GenderSelect").value;
    var AgeSelect = document.getElementById("AgeSelect").value;
	
	if (GenderSelect == "WorkingPop")
	{
		riskMultiplier = 4.2E-2; //ICRP Risk
		document.getElementById("AgeSelect").style.display = "none";
		document.getElementById("AgeSelectlabel").style.display = "none";
	}
	else if (GenderSelect == "WholePop")
	{
		riskMultiplier = 5.7E-2; //ICRP Risk
		document.getElementById("AgeSelect").style.display = "none";
		document.getElementById("AgeSelectlabel").style.display = "none";

	}

	else if (GenderSelect == "Male")
	{
		document.getElementById("AgeSelect").style.display = "inline";
		document.getElementById("AgeSelectlabel").style.display = "inline";

		if (AgeSelect =="0-9")
			riskMultiplier = 11.5E-2;
		else if (AgeSelect =="10-19")
			riskMultiplier = 8.8E-2;
		else if (AgeSelect =="20-29")
			riskMultiplier = 6.8E-2;					
		else if (AgeSelect =="30-39")
			riskMultiplier = 5.0E-2;					
		else if (AgeSelect =="40-49")
			riskMultiplier = 4.0E-2;					
		else if (AgeSelect =="50-59")
			riskMultiplier = 2.9E-2;					
		else if (AgeSelect =="60-69")
			riskMultiplier = 1.9E-2;					
		else if (AgeSelect =="70-79")
			riskMultiplier = 1.0E-2;					
		else if (AgeSelect =="80-89")
			riskMultiplier = 0.4E-2;					
		else if (AgeSelect =="90-99")
			riskMultiplier = 0.08E-2;					
	}
	else
	{
		document.getElementById("AgeSelect").style.display = "inline";
		document.getElementById("AgeSelectlabel").style.display = "inline";
		
		if (AgeSelect =="0-9")
			riskMultiplier = 18.5E-2;
		else if (AgeSelect =="10-19")
			riskMultiplier = 13E-2;
		else if (AgeSelect =="20-29")
			riskMultiplier = 9.4E-2;					
		else if (AgeSelect =="30-39")
			riskMultiplier = 7.1E-2;					
		else if (AgeSelect =="40-49")
			riskMultiplier = 5.7E-2;					
		else if (AgeSelect =="50-59")
			riskMultiplier = 4.4E-2;					
		else if (AgeSelect =="60-69")
			riskMultiplier = 3.2E-2;					
		else if (AgeSelect =="70-79")
			riskMultiplier = 2.1E-2;					
		else if (AgeSelect =="80-89")
			riskMultiplier = 1.0E-2;					
		else if (AgeSelect =="90-99")
			riskMultiplier = 0.1E-2;				
	}
	
	var risk = integration /1E6 *  riskMultiplier * 1E6;
	if (allNumbersEntered == true)
		resultRisk.value = Math.round(risk*10)/10;
	
	//displaying the exposure at end of proceudre
	document.getElementById("exposure").value = (activityScalar* baselineExposure).toFixed(2);
	updateWidth('exposure');
	updateWidth('resultRisk');

	
	
} // end update results function

//This sets the default values on the page on a reload of a clear rows
function setDefaultValues() 
{
	

	
	
    var numberInputs = document.getElementsByClassName("numberInput");
    if (numberInputs.length >= 2) {
        if (numberInputs[0].value === '') {
            numberInputs[0].value = 99;
        }
        if (numberInputs[1].value === '') {
            numberInputs[1].value = -99;
        }
    }

    var ProcedureSelect = document.getElementById("ProcedureSelect").value;
	var adminActivity = document.getElementsByClassName("ActivityNucMedInput");
	
	if (ProcedureSelect === "FDG" ) 
		adminActivity[0].value = 285.0;	
	else if (ProcedureSelect === "Bone" )
		adminActivity[0].value = 864.0;				
	else if (ProcedureSelect === "Myocardial-99mTc-MIBI" )
		adminActivity[0].value = 1356;				
	else if (ProcedureSelect === "Myocardial-201Ti" )
		adminActivity[0].value = 125.0;	
	else if (ProcedureSelect === "GBP" )
		adminActivity[0].value = 722;	
	else if (ProcedureSelect === "VQ" )
		adminActivity[0].value = 272;	
	else if (ProcedureSelect === "Renal-99mTc-MAG" )
		adminActivity[0].value = 74;	
	else if (ProcedureSelect === "Renal-99mTc-DMSA" )
		adminActivity[0].value = 91;	
	else if (ProcedureSelect === "Thyroid" )
		adminActivity[0].value = 157.0;	
	else if (ProcedureSelect === "Parathyroid" )
		adminActivity[0].value = 813.0;	
	else if (ProcedureSelect === "WBC" )
		adminActivity[0].value = 744.0;					
	else if (ProcedureSelect === "Breast" )
		adminActivity[0].value = 86.0;	
	else if (ProcedureSelect === "F18Aborted" )
		adminActivity[0].value = 300;
	else if (ProcedureSelect === "Tc99mAborted" )
		adminActivity[0].value = 500;	
	else if (ProcedureSelect === "I-131 Ablation therapy" )
		adminActivity[0].value = 3000;	
	else if (ProcedureSelect === "I-131 Ablation therapy Aborted" )
		adminActivity[0].value = 3000;		
	else if (ProcedureSelect === "Lu-177 therapy" )
		adminActivity[0].value = 7000;		
	else if (ProcedureSelect === "Lu-177 therapy Aborted" )
		adminActivity[0].value = 7000;		
	else if (ProcedureSelect === "Y-90 therapy" )
		adminActivity[0].value = 4500;		
	
	updateWidth('GenderSelect');
	updateWidth('AgeSelect');
	updateWidth('ProcedureSelect');
	updateWidth('ActivitySelect');
	updateWidth('ActivitySelect');
	updateWidth('ActivityNucMedInput');
	updateWidth('delayInput');
	updateWidth('numberInput');
	updateWidth('DurationInput');
	updateWidth('ExposureTypeSelect');

	updateResult();
}

	function reccomendedTemplateSelector()
	{
		var activitySelect = document.getElementById("ActivitySelect").value;

		//copyDiv(distance, time, frequency, comment)

        if (activitySelect === "Traveling on public transport same day" ) 
		{
			deleteDiv();
			document.getElementsByClassName("delayInput")[0].value = 2;
			setFirstEntry(0.5, 4, "Single", "Sitting next to passenger on public transport");
		}
        else if (activitySelect === "Traveling on public transport next day" ) 
		{
			deleteDiv();
			document.getElementsByClassName("delayInput")[0].value = 24;
			setFirstEntry(0.5, 6, "Single", "Sitting next to passenger on public transport");
		}
        else if (activitySelect === "Staff performing procedure - same day" ) 
		{
			deleteDiv();
			document.getElementsByClassName("delayInput")[0].value = 4;
			setFirstEntry(0.1, 0.5, "Single", "Close contact biopsy, catheter, ultrasound etc");
		}
        else if (activitySelect === "Staff performing procedure - next day" ) 
		{
			deleteDiv();
			document.getElementsByClassName("delayInput")[0].value = 24;
			setFirstEntry(0.1, 0.5, "Single", "Close contact biopsy, catheter, ultrasound etc");
		}
        else if (activitySelect === "ICU Staff" ) 
		{
			deleteDiv();
			document.getElementsByClassName("delayInput")[0].value = 0;
			setFirstEntry(1, 8, "5 Day Week", "Close contact biopsy, catheter, ultrasound etc");
		}
        else if (activitySelect === "General Ward Staff" ) 
		{
			deleteDiv();
			document.getElementsByClassName("delayInput")[0].value = 0;
			setFirstEntry(0.5, 0.5, "5 Day Week", "Close contact biopsy, catheter, ultrasound etc");
			copyDiv(1, 0.5, "5 Day Week", "In same room near patient, feeding, obs, etc");
			copyDiv(5, 7, "5 Day Week", "In ward doing other activities");
		}
        else if (activitySelect === "coworker" ) 
		{
			deleteDiv();
			document.getElementsByClassName("delayInput")[0].value = 0;
			setFirstEntry(1, 8, "5 Day Week", "Sitting / standing next to person, close desk work");
		}
        else if (activitySelect === "Partner, where partner (or patient) goes to work" ) 
		{
			deleteDiv();
			document.getElementsByClassName("delayInput")[0].value = 0;
			setFirstEntry(0.5, 8, "Repeat", "Sleeping same bed");
			copyDiv(2, 4, "Repeat", "Near each other in house, same room activities");
			copyDiv(3, 4, "Repeat", "In house different room activities");
		}
        else if (activitySelect === "Partner, where patient is at home with them" ) 
		{
			deleteDiv();
			document.getElementsByClassName("delayInput")[0].value = 0;
			setFirstEntry(0.5, 8, "Repeat", "Sleeping same bed");
			copyDiv(1, 1, "Repeat", "Near each other in house, sitting adjacent couch");
			copyDiv(2, 4, "Repeat", "Sitting at table, same room activities");
			copyDiv(3, 4, "Repeat", "In house different room activities");
			copyDiv(5, 7, "Repeat", "In house far away activities");
		}		
        else if (activitySelect === "Children, where patient is at home with them" ) 
		{
			deleteDiv();
			document.getElementsByClassName("delayInput")[0].value = 0;
			setFirstEntry(0.1, 1, "Repeat", "Bathing, cleaning, comforting");
			copyDiv(0.5, 1, "Repeat", "Aiding in feeding, clothing, close play");
			copyDiv(2, 4, "Repeat", "Sitting at table, same room activities");
			copyDiv(3, 2, "Repeat", "Supervised activities at a distance");
			copyDiv(5, 8, "Repeat", "Sleeping different room");
		}
       else if (activitySelect === "Next day public transport long distance" ) 
		{
			deleteDiv();
			document.getElementsByClassName("delayInput")[0].value = 24;
			setFirstEntry(0.5, 24, "Single", "Siting next to passenger");
		}	
       else if (activitySelect === "3 day delay public transport long distance" ) 
		{
			deleteDiv();
			document.getElementsByClassName("delayInput")[0].value = 72;
			setFirstEntry(0.5, 24, "Single", "Siting next to passenger");
		}

		
		updateResult();
	}

//This is for displaying the PDF in line

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.pdfLink').forEach(function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            var pdfPath = link.getAttribute('data-pdf');
            var targetId = link.getAttribute('data-target');
            var closeButtonId = link.getAttribute('data-close');
            var pdfViewer = document.getElementById(targetId);
            var closeButton = document.getElementById(closeButtonId);
            pdfViewer.src = pdfPath;
            pdfViewer.style.display = 'block';
            closeButton.style.display = 'inline';
        });
    });

    document.querySelectorAll('.closeButton').forEach(function(button) {
        button.addEventListener('click', function() {
            var targetId = button.getAttribute('id').replace('closeButton', 'pdfViewer');
            var pdfViewer = document.getElementById(targetId);
            pdfViewer.style.display = 'none';
            pdfViewer.src = '';
            button.style.display = 'none';
        });
    });
});
	