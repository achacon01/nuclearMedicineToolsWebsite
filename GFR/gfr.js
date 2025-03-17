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


//An array to hold the sample and fitted data
let sampleData = {timemm:  [], counts: [] };
let fittedData = {timemm:  [], counts: [] };
let sampleData1 = {timemm:  [], counts: [] };
let sampleData2 = {timemm:  [], counts: [] };




//on mobile devices scales the initial zoom so that the content width fits on the screen. User can zoom in if requried.
document.addEventListener("DOMContentLoaded", function() 
{
	var contentWidth = document.querySelector('main').offsetWidth;
    var deviceWidth = window.innerWidth;
    var scale = deviceWidth / contentWidth;
        
    if (scale < 1) 
	{
        document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=' + scale);
    }
});

//clear the forms from the input
function clearData()
{

	clearFormInputsByName('patient');
	clearFormInputsByName('calibration');
	clearFormInputsByName('study');
	clearFormInputsByName('Samples');
	hideResults();
}

function hideRecordDrop()
{
	document.getElementById('FinddropDown').style.display = 'none';
}


//clears the forms from its input uness it has the class header because I put text in there
// which I do not want to be cleared
function clearFormInputsByName(formName) 
{
    // Get the form by its name attribute
    var form = document.forms[formName];
    
    // Iterate over each element in the form
    for (var i = 0; i < form.elements.length; i++) 
	{
        var element = form.elements[i];
        
        // Skip inputs with the class "header"
        if (element.classList.contains("header")) 
		{
            continue;
        }

        // Check if the element is an input, select, or textarea
        if (element.type === "text" || element.type === "password" || element.type === "email" || element.type === "number" || 
            element.type === "search" || element.type === "tel" || element.type === "url" || element.type === "textarea" || 
            element.type === "date" || element.type === "time" || element.type === "datetime-local") 
		{
            element.value = ""; // Clear the input
        } else if (element.type === "checkbox" || element.type === "radio") 
		{
            element.checked = false; // Uncheck checkboxes and radio buttons
        } else if (element.tagName.toLowerCase() === "select") 
		{
            element.selectedIndex = 0; // Reset select dropdowns
        }
    }
}


var selectedRecord; //will hold the data from the database of the records/s (i.e. patent data) when querried 

//Sets the dropdown menu so that a record can be selected
function displayRecords(records) 
{
    var select = document.getElementById('recordList');
    select.innerHTML = '<option value="">Select a date</option>'; // Clear previous options

    records.forEach(record => {
		
		//formatting the date
		//const date = new date(record.dateentered);
		
        var option = document.createElement('option');
        option.value = record.Id; // Assuming Id is the unique identifier
        option.textContent = record.dateentered; // Assuming Title is a field to display
        select.appendChild(option);
    });
}

// Will search the database based on the user urn
function loadDatabase()
{
	//shouldn't be able to be here if there is no database but if you somehow get here return
	if (useDatabase === false)
		return;
	
	event.preventDefault(); // Prevent the default form submission
	clearFormInputsByName('resultsForm');	
	clearFormInputsByName('patient');
	clearFormInputsByName('calibration');
	clearFormInputsByName('study');
	clearFormInputsByName('Samples');
	hideResults();
	
	
	const URN = document.searchForm.URN.value;
    
	if (URN === "")
	{
		alert ("URN can not be blank");
		return;		
	}
	
	var query = encodeURIComponent(`urn eq ${URN}`);
    var url = `${window.CONSTANTS.sharepointURL}/_api/web/lists/getbytitle('${window.CONSTANTS.GFRDB}')/items?$filter=${query}`;
   
   fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json;odata=verbose',
        },
    })
    .then(response => response.json())
    .then(data => {
        var results = data.d.results;
		if (results.length === 0)
		{
			document.getElementById('FinddropDown').style.display = 'none';
			alert("Patient could not be found");
		}
		else 
		{
            // Display records in dropdown
			document.getElementById('FinddropDown').style.display = 'block';
            displayRecords(results);
        }
    })
    .catch(error => console.error('Error:', error));
}


function toHTMLDate(dateStr)
{
	let date = new Date(dateStr);

// Extract the year, month, and day
let year = date.getUTCFullYear();
let month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
let day = String(date.getUTCDate()).padStart(2, '0');

// Format the date as yyyy-mm-dd
return  `${year}-${month}-${day}`;
	
}

//Loads the selected patient / record into the input.
function loadSelectedRecord() 
{
    var select = document.getElementById('recordList');
    var selectedId = select.value;

    if (selectedId) {
        var url = `${window.CONSTANTS.sharepointURL}/_api/web/lists/getbytitle('${window.CONSTANTS.GFRDB}')/items(${selectedId})`;

        fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json;odata=verbose',
            },
        })
        .then(response => response.json())
        .then(data => 
		{ //Putting the data into a variable
            selectedRecord = data.d; // Store the record data in the variable
			if (selectedRecord.type === "Single")
			{
				document.getElementById('GFRChoiceSingle').checked = true;
				setSingleForm();
			}
			else
			{
				document.getElementById('GFRChoiceMulti').checked = true;
				setMultiForm();
			}
			
			document.getElementById('user').value = selectedRecord.user;
			document.patient.URN.value = selectedRecord.urn;
			document.patient.fName.value = selectedRecord.firstname;
			document.patient.lName.value = selectedRecord.lastname;
			if (selectedRecord.gender === "Male")
			{
				document.getElementById('GenderChoiceMale').checked = true;
			}
			else
			{
				document.getElementById('GenderChoiceFemale').checked = true;
			}
			document.getElementById('dob').value = toHTMLDate(selectedRecord.dob);
			document.patient.height.value = selectedRecord.height;
			document.patient.weight.value = selectedRecord.weight;

			document.calibration.bgc1.value = selectedRecord.waterc1;
			document.calibration.bgc2.value = selectedRecord.waterc2;

			document.calibration.ct1.value = selectedRecord.standardc1;
			document.calibration.ct2.value = selectedRecord.standardc2;

			document.study.iTime.value = selectedRecord.injectiontime;
			document.study.dilution.value = selectedRecord.dilution;
			
			document.study.PtPreMBq.value = selectedRecord.prepatientactivity;
			document.study.PtPostMBq.value = selectedRecord.postpatientactivity;

			document.study.StdPreMBq.value = selectedRecord.prestandardactivity;
			document.study.StdPostMBq.value = selectedRecord.poststandardactivity;

			document.Samples.s1Time.value = selectedRecord.s1time;
			document.Samples.s1c1.value = selectedRecord.s1c1;
			document.Samples.s1c2.value = selectedRecord.s1c2;

			document.Samples.s2Time.value = selectedRecord.s2time;
			document.Samples.s2c1.value = selectedRecord.s2c1;
			document.Samples.s2c2.value = selectedRecord.s2c2;

			document.Samples.s3Time.value = selectedRecord.s3time;
			document.Samples.s3c1.value = selectedRecord.s3c1;
			document.Samples.s3c2.value = selectedRecord.s3c2;

		})
        .catch(error => console.error('Error:', error));
    }
}	

