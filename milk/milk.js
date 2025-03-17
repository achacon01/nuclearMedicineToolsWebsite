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

//This variable holds the data about the radiopharmaceutical for the dose calculation
let radiopharmaceuticalData = {name:  '', arpansa: '', eHalfLife: 0, eDosePerMBq:0, gammaConstant:0 };


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



function getRadiopharmaceuticalData(radiopharmaceutical)
{
	radiopharmaceutical.gammaConstant = 1.49E-5; //For Tc99m to stop repeating code

	switch(radiopharmaceutical.name)
	{
		case "F18 FDG": 
			radiopharmaceutical.arpansa = "1 hour for 400 MBq"; 
			radiopharmaceutical.eHalfLife = 1.8;
			radiopharmaceutical.eDosePerMBq = 6.7E-4;
			radiopharmaceutical.gammaConstant = 9.2E-5; //changing the constant for F18

			break;
		
		case "Tc99m MIBI": 
			radiopharmaceutical.arpansa = "4 hours for 400 MBq rest + 1100 MBq stress "; 
			radiopharmaceutical.eHalfLife = 5.4;
			radiopharmaceutical.eDosePerMBq = 9.0E-5;
			break;
			
		case "Tc99m aerosol or Technegas": 
			radiopharmaceutical.arpansa = "40 MBq Not Required"; 
			radiopharmaceutical.eHalfLife = 0;
			radiopharmaceutical.eDosePerMBq = 0;			
			break;
		
		case "Tc99m DMSA": 
			radiopharmaceutical.arpansa = "185 MBq Not Required"; 
			radiopharmaceutical.eHalfLife = 0;
			radiopharmaceutical.eDosePerMBq = 0;						
			break;
		
		case "Tc99m DTPA": 
			radiopharmaceutical.arpansa = "500 MBq Not Required"; 
			radiopharmaceutical.eHalfLife = 3.5;
			radiopharmaceutical.eDosePerMBq = 2.2E-5;									
			break;
		
		
		case "Tc99m MAA": 
			radiopharmaceutical.arpansa = "200 MBq Not Required"; 
			radiopharmaceutical.eHalfLife = 4.0;
			radiopharmaceutical.eDosePerMBq = 7.7E-3;									
			break;
			
			
		case "Tc99m MAG3": 
			radiopharmaceutical.arpansa = "350 MBq 13 hours."; 
			radiopharmaceutical.eHalfLife = 4.2;
			radiopharmaceutical.eDosePerMBq = 1.4E-4;												
			break;
		
		case "Tc99m MDP": 
			radiopharmaceutical.arpansa = "900 MBq 1 hours."; 
			radiopharmaceutical.eHalfLife = 3.6;
			radiopharmaceutical.eDosePerMBq = 5.2E-5;															
			break;
		
		case "Tc99m pertechnetate": 
			radiopharmaceutical.arpansa = "200 MBq 6 hours."; 
			radiopharmaceutical.eHalfLife = 3.4;
			radiopharmaceutical.eDosePerMBq = 1.9E-2;															
			break;
		
		default : 
			radiopharmaceutical.arpansa = "unknown"
			radiopharmaceutical.eHalfLife = 9999999;
			radiopharmaceutical.eDosePerMBq = 9999999;	
	}
	
	return;
}

function calculate()
{
	radiopharmaceuticalData.name =  document.inputForm.radiotracer.value;
	getRadiopharmaceuticalData(radiopharmaceuticalData); //getting the data about the radioPharmaceutical
	
	const inputActivity = document.inputForm.activity.value; // in MBq
	
	const babyFeedTime = 0.5; //in hours, the time it takes for the baby to feed
	const distanceBabyMother = 0.1; //in meters
	const distanceCorrectedGammaConstant = radiopharmaceuticalData.gammaConstant / Math.pow(0.1,1.5);//I am using the 1.5 power rule as the baby is very close to the mother
	const delayTime = document.inputForm.delayTime.value; //the time between administration and first feed
	const effectiveHalfLife = radiopharmaceuticalData.eHalfLife; //in hours
	
	var babyDoseFromMilk = inputActivity * Math.pow(0.5,delayTime/effectiveHalfLife) * radiopharmaceuticalData.eDosePerMBq; //The activity input * effective dose per MBq
	var babyDoseContant = 0.0; //mSv 

	for (let houri = 100; houri >= 0 + delayTime ; houri-=4) //starting
	{
		
		var MothersCurrentMBq = inputActivity * Math.pow(0.5, houri / effectiveHalfLife);
		babyDoseContant += MothersCurrentMBq * distanceCorrectedGammaConstant * babyFeedTime;
	} 
	
	var totalBabyDose = babyDoseFromMilk + babyDoseContant;
	var doseString = '';
	if (totalBabyDose*1000<=1)
	{
		doseString = "< 1 \u03BCSv";
	}
	else if (totalBabyDose*1000>1 && totalBabyDose*1000 <1000)
	{
		doseString = Math.round(totalBabyDose*1000) + " \u03BCSv";
	}		
	else
	{
		doseString = totalBabyDose.toFixed(2) + " mSv";
	}
	
	
	document.resultsForm.effectiveDose.value =  doseString ;
	document.resultsForm.ARPANSACeasTime.value  = radiopharmaceuticalData.arpansa;

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









