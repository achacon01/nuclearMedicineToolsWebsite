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


//sets the input backgrounds back to being transparent
function resetBackgrounds()
{
    document.getElementById('genderSelectDiv').style.backgroundColor = 'rgba(255, 0, 0, 0)';
    document.getElementById('model').style.backgroundColor = 'rgba(255, 0, 0, 0)';
    document.getElementById('height').style.backgroundColor = 'rgba(255, 0, 0, 0)';
    document.getElementById('weight').style.backgroundColor = 'rgba(255, 0, 0, 0)';
    document.getElementById('resultsForm').style.display = 'block'; 
}

function clear(event) 
{
	resetBackgrounds();
	
}

function clearResults()
{
	document.resultsForm.bmi.value  = "Push calculate";
	document.resultsForm.dose.value = "Push calculate";
	document.resultsForm.time.value = "Push calculate"
	
}

function calculate(event) 
{

	event.preventDefault(); // Prevent the default form submission

	//Checking that the data is correct before performing the calculations
	if(!validateBmi()) //if in error
	{ 
		document.getElementById('Message').style.display = 'block'; 
	    document.getElementById('resultsForm').style.display = 'none'; 
		return; 
	}


	var height = document.bmiForm.height.value;  // height in cm
	var weight = document.bmiForm.weight.value;  // weight in kg
	var gender = document.bmiForm.gender.value;     // gender = 'M' or 'F'
	//var gender = document.querySelector("input[name=sex]:checked").value;
	var model  = document.bmiForm.model.value; // model = 'lean_bm', 'ideal_bm' or 'bmi'

	var m_lean_bm = 1.10 * weight - 128 * Math.pow(weight / (100*height), 2);
	var f_lean_bm = 1.07 * weight - 148 * Math.pow(weight / (100*height), 2);

	var m_ideal_bm = 50.0 + 2.3 * (height/2.54 - 60);  // height in cm -> in
	var f_ideal_bm = 45.5 + 2.3 * (height/2.54 - 60);
		console.log(f_ideal_bm);

	switch (model) 
	{
	  case 'bmi':
		bmi_weight = weight;
		break;
	  case 'ideal_bm':
		bmi_weight = (gender.toUpperCase() == 'M') ? m_ideal_bm : f_ideal_bm;
		break;
	  case 'lean_bm':
		bmi_weight = (gender.toUpperCase() == 'M') ? m_lean_bm : f_lean_bm;
		break;
	}

	var bmi = bmi_weight / Math.pow(height/100.0, 2);
	var dose = 0, time = 0;

	switch(document.bmiForm.isotope.value) 
	{
	  case 'F18':
		if(bmi <= 22)         { dose = "220"; time = 2.0; }
		else if(bmi <= 28)    { dose = "270"; time = 2.0; }
		else if(weight < 77)  { dose = "270"; time = 3.0; }
		else if(weight >= 77) 
		{
			var calc_dose = 3.5 * weight;
			if(calc_dose > 330) calc_dose = 330.0;

			dose = calc_dose.toFixed(0);
			time = 3.0;
		}
		break;
	  
	  case 'Ga68':
		
		if(bmi <= 25) { dose = "111 - 129.5"; time = 2.0; }
		else if(bmi <= 27) { dose = "148 - 166.5"; time = 2.5; }
		else               { dose = "185";         time = 3.0; }
		break;
	  
	  default:
		dose = "100";
		time = 1.0;
		break;
	}
	
	//outputting the values
	document.resultsForm.bmi.value  = bmi.toFixed(1);
	document.resultsForm.dose.value = dose;
	document.resultsForm.time.value = time.toFixed(1);
}


function validateBmi() {
  document.getElementById('Message').value = "";
  document.getElementById('Message').style.display = 'none'; 
  resetBackgrounds();
  
  var height = document.bmiForm.height.value;  // height in cm
  var weight = document.bmiForm.weight.value;  // weight in kg
  var gender = document.bmiForm.gender.value;     // gender = 'M' or 'F'
 // var gender = document.querySelector("input[name=sex]:checked").value;
  var model  = document.bmiForm.model.value; // model = 'lean_bm', 'ideal_bm' or 'bmi'

  if (!(gender == 'M' || gender == 'F')) {
    document.getElementById('Message').value ="validateBMI: invalid gender : " + gender;
    document.getElementById('genderSelectDiv').style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; /* 50% red */

    return false;
  }
  if (!(model == 'lean_bm' || model == 'ideal_bm' || model == 'bmi')) {
    document.getElementById('Message').value = "validateBMI: invalid model : " + model;
    document.getElementById('model').style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; /* 50% red */
	return false;
  }

  if (!(height > 50 && height < 250)) {
    document.getElementById('Message').value = "validateBMI: height = " + height + " : valid range (height > 50 && height < 250)";
    document.getElementById('height').style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; /* 50% red */

	return false;
  }

  if (!(weight > 10 && weight < 200)) {
    document.getElementById('Message').value = "validateBMI: weight = " + weight + " : valid range (weight > 10 && weight < 200)";
    document.getElementById('weight').style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; /* 50% red */

    return false;
  }

  return true;
}