//Shows the load form
function showLoadForm()
{
	clearFormInputsByName('patient');
	clearFormInputsByName('calibration');
	clearFormInputsByName('study');
	clearFormInputsByName('Samples');
	hideResults();
	
	const elements = document.querySelectorAll('.loadDatabase');
	elements.forEach(element => {
		element.style.display = 'block';
	});
}

//hides the results form
function hideResults()
 {
	 	document.getElementById('resultsSection').style.display = 'none';	
		  document.getElementById('myChart').style.display = 'none';


 }
 
//Formats the DOB into a nice format dd mmm yyyy so there is no confusion of when it it
function formatDate(dob) 
{
    //const input = document.getElementById('dob').value;
    if (!dob) {
        return "Error";
    }

    const date = new Date(dob);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-GB', options).replace(/,/g, '');

    return formattedDate;
}


//Linear fitting function using to calculate t0 and other factors in the GFR
function fitLinear(x, y) 
{
    if (x.length !== y.length) {
        throw new Error("Input vectors x and y must have the same length");
    }

    const n = x.length;

    // Calculate the sums
    const sumX = x.reduce((acc, val) => acc + val, 0);
    const sumY = y.reduce((acc, val) => acc + val, 0);
    const sumXY = x.reduce((acc, val, idx) => acc + val * y[idx], 0);
    const sumXSquared = x.reduce((acc, val) => acc + val * val, 0);

    // Calculate the slope (m) and intercept (c)
    const m = (n * sumXY - sumX * sumY) / (n * sumXSquared - sumX * sumX);
    const c = (sumY - m * sumX) / n;

    // Calculate the fitted values and residuals
    const fittedY = x.map(val => m * val + c);
    const residuals = y.map((val, idx) => val - fittedY[idx]);

    // Calculate the sum of squares
    const ssTotal = y.reduce((acc, val) => acc + Math.pow(val - (sumY / n), 2), 0);
    const ssRes = residuals.reduce((acc, val) => acc + Math.pow(val, 2), 0);
    const rSquared = 1 - (ssRes / ssTotal);

    // Calculate additional statistics
    const meanX = sumX / n;
    const meanY = sumY / n;

    // Calculate standard error for the slope
    const seSlope = Math.sqrt(ssRes / (n - 2)) / Math.sqrt(sumXSquared - Math.pow(sumX, 2) / n);

    // Standard error for the intercept
    const seIntercept = seSlope * Math.sqrt(sumXSquared / n);

    // Calculate standard error of the estimate
    const stdErrorEstimate = Math.sqrt(ssRes / (n - 2));

    // Calculate F-statistic
    const ssReg = fittedY.reduce((acc, val, idx) => acc + Math.pow(val - meanY, 2), 0);
    const fStatistic = (ssReg / 1) / (ssRes / (n - 2));

    // Degrees of freedom
    const degreesOfFreedom = n - 2;

    return {
        m: m,
        c: c,
        rSquared: rSquared,
        seSlope: seSlope,
        seIntercept: seIntercept,
        stdErrorEstimate: stdErrorEstimate,
        fStatistic: fStatistic,
        degreesOfFreedom: degreesOfFreedom,
        ssReg: ssReg,
        ssRes: ssRes,
        statistics: x.map((xi, idx) => ({
            x: xi,
            y: y[idx],
            fittedY: fittedY[idx],
            residual: residuals[idx],
            stdError: stdErrorEstimate
        }))
    };
}

//Same as above but exponential fitting
function fitExponential(x, y) 
{
    if (x.length !== y.length) {
        throw new Error("Input vectors x and y must have the same length");
    }

    const n = x.length;

    // Transform y to ln(y)
    const logY = y.map(value => Math.log(Math.abs(value)));

    // Calculate the sums
    const sumX = x.reduce((acc, val) => acc + val, 0);
    const sumLogY = logY.reduce((acc, val) => acc + val, 0);
    const sumXLogY = x.reduce((acc, val, idx) => acc + val * logY[idx], 0);
    const sumXSquared = x.reduce((acc, val) => acc + val * val, 0);

    // Calculate the slope (b) and intercept (A')
    const b = (n * sumXLogY - sumX * sumLogY) / (n * sumXSquared - sumX * sumX);
    const logA = (sumLogY - b * sumX) / n;
    const a = Math.exp(logA);

    // Calculate the fitted values and residuals
    const fittedY = x.map(val => a * Math.exp(b * val));
    const residuals = y.map((val, idx) => val - fittedY[idx]);

    // Calculate the sum of squares
    const ssTotal = y.reduce((acc, val) => acc + Math.pow(val - (sumLogY / n), 2), 0);
    const ssRes = residuals.reduce((acc, val) => acc + Math.pow(val, 2), 0);
    const rSquared = 1 - (ssRes / ssTotal);

    // Calculate additional statistics
    const meanX = sumX / n;
    const meanLogY = sumLogY / n;
    const slope = b;
    const intercept = a;

    // Calculate standard error for the slope
    const seSlope = Math.sqrt(ssRes / (n - 2)) / Math.sqrt(sumXSquared - Math.pow(sumX, 2) / n);

    // Standard error for the intercept
    const seIntercept = seSlope * Math.sqrt(sumXSquared / n);

    // Calculate standard error of the estimate
    const stdErrorEstimate = Math.sqrt(ssRes / (n - 2));

    // Calculate F-statistic
    const ssReg = fittedY.reduce((acc, val, idx) => acc + Math.pow(val - meanLogY, 2), 0);
    const fStatistic = (ssReg / 1) / (ssRes / (n - 2));

    // Degrees of freedom
    const degreesOfFreedom = n - 2;

    return {
        a: a,
        b: b,
        rSquared: rSquared,
        slope: slope,
        intercept: intercept,
        seSlope: seSlope,
        seIntercept: seIntercept,
        stdErrorEstimate: stdErrorEstimate,
        fStatistic: fStatistic,
        degreesOfFreedom: degreesOfFreedom,
        ssReg: ssReg,
        ssRes: ssRes,
        statistics: x.map((xi, idx) => ({
            x: xi,
            y: y[idx],
            fittedY: fittedY[idx],
            residual: residuals[idx],
            stdError: stdErrorEstimate
        }))
    };
}

