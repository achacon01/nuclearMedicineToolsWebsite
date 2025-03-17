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

let cpsPerMBq = []; //cps per MBq
let eHalfLife = []; //Effective half life in hours
let cps_1_1 = []; // cps for head 1, timepoint 1
let cps_1_2 = []; // cps for head 2, timepoint 1
let cps_2_1 = []; // cps for head 1, timepoint 2
let cps_2_2 = []; // cps for head 2, timepoint 2
let OlindaConversion = []; // hold the conversion table from Olinda


//*****************-  Importing the source files       -*********************************************************

//Importing all of the data
// All data should be in grams , MBq.h / MBq
let jsFiles = [
	'Tc99m.js',
	'F18.js',
	'Ga68.js'
];

//Adding the path to all the files
jsFiles = jsFiles.map(entry => "extravasation/" + entry);

const loadedScripts = new Set(); //make sure you not loading same script twice

//ability to load scripts in on the fly
function loadJSFiles() 
{
	files = jsFiles;
	files.forEach(file => 
	{
		if (!loadedScripts.has(file)) 
		{
			const script = document.createElement('script');
            script.src = file;
            script.type = 'text/javascript';
            document.head.appendChild(script);
            loadedScripts.add(file);
        }
    });
}
loadJSFiles();




function dataEntry()
{
	document.getElementById('eDose').value = "Push calculate";
	document.getElementById('eActivity').value = "Push calculate";

}

function selectCamera()
{
	var selectedCamera = document.getElementById('Camera').value;
	
	if ( selectedCamera == "NM1" || selectedCamera == "NM3")
		cpsPerMBq = 71;
	else if ( selectedCamera == "NM2" || selectedCamera == "NM4")
		cpsPerMBq = 74;
	else 
		cpsPerMBq = 0;
}

function calculateEHalfLife()
{
    const time1 = document.getElementById('imagingTime1').value;
    const time2 = document.getElementById('imagingTime2').value;
	
	const count1 = document.getElementById('imagingCounts1_1').value;
	const count1_2 = document.getElementById('imagingCounts1_2').value;

	const count2 = document.getElementById('imagingCounts2_1').value;
	const count2_2 = document.getElementById('imagingCounts2_2').value;
	
	const acqTime1 =  document.getElementById('imagingDuration1').value;
	const acqTime2 =  document.getElementById('imagingDuration2').value;
	
	const cps1 = 1.0 * count1 / acqTime1;
	const cps2 = 1.0 * count2 / acqTime2;
	
	
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);

    // Create Date objects
    const date1 = new Date();
    const date2 = new Date();

    date1.setHours(hours1, minutes1, 0); // Set hours and minutes for the first time
    date2.setHours(hours2, minutes2, 0); // Set hours and minutes for the second time

    // Calculate the difference in milliseconds
    const differenceInMs = date2 - date1;

    // Convert milliseconds to hours
    const differenceInHours = differenceInMs / (1000 * 60 * 60);
	
		
	eHalfLife = -1.0 * Math.log( cps2 / cps1  ) / differenceInHours;
	eHalfLife = Math.log(2) / eHalfLife;
	document.getElementById('eHalfLife').value = eHalfLife;
	





}




function updateResTime()
{
	
	const eHalfLife = document.getElementById('eHalfLife').value;
	
	document.getElementById('resTime').value = (eHalfLife / Math.log(2)).toFixed(2);
}


function calculateExtravasation()
{
	let selectedCamera = document.getElementById('Camera').value;
	if ( selectedCamera == "NM1" || selectedCamera == "NM2" || selectedCamera == "NM3" || selectedCamera == "NM4")
		calculateExtravasationSPECT();
	else if ( selectedCamera == "PET1" || selectedCamera == "PET2" || selectedCamera == "PETR" )
		calculateExtravasationPET();
	
	

		

}


function calculateExtravasationPET()
{
	

	const isotope =  document.getElementById('radioisotope').value;


	
	const activityPET = document.getElementById('activiyPET').value / 1E6;
	const resTime = document.getElementById('resTime').value;
	const extravVolume = document.getElementById('volumeExtravasation').value;
	
	let activity = 0;
	
	const eHalfLife = document.getElementById('eHalfLife').value;  //hours
	

	
	//Now decay correcting to the injection time
	const time1 = document.getElementById('timeCalibrated').value;
	const time2 = document.getElementById('imagingTimePET').value;
	

	const [hours1, minutes1] = time1.split(':').map(Number);
	const [hours2, minutes2] = time2.split(':').map(Number);

	// Create Date objects
	const date1 = new Date();
	const date2 = new Date();

	date1.setHours(hours1, minutes1, 0); // Set hours and minutes for the first time
	date2.setHours(hours2, minutes2, 0); // Set hours and minutes for the second time

	// Calculate the difference in milliseconds
	const differenceInMs = date2 - date1;

	// Convert milliseconds to hours
	const differenceInHours = differenceInMs / (1000 * 60 * 60);
	activity = activityPET * Math.pow(2, 1.0 * differenceInHours / eHalfLife);
	document.getElementById('eActivity').value = activity.toFixed(1);
	
	doseConversionFactor = interpolate(OlindaConversion, extravVolume);
	
	
	document.getElementById('eDose').value = (activity * doseConversionFactor * resTime).toFixed(2);
	
	
	
}