// long list to reset the backgrounds to transparent
function resetBackgrounds()
{
	document.Samples.s1Time.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.Samples.s2Time.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.study.iTime.style.backgroundColor = 'rgba(255, 0, 0, 0)';
 	document.patient.URN.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.getElementById('user').style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.patient.fName.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.patient.lName.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.getElementById('GenderChoice').style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.patient.dob.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.patient.weight.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.patient.height.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.calibration.bgc1.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.calibration.bgc2.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.calibration.ct1.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.calibration.bgc2.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.study.PtPreMBq.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.calibration.ct2.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.study.PtPostMBq.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.study.dilution.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.Samples.s1c1.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.Samples.s1c2.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.Samples.s2c1.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.Samples.s3c1.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.Samples.s3c2.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.study.StdPostMBq.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.study.StdPreMBq.style.backgroundColor = 'rgba(255, 0, 0, 0)';
	document.Samples.s2c2.style.backgroundColor = 'rgba(255, 0, 0, 0)';

}

//validating the entered data
function validateForm()
{
	
	var GFRString = document.patient.GFRType.value;
	
	
	document.getElementById('Message').value = "";
	document.getElementById('Message').style.display = 'none'; 
	document.getElementById('Message').style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; 

	resetBackgrounds();
  
	const s1Time = hhmm2min(document.Samples.s1Time.value);
	if(document.Samples.s1Time.value.length > 0 && s1Time >= 0) 
	{
		document.Samples.s1Time.value = min2hhmm(s1Time);
	}
	else
	{
		document.getElementById('Message').value = "Invalid time: Sample 1";
		document.getElementById('Message').style.display = 'block';	
		document.Samples.s1Time.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
	}

	console.log(GFRString);
	const s2Time = hhmm2min(document.Samples.s2Time.value);
	if(document.Samples.s2Time.value.length > 0 && s2Time >= 0 && GFRString != "Single") 
	{
		document.Samples.s2Time.value = min2hhmm(s2Time);
	}
	else
	{
		if (GFRString != "Single")
		{
			document.getElementById('Message').value = "Invalid time: Sample 2";
			document.getElementById('Message').style.display = 'block';	
			document.Samples.s2Time.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
			return 0;
		}		
	}



	const s3Time = hhmm2min(document.Samples.s3Time.value);
	if(document.Samples.s3Time.value.length > 0 && s3Time >= 0 && GFRString != "Single") 
	{
		document.Samples.s3Time.value = min2hhmm(s3Time);
	}
	else
	{
		if (GFRString != "Single")
		{
			document.getElementById('Message').value = "Invalid time: Sample 3";
			document.getElementById('Message').style.display = 'block';	
			document.Samples.s3Time.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
			return 0;
		}
	}

	const injectTime = hhmm2min(document.study.iTime.value);
	if(document.study.iTime.value.length > 0 && injectTime >=0) 
	{
		document.study.iTime.value = min2hhmm(injectTime);
	}
	else
	{
		document.getElementById('Message').value = "Invalid time: Injection time";
		document.getElementById('Message').style.display = 'block';	
		document.study.iTime.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
	}


	if (  document.getElementById('user').value.length <=0 )
	{
		document.getElementById('Message').value = "invalid value: User";
		document.getElementById('Message').style.display = 'block';	
		document.getElementById('user').style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
		
	}

	if (document.patient.URN.value.length <=0)
	{
		document.getElementById('Message').value = "invalid value: Patient UR";
		document.getElementById('Message').style.display = 'block';	
		document.patient.URN.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
		
	}
	if (document.patient.fName.value.length <=0)
	{
		document.getElementById('Message').value = "invalid value: Patient fName";
		document.getElementById('Message').style.display = 'block';	
		document.patient.fName.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
		
	}
	if (document.patient.lName.value.length <=0)
	{
		document.getElementById('Message').value = "invalid value: Patient lName";
		document.getElementById('Message').style.display = 'block';	
		document.patient.lName.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
		
	}
	if (document.patient.gender.value != "M" && document.patient.gender.value != "F" )
	{
		document.getElementById('Message').value = "invalid value: Patient gender";
		document.getElementById('Message').style.display = 'block';	
		document.getElementById('GenderChoice').style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
		
	}

	if (document.patient.dob.value == "" )
	{
		document.getElementById('Message').value = "invalid value: Patient dob";
		document.getElementById('Message').style.display = 'block';	
		document.patient.dob.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
		
	}
	
	if (document.patient.height.value <= 10 || document.patient.height.value >= 250 )
	{
		document.getElementById('Message').value = "invalid value: Patient weight";
		document.getElementById('Message').style.display = 'block';	
		document.patient.height.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
		
	}
	if (document.patient.weight.value <= 10 || document.patient.weight.value >= 250 )
	{
		document.getElementById('Message').value = "invalid value: Patient weight";
		document.getElementById('Message').style.display = 'block';	
		document.patient.weight.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
		
	}
	
	if (document.calibration.bgc1.value < 0 )
	{
		document.getElementById('Message').value = "invalid value: background counts 1";
		document.getElementById('Message').style.display = 'block';	
		document.calibration.bgc1.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
	}
	
	if (document.calibration.bgc2.value < 0 )
	{
		document.getElementById('Message').value = "invalid value: background counts 2";
		document.getElementById('Message').style.display = 'block';	
		document.calibration.bgc2.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
	}	

	if (document.calibration.ct1.value <= 0 )
	{
		document.getElementById('Message').value = "invalid value: standard counts 1";
		document.getElementById('Message').style.display = 'block';	
		document.calibration.ct1.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
	}

	if (document.calibration.ct2.value <= 0 )
	{
		document.getElementById('Message').value = "invalid value: standard counts 2";
		document.getElementById('Message').style.display = 'block';	
		document.calibration.ct2.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
	}

	if (document.study.PtPreMBq.value <= 0 )
	{
		document.getElementById('Message').value = "invalid value: Pre patient activity";
		document.getElementById('Message').style.display = 'block';	
		document.study.PtPreMBq.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
	}
	if (document.study.PtPostMBq.value < 0 )
	{
		document.getElementById('Message').value = "invalid value: Post patient activity";
		document.getElementById('Message').style.display = 'block';	
		document.study.PtPostMBq.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
	}

	if (document.study.StdPreMBq.value <= 0 )
	{
		document.getElementById('Message').value = "invalid value: pre Standard activity";
		document.getElementById('Message').style.display = 'block';	
		document.study.StdPreMBq.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
	}
	if (document.study.StdPostMBq.value < 0 )
	{
		document.getElementById('Message').value = "invalid value: pre Standard activity";
		document.getElementById('Message').style.display = 'block';	
		document.study.StdPostMBq.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
	}
	
	if (document.study.dilution.value <= 0 )
	{
		document.getElementById('Message').value = "invalid value: dilution";
		document.getElementById('Message').style.display = 'block';	
		document.study.dilution.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
	}


	if (document.Samples.s1c1.value <= 0 )
	{
		document.getElementById('Message').value = "invalid value: Sample 1 Counts 1";
		document.getElementById('Message').style.display = 'block';	
		document.Samples.s1c1.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
	}
	if (document.Samples.s1c2.value <= 0 )
	{
		document.getElementById('Message').value = "invalid value: Sample 1 Counts 2";
		document.getElementById('Message').style.display = 'block';	
		document.Samples.s1c2.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
	}

	if (document.Samples.s2c1.value <= 0 && GFRString != "Single")
	{
		document.getElementById('Message').value = "invalid value: Sample 2 Counts 1";
		document.getElementById('Message').style.display = 'block';	
		document.Samples.s2c1.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
	}
	if (document.Samples.s2c2.value <= 0 && GFRString != "Single")
	{
		document.getElementById('Message').value = "invalid value: Sample 2 Counts 2";
		document.getElementById('Message').style.display = 'block';	
		document.Samples.s2c2.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
	}
	
	if (document.Samples.s3c1.value <= 0 && GFRString != "Single")
	{
		document.getElementById('Message').value = "invalid value: Sample 3 Counts 1";
		document.getElementById('Message').style.display = 'block';	
		document.Samples.s3c1.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
	}
	
	if (document.Samples.s3c2.value <= 0 && GFRString != "Single")
	{
		document.getElementById('Message').value = "invalid value: Sample 3 Counts 2";
		document.getElementById('Message').style.display = 'block';	
		document.Samples.s3c2.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
		return 0;
	}
	
	return 1;

}



//Calculating the GFR 
function calculate()
{
	if (validateForm() !== 1)
		return;

	var GFRString = document.patient.GFRType.value;


	
	const gender = document.patient.gender.value;

	var AvGFR = 0;//mL/min/(1.73m^2)
	const AvGFRErr = 15; //+- mL/min/(1.73m^2)
	var genderString = "unknown";
	
	if ( gender === "M")
	{
		AvGFR = 125;
		genderString = "Male";
	}
	else if ( gender === "F")	
	{
		AvGFR = 110; 
		genderString = "Female";		
	}	
	
	const PatientDose = parseFloat(document.study.PtPreMBq.value) - parseFloat(document.study.PtPostMBq.value);
	const StandardDose = parseFloat(document.study.StdPreMBq.value) - parseFloat(document.study.StdPostMBq.value);
	const Dilution = parseFloat(document.study.dilution.value);

	const URN = document.patient.URN.value;
	const fName = document.patient.fName.value;
	const lName = document.patient.lName.value;
	const dob = document.patient.dob.value;
	const weight = parseFloat(document.patient.weight.value);
	const height = parseFloat(document.patient.height.value);

	const s1Time = hhmm2min(document.Samples.s1Time.value);
	const s1c1 = parseFloat(document.Samples.s1c1.value);
	const s1c2 = parseFloat(document.Samples.s1c2.value);
	const avs1 = (s1c1 + s1c2)/2.0;

	const injectTime = hhmm2min(document.study.iTime.value);
	const bgAverage = (parseFloat(document.calibration.bgc1.value) + parseFloat(document.calibration.bgc2.value) )/2.0;
	const StdAverageBgdCor = (parseFloat(document.calibration.ct1.value) + parseFloat(document.calibration.ct2.value) )/2.0 - bgAverage;

	sampleData.counts[0] = avs1 - bgAverage;
	sampleData.timemm[0] = s1Time - injectTime - 1.0;
	

	//if (document.patient.gender.value === "Multi")
	

		const s2Time = hhmm2min(document.Samples.s2Time.value);
		const s2c1 = parseFloat(document.Samples.s2c1.value);
		const s2c2 = parseFloat(document.Samples.s2c2.value);
		const avs2 = (s2c1 + s2c2)/2.0;

		const s3Time = hhmm2min(document.Samples.s3Time.value);
		const s3c1 = parseFloat(document.Samples.s3c1.value);
		const s3c2 = parseFloat(document.Samples.s3c2.value);
		const avs3 = (s3c1 + s3c2)/2.0;


		
		sampleData.counts[1] = avs2 - bgAverage;
		sampleData.timemm[1] = s2Time - injectTime - 1.0;
		
		sampleData.counts[2] = avs3 - bgAverage;
		sampleData.timemm[2] = s3Time - injectTime - 1.0;


		const result = fitExponential(sampleData.timemm, sampleData.counts);
		
		fittedData.timemm = sampleData.timemm;
		fittedData.counts[0] = result.a*Math.exp(result.b*fittedData.timemm[0]);
		fittedData.counts[1] = result.a*Math.exp(result.b*fittedData.timemm[1]);
		fittedData.counts[2] = result.a*Math.exp(result.b*fittedData.timemm[2]);
		

		sampleData1.counts[0]=s1c1;
		sampleData1.counts[1]=s2c1;
		sampleData1.counts[2]=s3c1;

		sampleData2.counts[0]=s1c2;
		sampleData2.counts[1]=s2c2;
		sampleData2.counts[2]=s3c2;

		sampleData1.timemm = fittedData.timemm;
		sampleData2.timemm = fittedData.timemm;

		let lnSampleData = [Math.log(sampleData.counts[0]), Math.log(sampleData.counts[1]), Math.log(sampleData.counts[2])];
		const linResult = fitLinear(sampleData.timemm, lnSampleData);


		const plasmacCount_T0 = result.a; //the y intercept of the exponential fit
		const plasmaCountError_T0 = linResult.seIntercept   * plasmacCount_T0;
		//const plasmaCountError_T0 = result.seIntercept;
		
		const plasmaCount_Thalf = -1.0*Math.log(2)/result.b;
		const plasmaCountError_Thalf = Math.abs(linResult.seSlope/linResult.m)*plasmaCount_Thalf;
		
		const volDist_mL = StdAverageBgdCor * Dilution * PatientDose /( plasmacCount_T0 * StandardDose);
		const excv_perc = volDist_mL/1000.0/weight*100;
		const BSA = 0.007184 * Math.pow(weight,0.425)*Math.pow(height,0.725);
		
		const GFR =  volDist_mL * Math.log(2)/plasmaCount_Thalf;
		const GFR_sqm = GFR / BSA; // (mL/min)/m2
		const GFR_ave_sqm = GFR * (1.73 / BSA); //(mL/min)/(1.73 m2)
		const GFR_bm_corr = 0.991778 * GFR_ave_sqm - 0.001218 * Math.pow(GFR_ave_sqm,2); //Brochner-Mortensen (1972) correction
		
		
		const GFR_gender_corr = GFR_ave_sqm / AvGFR * 100.0;
		const GFR_gender_bm_corr = GFR_bm_corr / AvGFR* 100.0;
	
	

	
	///////////////////////    Single Time POint ////////////////////////////////////////////
	//Calculation of single time point.
	//This is not displayed but is used for storage
	
	const bsa_single = 0.024265*Math.pow(weight,0.5378)*Math.pow(height,0.3964);
	
	//D:S*va
	const dsv = (PatientDose / StandardDose)*Dilution;
	const CPM_Admin = dsv*StdAverageBgdCor;
	const halflifeCorr =  Math.pow(0.5, sampleData.timemm[0] / (10000.0 * 60.0) )
	const CPM_Admin_calc = StdAverageBgdCor * Dilution * PatientDose / StandardDose * halflifeCorr;
	const Vapp = CPM_Admin_calc / sampleData.counts[0];
	const Vapp_norm = Vapp / 1000.0 * (1.73/bsa_single);
	
	const GFR_single =((5862.0 + 1282.0 * bsa_single + 15.5 * sampleData.timemm[0] ) * Math.log(Vapp_norm) - (11297.0 + 4883.0 * bsa_single + 41.94 * sampleData.timemm[0] )) / sampleData.timemm[0]; 
	const GFR_single_sqm = GFR_single / bsa_single;
	const GFR_single_ave_sqm = GFR_single * (1.73 / bsa_single);
	const GFR_single_gender_corr = GFR_single_ave_sqm / AvGFR * 100.0;
	
	const GFR_single_BMCOR = 1.0004*GFR_single-0.00146*Math.pow(GFR_single,2);
	const GFR_single_gender_bm_corr = GFR_single_BMCOR / AvGFR* 100.0;
	
		console.log(`bsa_single ${bsa_single}`);

	console.log(`bgAverage ${bgAverage}`);
	console.log(`sampleData.counts[0]  ${sampleData.counts[0]}  `);
	console.log(`Stime  ${sampleData.timemm[0]} `);
	console.log(`Vapp  ${Vapp} Vapp_norm   ${Vapp_norm}  `);
	console.log(`GFR Single  ${GFR_single} GFR single BM cor   ${GFR_single_BMCOR} GFR 1.73 ${GFR_single_ave_sqm} `);
	
	
	//So that I can easily access this to export it to database
	global_bsa_single = bsa_single;
	global_dsv = dsv;
	global_CPM_Admin = CPM_Admin;
	global_halflifeCorr = halflifeCorr;
	global_CPM_Admin_calc = CPM_Admin_calc;
	global_Vapp = Vapp;
	global_Vapp_norm = Vapp_norm;
	global_GFR_single = GFR_single;
	global_GFR_single_BMCOR= GFR_single_BMCOR;
	
	
	
	/*
	Debugging output
	console.log(`
  Plasma Count (T0): ${plasmacCount_T0}
  Plasma Count Error (T0): ${plasmaCountError_T0}
  Plasma Count (T1/2): ${plasmaCount_Thalf}
  Plasma Count Error (T1/2): ${plasmaCountError_Thalf}

  Volume Distribution (mL): ${volDist_mL}
  Excretion Volume Percentage: ${excv_perc}%
  Body Surface Area (BSA): ${BSA}

  Glomerular Filtration Rate (GFR): ${GFR}
  GFR per Square Meter (GFR/m2): ${GFR_sqm}
  GFR Average per Square Meter (GFR_ave/m2): ${GFR_ave_sqm}
  GFR Brochner-Mortensen Corrected: ${GFR_bm_corr}

  GFR Gender Corrected: ${GFR_gender_corr}%
  GFR Gender BM Corrected: ${GFR_gender_bm_corr}%
`);
	*/
	
	
	/////////// This is for the results div putting the output to display nicely //////////////////
	
	document.results.ptName.value = fName + " " + lName.toUpperCase();
	document.results.ur.value = URN;
	document.results.dob.value = formatDate(dob);
	
	document.results.waterBg1.value = document.calibration.bgc1.value;
	document.results.waterBg2.value = document.calibration.bgc2.value;
	document.results.waterBgAve.value = Math.round(bgAverage);
	
	document.results.std1.value = document.calibration.ct1.value ;
	document.results.std2.value = document.calibration.ct2.value;
	document.results.stdave.value = Math.round(StdAverageBgdCor);	
	
	document.results.plasma1ct1.value = s1c1;
	document.results.plasma1ct2.value = s1c2;
	document.results.plasma1ave.value = Math.round(avs1);
	document.results.plasma1time.value = fittedData.timemm[0];

	if ( GFRString != "Single")
	{
		document.results.plasma1fit.value = Math.round(result.a*Math.exp(result.b*fittedData.timemm[0]));

		document.results.plasma2ct1.value = s2c1;
		document.results.plasma2ct2.value = s2c2;
		document.results.plasma2ct2.value = s2c2;
		document.results.plasma2ave.value = Math.round(avs2);
		document.results.plasma2fit.value = Math.round(result.a*Math.exp(result.b*fittedData.timemm[1]));
		document.results.plasma2time.value = fittedData.timemm[1];

		document.results.plasma3ct1.value = s3c1;
		document.results.plasma3ct2.value = s3c2;
		document.results.plasma3ct2.value = s3c2;
		document.results.plasma3ave.value = Math.round(avs3);
		document.results.plasma3fit.value = Math.round(result.a*Math.exp(result.b*fittedData.timemm[2]));
		document.results.plasma3time.value = fittedData.timemm[2];
		document.results.T0.value = Math.round(plasmacCount_T0) + " \261 " + Math.round(plasmaCountError_T0);
		document.results.T12.value = Math.round(plasmaCount_Thalf) + " \261 " + Math.round(plasmaCountError_Thalf);
		document.results.BSA.value = BSA.toFixed(2);
		document.results.EVC.value = Math.round(volDist_mL) + "      " + Math.round(excv_perc) +"%";

	}
	else
	{
		document.results.BSA.value = bsa_single.toFixed(2);
		
		//blanking out the values if changed from multi to Single
		document.results.plasma1fit.value = "";

		document.results.plasma2ct1.value = "";
		document.results.plasma2ct2.value = "";
		document.results.plasma2ct2.value = "";
		document.results.plasma2ave.value = "";
		document.results.plasma2fit.value = "";
		document.results.plasma2time.value = "";

		document.results.plasma3ct1.value = "";
		document.results.plasma3ct2.value = "";
		document.results.plasma3ct2.value = "";
		document.results.plasma3ave.value = "";
		document.results.plasma3fit.value = "";
		document.results.plasma3time.value = "";
		document.results.T0.value = "";
		document.results.T12.value = "";
		document.results.EVC.value = "";

		
		
	}

	document.results.syringeStandardPre.value = document.study.StdPreMBq.value;
	document.results.syringeStandardPost.value = document.study.StdPostMBq.value;
	document.results.syringeStandardGiven.value = StandardDose.toFixed(1);

	document.results.syringePtPre.value = document.study.PtPreMBq.value;
	document.results.syringePtPost.value = document.study.PtPostMBq.value;
	document.results.syringePtGiven.value = PatientDose.toFixed(1);
	
	document.results.resHeight.value = height;
	document.results.resWeight.value = weight;
	document.results.resDilution.value = Dilution;




	document.results.gender.value = genderString;
	document.results.genderValue.value = AvGFR + " \261 " + AvGFRErr +  " L/min/(1.73m²)";


	if ( GFRString != "Single")
	{
		document.results.nonBMCorrected.value = GFR.toFixed(2);
		document.results.nonBMCorrected_GFRm.value = GFR_sqm.toFixed(2);
		document.results.nonBMCorrected_GFR173m.value = GFR_ave_sqm.toFixed(2);
		document.results.nonBMCorrected_GFRperc.value = GFR_gender_corr.toFixed(2);

		document.results.BMCorrected_GFR173m.value = GFR_bm_corr.toFixed(2);
		document.results.BMCorrected_GFRperc.value = GFR_gender_bm_corr.toFixed(2);
	}
	else
	{
		document.results.nonBMCorrected.value = GFR_single.toFixed(2);
		document.results.nonBMCorrected_GFRm.value = GFR_single_sqm.toFixed(2);
		document.results.nonBMCorrected_GFR173m.value = GFR_single_ave_sqm.toFixed(2);
		document.results.nonBMCorrected_GFRperc.value = GFR_single_gender_corr.toFixed(2);

		document.results.BMCorrected_GFR173m.value = GFR_single_BMCOR.toFixed(2);
		document.results.BMCorrected_GFRperc.value = GFR_single_gender_bm_corr.toFixed(2);		
		
		
		
	}

	var now = new Date();
	document.results.dateEntered.value = formatDate(now);

	document.results.personEntered.value = document.getElementById('user').value;

	if ( GFRString != "Single")
	{
		makeGraph();
		document.getElementById('canvasDiv').style.display = 'block';	
		document.getElementById('myChart').style.display = 'block';	
	}
	document.getElementById('resultsSection').style.display = 'block';	


	/*
	//more debugging
console.log(`a: ${result.a}, b: ${result.b}, R-squared: ${result.rSquared}`);
console.log(`Slope: ${result.slope}, Intercept: ${result.intercept}`);
console.log(`Standard Error of Slope: ${result.seSlope}, Standard Error of Intercept: ${result.seIntercept}`);
console.log(`Standard Error of Estimate: ${result.stdErrorEstimate}`);
console.log(`F-statistic: ${result.fStatistic}`);
console.log(`Degrees of Freedom: ${result.degreesOfFreedom}`);
console.log(`Sum of Squares of Regression: ${result.ssReg}`);
console.log(`Sum of Squares of Residuals: ${result.ssRes}`);
console.log('Statistics for each point:', result.statistics);



console.log(`Linear fit - m: ${linResult.m}, c: ${linResult.c}, R-squared: ${linResult.rSquared}`);
console.log(`Standard Error of Slope: ${linResult.seSlope}, Standard Error of Intercept: ${linResult.seIntercept}`);
console.log(`Standard Error of Estimate: ${linResult.stdErrorEstimate}`);
console.log(`F-statistic: ${linResult.fStatistic}`);
console.log(`Degrees of Freedom: ${linResult.degreesOfFreedom}`);
console.log(`Sum of Squares of Regression: ${linResult.ssReg}`);
console.log(`Sum of Squares of Residuals: ${linResult.ssRes}`);
console.log('Statistics for each point (Linear):', linResult.statistics);
*/

}