function calculateExtravasationSPECT()
{
	
	selectCamera();
	let camera = document.getElementById('Camera').value;

	const isotope =  document.getElementById('radioisotope').value;


	const acqTime1 =  document.getElementById('imagingDuration1').value;
	const acqTime2 =  document.getElementById('imagingDuration2').value;
	
	const count1_1 = document.getElementById('imagingCounts1_1').value;
	const count1_2 = document.getElementById('imagingCounts1_2').value;

	const count2_1 = document.getElementById('imagingCounts2_1').value;
	const count2_2 = document.getElementById('imagingCounts2_2').value;
	
	const resTime = document.getElementById('resTime').value;
	const extravVolume = document.getElementById('volumeExtravasation').value;
	
	let activity = 0;
	
	const attenCoefficent = document.getElementById('attenFactor').value; //cm^-1
	const eHalfLife = document.getElementById('eHalfLife').value;  //hours
	const thickness = document.getElementById('thickness').value; //cm^-1
	
	cps_1_1 = 1.0 * count1_1 / (acqTime1 * 60);
	cps_1_2 = 1.0 * count1_2 / (acqTime1 * 60);
	cps_2_1 = 1.0 * count2_1 / (acqTime2 * 60);
	cps_2_2 = 1.0 * count2_2 / (acqTime2 * 60);
	
	Ig = Math.sqrt( cps_1_1 * cps_1_2 ); //Geometric mean
	
	I = Ig * Math.exp( 0.149 * thickness / 2.0) //in cps
	activity = I / cpsPerMBq; // now in MBq at timepoint 1
	
	//console.log(activity);

	
	//Now decay correcting to the injection time
	const time1 = document.getElementById('timeCalibrated').value;
	const time2 = document.getElementById('imagingTime1').value;
	

	const [hours1, minutes1] = time1.split(':').map(Number);
	const [hours2, minutes2] = time2.split(':').map(Number);

	// Create Date objects
	const date1 = new Date();
	const date2 = new Date();

	date1.setHours(hours1, minutes1, 0); // Set hours and minutes for the first time
	date2.setHours(hours2, minutes2, 0); // Set hours and minutes for the second time

	// Calculate the difference in milliseconds
	const differenceInMs = date2 - date1;

	// Convert milliseconds to hours
	const differenceInHours = differenceInMs / (1000 * 60 * 60);
	activity = activity * Math.pow(2, 1.0 * differenceInHours / eHalfLife)
	
	document.getElementById('eActivity').value = activity.toFixed(1);
	
	doseConversionFactor = interpolate(OlindaConversion, extravVolume);
	
	console.log(doseConversionFactor)
	
	document.getElementById('eDose').value = (activity * doseConversionFactor * resTime).toFixed(2);

}







//interpolates to get the factor for dose conversion factor.
function interpolate(data, xValue) 
{
    // Ensure the data is sorted by x-values (first column)
    data.sort((a, b) => a[0] - b[0]);

    // If xValue is less than the smallest x in the data
    if (xValue <= data[0][0]) {
        return data[0][1];
    }

    // If xValue is greater than the largest x in the data
    if (xValue >= data[data.length - 1][0]) {
        return data[data.length - 1][1];
    }

    // Loop through the dataset to find the two surrounding points
    for (let i = 0; i < data.length - 1; i++) {
        let x1 = data[i][0], y1 = data[i][1];
        let x2 = data[i + 1][0], y2 = data[i + 1][1];

        // Check if xValue lies between x1 and x2
        if (x1 <= xValue && xValue <= x2) {
            // Perform linear interpolation
            let slope = (y2 - y1) / (x2 - x1);
            let yValue = y1 + slope * (xValue - x1);
            return yValue;
        }
    }

    // If no value is found (edge case, shouldn't occur with valid input)
    return null;
}


function updateScannerMenu() 
{
	const radioisotopeMenu = document.getElementById("radioisotope");
    const CameraMenu = document.getElementById("Camera");
	  
	CameraMenu.innerHTML = "<option selected disabled value=''>--Choose--</option>";
	  
	if (radioisotopeMenu.value === "Tc99m") 
	{
        const options = ["NM1", "NM2", "NM3", "NM4"];
        options.forEach(option => {
          const opt = document.createElement("option");
          opt.value = option;
          opt.textContent = option;
          CameraMenu.appendChild(opt);
        });
	
		//showing SPECT class
		const elements = document.querySelectorAll('.spect');
		elements.forEach(element => {
			element.style.display = '';
		})
		//hiding PET class
		const elementsPET = document.querySelectorAll('.pet');
		elementsPET.forEach(elementsPET => {
			elementsPET.style.display = 'none';

		});
	
		if (radioisotopeMenu.value === "Tc99m")
			OlindaConversion = Tc99m;
	
	
	
	
	
	
	
	
	}  
	else if (radioisotopeMenu.value === "F18" || radioisotopeMenu.value === "Ga68") 
	{
        const options = ["PET1", "PET2", "PETR"];
        options.forEach(option => {
          const opt = document.createElement("option");
          opt.value = option;
          opt.textContent = option;
          CameraMenu.appendChild(opt);
        });
	

		const elements = document.querySelectorAll('.spect');
		elements.forEach(element => {
			element.style.display = 'none';
		});
		
		//showing PET class
		const elementsPET = document.querySelectorAll('.pet');
		elementsPET.forEach(elementsPET => {
			elementsPET.style.display = '';
		})

		if (radioisotopeMenu.value === "F18")
			OlindaConversion = F18;
		else if (radioisotopeMenu.value === "Ga68")
			OlindaConversion = Ga68;
	
	}  
}

document.addEventListener('DOMContentLoaded', function() 
{
		const elements = document.querySelectorAll('.spect');
		elements.forEach(element => {
			element.style.display = 'none';	
		})
})
  
	  