//Formats the string
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



//plotting the graph
function makeGraph()
{

	//if the chart already exists, delete it
	let chartStatus = Chart.getChart("myChart"); // <canvas> id
	if (chartStatus != undefined) 
	{
		chartStatus.destroy();
	}

	//getting pointers to where the chart should be located
	var canvas = document.getElementById('myChart');
	var ctx = document.getElementById('myChart').getContext('2d');

	//Setting the data for graphing
	var x_observed = sampleData.timemm;
	var y_observed = sampleData.counts;

	//this is the limits for the x axis, i.e. first and last value to plot
	// ignore the 1m this variable can be any distance now
	limit1mX = [];
	limit1mX[0] = x_observed[0];
	limit1mX[1] = x_observed[2];

	//setting the Y axis as the discharge limit for this distance
	var limit1mY = [y_observed[0],y_observed[2]];

	// Convert into a format suitable for Chart.js
	//observed data
	var observedData = x_observed.map(function(e, i) {
		return {x: new Date(e), y: y_observed[i]};
	});

	var fittedDataMap = fittedData.timemm.map(function(e, i) {
		return {x: new Date(e), y: fittedData.counts[i]};
	});

	var sampleData1Map = sampleData1.timemm.map(function(e, i) {
		return {x: new Date(e), y: sampleData1.counts[i]};
	});

	var sampleData2Map = sampleData2.timemm.map(function(e, i) {
		return {x: new Date(e), y: sampleData2.counts[i]};
	});



	//setting up the datasets for plotting
	var datasets = 
	[	{
			label: 'Av Observed points',
			data: observedData,
			backgroundColor: 'transparent',
			borderWidth: 2,			
			borderColor:'rgb(255, 99, 132)',
			showLine: false, // Only points for this dataset
			radius: 5,
		}
	]
		datasets.push({
			label: 'Fitted data',
			data: fittedDataMap,
			backgroundColor: 'transparent',
			borderWidth: 2,
			borderColor: 'rgb(54, 162, 235)',
			fill: false,
			showLine: true, // Drawn as a line
			type: 'line', // 'line' type for this dataset
			borderDash: [10,5] // for dashed line
		})

		datasets.push({
			label: 'Sample 1',
			data: sampleData1Map,
			backgroundColor: 'transparent',
			borderColor:  'rgb(0, 255, 0)',
			borderWidth: 2,
			showLine: false, // Only points for this dataset
			radius: 5,
		})
		
		datasets.push({
			label: 'Sample 2',
			data: sampleData2Map,
			backgroundColor: 'transparent',
			borderColor: 'rgba(255, 165, 0,1)',
			borderWidth: 2,
			showLine: false, // Only points for this dataset
			radius: 5,
		})
		
	//making the chart text larger
	Chart.defaults.font.family = 'Arial'; // Set global font family, if needed
	Chart.defaults.font.size = 18; // Set global font size to make it larger
	Chart.defaults.font.weight = 'bold'; // Set global font weight to bold


	//Now plotting the graph
	myChart = new Chart(ctx, 
	{
		type: 'scatter', // Use 'scatter' type to allow combination of line and scatter
		data: 
		{
			datasets: datasets
		},
	
		options: 
		{
			scales: 
			{
				x:
				{ // Define the X-axis as a time scale
				    ticks: 
					{
						maxRotation: 90, // Adjust if you have space issues
						minRotation: 90 // Adjust to improve label readability
					},
					title: 
					{
						display: true,
						text: 'Time (mins)'
					}
				},
				y: 
					{	
						beginAtZero: true,
						title: 
						{
							display: true,
							text: 'Counts'
						}
					}
				},
			plugins: 
			{
				tooltip: 
				{
					mode: 'index',
					intersect: false,
				},
				legend: 
				{
					display: true
				}
			}
		}// end options
	}); //end of graph
}

//Remove the style before printing so that it cna be printed nicely
window.onbeforeprint = () => {
  document.getElementById('myChart').style.display = 'none';
  removeStylesheet('externaljs/pico.css');
};

//add the style css after printing
window.onafterprint = () => {
  document.getElementById('myChart').style.display = '';
  addStylesheet('externaljs/pico.css');
};


//Some random test data so I dont have the enter the values every time
function loadTestData3TimePoint()
{
	setMultiForm();
	
	document.getElementById('user').value = 'Test data 1';
	document.getElementById('dob').value = '2024-07-24';
 
 
	document.patient.URN.value = '1234';
	document.patient.fName.value = 'Test';
	document.patient.lName.value = 'Data';
	document.getElementById('GenderChoiceMale').checked = true;
	document.patient.height.value = 160;
	document.patient.weight.value = 100;


	document.study.StdPreMBq.value = 20.8;
	document.study.StdPostMBq.value = 0.9;
	
	
	document.study.iTime.value = '08:37';
	
	//calibration
	document.calibration.bgc1.value = 26;
	document.calibration.bgc2.value = 41
	
	//standard
	document.calibration.ct1.value = 240000;
	document.calibration.ct2.value = 250000;
	
	document.study.PtPreMBq.value = 140;
	document.study.PtPostMBq.value = 10;

	document.study.dilution.value = 500;

	document.Samples.s1Time.value = '10:37';
	document.Samples.s1c1.value = 22000;
	document.Samples.s1c2.value = 21000;
	
	document.Samples.s2Time.value = '11:36';
	document.Samples.s2c1.value = 15000;
	document.Samples.s2c2.value = 16000;

	document.Samples.s3Time.value = '12:16';
	document.Samples.s3c1.value = 13000;
	document.Samples.s3c2.value = 12000;

	return;
	
}

function loadTestDataSingle()
{
	
	setSingleForm();
	document.getElementById('user').value = 'Test data 1';
	document.getElementById('dob').value = '2024-07-24';
 	document.getElementById('GFRChoiceSingle').checked = true;

 
	document.patient.URN.value = '1234';
	document.patient.fName.value = 'Test';
	document.patient.lName.value = 'Data';
	document.getElementById('GenderChoiceMale').checked = true;
	document.patient.height.value = 150;
	document.patient.weight.value = 110;


	document.study.StdPreMBq.value = 30;
	document.study.StdPostMBq.value = 0;
	
	
	document.study.iTime.value = '10:00';
	
	//calibration
	document.calibration.bgc1.value = 0;
	document.calibration.bgc2.value = 0;
	
	//standard
	document.calibration.ct1.value = 75000;
	document.calibration.ct2.value = 65000;
	
	document.study.PtPreMBq.value = 90;
	document.study.PtPostMBq.value = 0;

	document.study.dilution.value = 500;

	document.Samples.s1Time.value = '11:55';
	document.Samples.s1c1.value = 30000;
	document.Samples.s1c2.value = 31000;
	


	return;
	
}
//Used to talk to the database
function getListMetadata() 
{
    var siteUrl = window.CONSTANTS.sharepointURL;
    var listName = window.CONSTANTS.GFRDB;

    $.ajax({
        url: siteUrl + "/_api/web/lists/getbytitle('" + listName + "')?$select=ListItemEntityTypeFullName",
        type: "GET",
        headers: {
            "Accept": "application/json;odata=verbose"
        },
        success: function (data) {
            alert("List Item Entity Type: " + data.d.ListItemEntityTypeFullName);
        },
        error: function (error) {
            alert("Error fetching metadata: " + JSON.stringify(error));
        }
    });
}

//Connecting to the database
function getRequestDigest() 
{
    var siteUrl = window.CONSTANTS.sharepointURL;
    return $.ajax({
        url: siteUrl + "/_api/contextinfo",
        type: "POST",
        headers: { "Accept": "application/json; odata=verbose" }
    });
}		

//Saving a patients results to the database
function saveToDataBase()
{

	var siteUrl = window.CONSTANTS.sharepointURL;
	
	if ( document.patient.GFRType.value != "Single")
	{
		getRequestDigest().done(function(data) 
		{
			var requestDigest = data.d.GetContextWebInformation.FormDigestValue;
			var listName = window.CONSTANTS.GFRDB;
			var listItemEntityTypeFullName = "SP.Data."+listName+"ListItem";				

			$.ajax({
				url: siteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items",
				type: "POST",
				data: JSON.stringify({
					'__metadata': { 'type': listItemEntityTypeFullName },
					//Input
					'type' : document.patient.GFRType.value,
					'user': document.results.personEntered.value,
					'urn': document.results.ur.value,
					'dateentered' : document.results.dateEntered.value,
					'firstname': document.patient.fName.value,
					'lastname': document.patient.lName.value,
					'gender': document.results.gender.value,
					'dob': document.results.dob.value,
					'height': document.results.resHeight.value,
					'weight' : document.results.resWeight.value,
					'waterc1': document.results.waterBg1.value,
					'waterc2' : document.results.waterBg2.value,
					'standardc1' : document.results.std1.value,
					'standardc2': document.results.std2.value,
					'injectiontime' : document.study.iTime.value,
					'dilution' : document.results.resDilution.value,
					'prepatientactivity' : document.results.syringePtPre.value,
					'postpatientactivity' : document.results.syringePtPost.value,
					'prestandardactivity' : document.results.syringeStandardPre.value,
					'poststandardactivity' : document.results.syringeStandardPost.value,
					's1time' : document.Samples.s1Time.value,
					's1c1' : document.results.plasma1ct1.value,
					's1c2' : document.results.plasma1ct2.value,
					's2time' : document.Samples.s2Time.value,
					's2c1' : document.results.plasma2ct1.value,
					's2c2' : document.results.plasma2ct2.value,
					's3time' : document.Samples.s3Time.value,
					's3c1' : document.results.plasma3ct1.value,
					's3c2' : document.results.plasma3ct2.value,
					
					
					//The results
					'waterave' : document.results.waterBgAve.value,
					'waterstd' : document.results.stdave.value,
					'plasma1ave' : document.results.plasma1ave.value,
					'plasma1fit' : document.results.plasma1fit.value,
					'plasma1time' : document.results.plasma1time.value,
					'plasma2ave' : document.results.plasma2ave.value,
					'plasma2fit' : document.results.plasma2fit.value,
					'plasma2time' : document.results.plasma2time.value,				
					'plasma3ave' : document.results.plasma3ave.value,
					'plasma3fit' : document.results.plasma3fit.value,
					'plasma3time' : document.results.plasma3time.value,
					'syringestandardgiven' : document.results.syringeStandardGiven.value,
					'syringeptgiven' : document.results.syringePtGiven.value,
					'calct0' : document.results.T0.value,
					'calct12' : document.results.T12.value,
					'bsa' : document.results.BSA.value,
					'evc' : document.results.EVC.value,
					'genavgfr' : document.results.genderValue.value,
					'nonbmgfr' : document.results.nonBMCorrected.value,
					'nonbmgfrm' : document.results.nonBMCorrected_GFRm.value,
					'nonbmcorgfr173m' : document.results.nonBMCorrected_GFR173m.value,
					'nonbmgfrperc' : document.results.nonBMCorrected_GFRperc.value,
					'gfrbmcor173m' : document.results.BMCorrected_GFR173m.value,
					'bmcorgfrperc' : document.results.BMCorrected_GFRperc.value, 
					
					
					//for a single timepoint gfr
					'single_bsa' : global_bsa_single,
					'single_dsv' : global_dsv,
					'single_CPM_Admin' : global_CPM_Admin,
					'single_halflifeCorr' : global_halflifeCorr,
					'single_CPM_Admin_calc' : global_CPM_Admin_calc,
					'single_Vapp' : global_Vapp,
					'single_Vapp_norm' : global_Vapp_norm,
					'single_GFR' : global_GFR_single,
					'single_GFR_BMCOR' : global_GFR_single_BMCOR,
					
					
				}),
				headers: {
					"Accept": "application/json;odata=verbose",
					"Content-Type": "application/json;odata=verbose",
					"X-RequestDigest": requestDigest
				},
				success: function (data) {
					alert("Record added successfully!");
				},
				error: function (error) {
					alert("Error adding record: " + JSON.stringify(error));
				}
			});
		}).fail(function(error) {
			alert("Error retrieving request digest: " + JSON.stringify(error));
		});
	}
	else
	{
		getRequestDigest().done(function(data) 
		{
			var requestDigest = data.d.GetContextWebInformation.FormDigestValue;
			var listName = window.CONSTANTS.GFRDB;
			var listItemEntityTypeFullName = "SP.Data."+listName+"ListItem";				

			$.ajax({
				url: siteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items",
				type: "POST",
				data: JSON.stringify({
					'__metadata': { 'type': listItemEntityTypeFullName },
					//Input
					'type' : document.patient.GFRType.value,
					'user': document.results.personEntered.value,
					'urn': document.results.ur.value,
					'dateentered' : document.results.dateEntered.value,
					'firstname': document.patient.fName.value,
					'lastname': document.patient.lName.value,
					'gender': document.results.gender.value,
					'dob': document.results.dob.value,
					'height': document.results.resHeight.value,
					'weight' : document.results.resWeight.value,
					'waterc1': document.results.waterBg1.value,
					'waterc2' : document.results.waterBg2.value,
					'standardc1' : document.results.std1.value,
					'standardc2': document.results.std2.value,
					'injectiontime' : document.study.iTime.value,
					'dilution' : document.results.resDilution.value,
					'prepatientactivity' : document.results.syringePtPre.value,
					'postpatientactivity' : document.results.syringePtPost.value,
					'prestandardactivity' : document.results.syringeStandardPre.value,
					'poststandardactivity' : document.results.syringeStandardPost.value,
					's1time' : document.Samples.s1Time.value,
					's1c1' : document.results.plasma1ct1.value,
					's1c2' : document.results.plasma1ct2.value,

					
					//The results
					'waterave' : document.results.waterBgAve.value,
					'waterstd' : document.results.stdave.value,
					'syringestandardgiven' : document.results.syringeStandardGiven.value,
					'syringeptgiven' : document.results.syringePtGiven.value,
					'bsa' : document.results.BSA.value,
					'genavgfr' : document.results.genderValue.value,
					'nonbmgfr' : document.results.nonBMCorrected.value,
					'nonbmgfrm' : document.results.nonBMCorrected_GFRm.value,
					'nonbmcorgfr173m' : document.results.nonBMCorrected_GFR173m.value,
					'nonbmgfrperc' : document.results.nonBMCorrected_GFRperc.value,
					'gfrbmcor173m' : document.results.BMCorrected_GFR173m.value,
					'bmcorgfrperc' : document.results.BMCorrected_GFRperc.value, 
					
					
					//for a single timepoint gfr
					'single_bsa' : global_bsa_single,
					'single_dsv' : global_dsv,
					'single_CPM_Admin' : global_CPM_Admin,
					'single_halflifeCorr' : global_halflifeCorr,
					'single_CPM_Admin_calc' : global_CPM_Admin_calc,
					'single_Vapp' : global_Vapp,
					'single_Vapp_norm' : global_Vapp_norm,
					'single_GFR' : global_GFR_single,
					'single_GFR_BMCOR' : global_GFR_single_BMCOR,
					
					
				}),
				headers: {
					"Accept": "application/json;odata=verbose",
					"Content-Type": "application/json;odata=verbose",
					"X-RequestDigest": requestDigest
				},
				success: function (data) {
					alert("Record added successfully!");
				},
				error: function (error) {
					alert("Error adding record: " + JSON.stringify(error));
				}
			});
		}).fail(function(error) {
			alert("Error retrieving request digest: " + JSON.stringify(error));
		});		
		
		
		
		
	}
}

function setSingleForm()
{
	document.getElementById('sample2Row').style.display = 'none';
	document.getElementById('sample3Row').style.display = 'none';
	document.getElementById('resPlasma2').style.display = 'none';
	document.getElementById('resPlasma3').style.display = 'none';
	document.getElementById('resPlanaFit').style.display = 'none';	
	document.getElementById('resultsSingleWarning').style.display = 'inline';	
	document.getElementById('confirmationTextSingle').style.display = 'block';	
	
	
	
}

function setMultiForm()
{
	document.getElementById('sample2Row').style.display = '';
	document.getElementById('sample3Row').style.display = '';
	document.getElementById('resPlasma2').style.display = '';
	document.getElementById('resPlasma3').style.display = '';
	document.getElementById('resPlanaFit').style.display = '';	
	document.getElementById('resultsSingleWarning').style.display = 'none';	
	document.getElementById('confirmationTextSingle').style.display = 'none';	

	
}

//Hide the database functionality if there is no database
document.addEventListener('DOMContentLoaded', function() 
{

	if (useDatabase === false)
	{
		document.getElementById('loadDatabaseBttn').style.display = 'none';
		document.getElementById('saveDataBaseBtn').style.display = 'none';

	}
})