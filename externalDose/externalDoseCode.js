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


var observationTimes = []; //will be in the iso format
var observationTimeDiffhour = []; //time difference between the first and nth observation in hours
var observationDoseRates = []; // external dose rate in uSv/hr
var doseRateDischargeLimit = 25.0; //uSv/hr

//these values will be interplolated to make a smooth curve
var predictedFit = []; //this will be an array with the predicted dose rate in uSv/hr
var interplottedHour = []; //this will be an array of the time difference between the 0 and n measurment in hours
var interplottedTime = []; //this will be the time in iso formate of the predicted measurment. 
var fittedEquation = []; // this will be a and b in the equation a*exp(b*time) NOTE: b will be negative since we are dealing with exponential decay
var predictedEndTime = new Date(); //date variable which will hold the predicted end date in date format
var predictedEndTimeHours = [];  //a variable which will hold the predicted end date hours
var gaphUnit = []; //for the graph on the web page will tell the graph to either display in hours or days depending on the estimated finish time
var myChart = []; //used so I can check if the chart exists or has been deleted

var populationFit = []; //same as above, has the fitted exponential decay based on a population (or give) effective half life



//<!-- use so we know how many rows there are -->	
var runningCount =1;

//prints the page. Make sure that the css is in so that it fits to the window.
function printPage() 
{
	preparePrint();
	setTimeout(function() {
    window.print();
}, 1000); // Adjust delay as necessary to make chrome work siggghhhhhh

}
		

// When the drop down menu selects a distance this code will change the discharge limit
function updateDistanceMeasurment()
{
	var selection = document.getElementById("distanceSelect").value;
	if ( selection === '1m')
	{
		doseRateDischargeLimit = 25.0;
	}
	else if ( selection === '2m')
	{
		doseRateDischargeLimit = 9.0;
	}
	else if ( selection === '3m')
	{
		doseRateDischargeLimit = 5.0;
	}
}

// When the drop down list selects a radiopharmaceutical, the population half life is modified to store what the half life should be. Effective half lives are in hours
// change this if you want your site to use different default values 
function updateBiologicalHalfLife()
{
	var selection = document.getElementById("radiopharmaceuticalSelect").value;
	if ( selection === 'Undetermined')
	{
		document.getElementById('popHalfLife').value = 0;
	}
	else if ( selection === 'NaI131')
	{
		document.getElementById('popHalfLife').value = 15.4;
	}
	else if ( selection === 'Lu177PSMA')
	{
		document.getElementById('popHalfLife').value = 2;
	}
}

//updates the data stored in the variable, performs the calculations and displays the graph 
function updateStoredData() 
{
	//linking to the div/s which contain all the data
	// you will get an array of divs
	var allInputs = document.getElementsByClassName('formInputDiv');
	

	//getting all the data from each "measurment" and putting it into the appropriate variables
    for (var i = 0; i < allInputs.length; i++) 
	{	
		var currentTime = document.getElementsByClassName('dateTimeInput')[i].value; //getting the time from the input
		var currentDoseRate1m = document.getElementsByClassName('doseRate1mInput')[i].value; //getting the dose rate

		//storing the time and dose rate
		observationTimes[i] = currentTime;
		observationDoseRates[i] = currentDoseRate1m;
				
		//calculating the difference between this measurment and the first measurment in hours
		var tmpcurrentDate = new Date(currentTime); //converting to the date format
		var tmpFirstDate = new Date(observationTimes[0]); //converting to the date format
		var tmpTimeDifference = new Date(); //just converting the variable, doesnt get used wil be assigned to
		tmpTimeDifference.setTime(tmpcurrentDate.getTime() - tmpFirstDate.getTime()); //difference in time
		tmpTimeDifference = tmpTimeDifference/3600/1000; //remember that date variable is stored in ms in the back end
		
		observationTimeDiffhour[i] = tmpTimeDifference; // assigning the difference in hours to the appropriate variable
	}

	calculatePredicted(); //fits the data to an exponential decay and places the coefficients into the array
	calculateInterplottedFit(); //interplots the data to make the nice line graphs
	makeGraph(); //plot the graph
}

//This function ised to formate the date for the output
function formatDate(date) 
{
    // Days and months arrays for mapping
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Extracting the components of the date
    const day = days[date.getDay()];
    const dateNum = date.getDate();
    const month = months[date.getMonth()];
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Formatting the date and time parts
    const formattedDate = `${day} ${dateNum < 10 ? '0' : ''}${dateNum} ${month}`;
    const formattedTime = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;

    // Combining date and time into the final string
    return `${formattedDate} ${formattedTime}`;
}

//This function will interplote the measurment times and fit the population and expected equations to get a smooth line
// It will also find the predicted discharge time

function calculateInterplottedFit()
{
	
	//This is in hours. It is the amount of time hours from the first measurment until the patient is dischargable.
	//The limit is the the one specified in the drop down list
	var finishTime = Math.log(doseRateDischargeLimit/fittedEquation[0]) / fittedEquation[1]; 
	
	// Calculating the predicted finish time based on the population. NOTE: the minus is because back in the definition of the equation the minus gets 
	// given to the b (a*exp(bx)). So here you need the minus otherwise you get a negative finish time 
	var finishTimePopulation = -1 * Math.log(doseRateDischargeLimit/fittedEquation[0]) / (Math.log(2)/document.getElementById("popHalfLife").value);

	//First obersvation time in the date type
	var tmpFirstDate = new Date(observationTimes[0]);

	//Setting the predicted end time in the date type, for the observed measurments
	predictedEndTime.setTime(tmpFirstDate.getTime() + finishTime*3600*1000); //remember to convert to ms

	//Setting the predicted end time in the date type, for the population measurments
	var predictedEndTimePop = new Date(); 
	predictedEndTimePop.setTime(tmpFirstDate.getTime() + finishTimePopulation*3600*1000); //remember to convert to ms
	
	//putting the discharge time into the result object on the website
    var result = document.getElementById("result");
	result.value = formatDate(predictedEndTime);

	//putting the discharge time into the result object on the website
	document.getElementById('effHalfLife').value = Math.round( -1 * Math.log(2)/fittedEquation[1] *100)/100;
	var finishTimePop = document.getElementById("populationDischarge");

	// Used to check if you are using a population half life. If you are not and just using observed data then we 
	// will adjust the output
	if (document.getElementById('popHalfLife').value > 0)
	{
		finishTimePop.value = formatDate(predictedEndTimePop);
	}
	else
	{
		finishTimePop.value = "Not Applicable";
	}
	
	// ---------- This next preparing for the graphing -----------------------

	// For the discharge time we want calculate which is larger, the population finish time or predicted finish time
	if (finishTimePopulation > finishTime)
		finishTime = finishTimePopulation;	

	// for formating of the graph. day means we will use days on the x axis, hour means we will use hours (for shorter treatments such as Lu177)
	if (finishTime > 24)
		gaphUnit = 'day';
	else
		gaphUnit = 'hour'
	
	//number of points to interplotate between the first and last measurment. 100 seems to be ok
	// but you might need to increase if the patient stays weeks.
	// todo maybe change this variable to be based on the finish time
	const numberToInterplot = 100;
	
	//looping over to calculate the dose rate at each time point
	// the +10 is to extend the predicted dose past the discharge limit as it makes the graph look nicer or could be useful
	for (let i = 0; i <= numberToInterplot + 10; i++)  
	{
		interplottedHour[i] = finishTime * i / numberToInterplot; //calculating the time in hours
		predictedFit[i] = fittedEquation[0] * Math.exp(interplottedHour[i] *fittedEquation[1] ); // calculating the dose rate at this time
	    populationFit[i] = fittedEquation[0] * Math.exp(-1.0 * interplottedHour[i] * Math.log(2) / document.getElementById('popHalfLife').value );

		//getting the time in the date iso format needed for graphing
		var tmpcurrentTime = new Date();
		tmpcurrentTime.setTime(tmpFirstDate.getTime() + interplottedHour[i]*3600*1000); //remember ms
	 	interplottedTime[i] = tmpcurrentTime.toISOString();
	} 	
}


//used to calculate the exponential decay in form y= a*exp(bx)
function calculatePredicted() 
{
	//means that we only have one entry, therefore we will only calculate based on the population
	if (runningCount <= 1)
	{
		fittedEquation[0] = observationDoseRates[0];
		fittedEquation[1] = 0;
		return;
	}

	//Setting up the equation
	xValues = observationTimeDiffhour;
	yValues = observationDoseRates;

	// Simple exponential fitting (basic and naive approach)
	// More complex fitting would require nonlinear regression or optimization libraries
	// but this is a lot of work
	
	let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
	for (let i = 0; i < xValues.length; i++) 
	{
		const logY = Math.log(yValues[i]);
		sumX += xValues[i];
		sumY += logY;
		sumXY += xValues[i] * logY;
		sumXX += xValues[i] * xValues[i];
	}
	//calculating the fit
	const n = xValues.length;
	const b = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
	const a = Math.exp((sumY - b * sumX) / n);

	//storing the data in the appropriate variables
	//console.log (a," * exp(",b ,")");
	fittedEquation[0] = a;
	fittedEquation[1] = b;
}

//deletes the previous entry
function deleteRows(numberRowsDelete) 
{
	//finding all the entries
	let divs = document.querySelectorAll('div');
	
	
	// Iterate over each div and check if its id is 'Chld'
	for (let i = divs.length - 1; i >= 0; i--) //will only delete the last entry
	{
		if (divs[i].id === 'duplicated') 
		{
			divs[i].remove();
		
			//only want to delete one row
			if (numberRowsDelete ==1)
				break; // Exit the loop after removing the last 'duplicated' div
		}
		
	}
	
	//adjusting the running running count, i.e. the number of entries
	if (runningCount > 1 && numberRowsDelete ===1)
	{
		runningCount = runningCount - 1;
	}

	else //only one row so we clear it
	{
		runningCount = 1;
		setFirstEntry();
	}

	//I will delete the graph as the data is now different
	let chartStatus = Chart.getChart("myChart"); // <canvas> id
	if (chartStatus != undefined)
		chartStatus.destroy();

	//Updating the text to say recalculation is necessary
	document.getElementById('effHalfLife').value = "Need to recalculate";
	document.getElementById("populationDischarge").value = "Need to recalculate";
	document.getElementById("result").value = "Need to recalculate";

}	


//set the value of the first row manually
// i.e. it sets it as blank
function setFirstEntry() 
{
	//getting the first entry
	var firstDiv = document.getElementsByClassName('formInputDiv')[0];
	firstDiv.getElementsByClassName('dateTimeInput')[0].value = "";
	firstDiv.getElementsByClassName('doseRate1mInput')[0].value = "";
	firstDiv.getElementsByClassName('CommentInput')[0].value = "";	
	firstDiv.getElementsByClassName('CommentInput')[0].style.width = ((firstDiv.getElementsByClassName('CommentInput')[0].value.length + 10) * 10) + 'px';

}

//creates a new measurment row
function newRow() 
{
	//cloning the row div
    var original = document.getElementById("formInputDiv");
    var clone = original.cloneNode(true); // "deep" clone
    clone.id = "duplicated"; // change the id or other attributes/contents
    
	//incrementing the number of rows
    runningCount = runningCount + 1;
	
	//<!-- Text used for activity number -->
    var labelTxt = 'Measurment ' + runningCount + ':';


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
	var divs = document.getElementsByClassName('formInputDiv');

	
	//setting the blank values and correcting the numbering of activities
	if (divs.length > 0) 
	{
		var lastDiv = divs[divs.length - 1];
		lastDiv.getElementsByClassName('dateTimeInput')[0].value = "";
		lastDiv.getElementsByClassName('dateTimeInput')[0].previousElementSibling.textContent = labelTxt;
		lastDiv.getElementsByClassName('CommentInput')[0].value = "";
		lastDiv.getElementsByClassName('doseRate1mInput')[0].value = "";
		
	}

	//Updating the text to say recalculation is necessary
	document.getElementById('effHalfLife').value = "Need to recalculate";
	document.getElementById("populationDischarge").value = "Need to recalculate";
	document.getElementById("result").value = "Need to recalculate"

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
	var x_observed = observationTimes;
	var y_observed = observationDoseRates;

	var x2_predicted = interplottedTime;
	var y2_predicted = predictedFit;

	//I will use the predicted data for the population fix, this means that the interpolation will be the same
	var y_population = populationFit;

	//this is the limits for the x axis, i.e. first and last value to plot
	// ignore the 1m this variable can be any distance now
	limit1mX = [];
	limit1mX[0] = x_observed[0];

	// If only one value to plot we will go to the population finish time, if not we go to the predicted finish time
	if (runningCount < 2)
		limit1mX[1] = x2_predicted[x2_predicted.length - 1];
	else
		limit1mX[1] = predictedEndTime;

	//setting the Y axis as the discharge limit for this distance
	var limit1mY = [doseRateDischargeLimit,doseRateDischargeLimit];

	// Convert into a format suitable for Chart.js
	//observed data
	var observedData = x_observed.map(function(e, i) {
		return {x: new Date(e), y: y_observed[i]};
	});

	//predicted data
	var lineData = x2_predicted.map(function(e, i) {
		return {x: new Date(e), y: y2_predicted[i]};
	});

	//population data
	var populationData = x2_predicted.map(function(e, i) {
		return {x: new Date(e), y: y_population[i]};
	});

	//line on the graph for discharge limit
	var lineDatalimit1mX = limit1mX.map(function(e, i) {
		return {x: new Date(e), y: limit1mY[i]};
	});

	//setting up the datasets for plotting
	var datasets = 
	[	{
			label: 'Observed points',
			data: observedData,
			backgroundColor: 'rgb(255, 99, 132)',
			showLine: false, // Only points for this dataset
			radius: 5,
		}
	]
	
	if (runningCount > 1) 
		datasets.push({
			label: 'Predicted fit',
			data: lineData,
			borderColor: 'rgb(54, 162, 235)',
			fill: false,
			showLine: true, // Drawn as a line
			type: 'line', // 'line' type for this dataset
		})
		
	datasets.push		
		({
			label: 'Discharge limit',
			data: lineDatalimit1mX,
			borderColor: 'rgb(255, 165, 0)',
			fill: false,
			showLine: true, // This makes the dataset be drawn as a line
			type: 'line', // Specify 'line' type for this dataset
			borderDash: [10,5] // for dashed line
		})
	


	// Conditionally add the 'population fit' dataset
	//only plotting the population fit if it is in use
	if (document.getElementById('popHalfLife').value > 0) 
	{
		datasets.push({
			label: 'Population fit',
			data: populationData,
			borderColor: 'rgb(128, 128, 128)',
			fill: false,
			showLine: true, // Drawn as a line
			type: 'line', // 'line' type for this dataset
		});
	}

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
						//autoSkip: false, // This will ensure all ticks are shown, adjust as needed
						//maxTicksLimit: 200,
						//minTicksLimit: 25,
						maxRotation: 90, // Adjust if you have space issues
						minRotation: 90 // Adjust to improve label readability
					},
					type: 'time',
					time: 
					{
						stepSize: 1,
						parser: 'YYYY-MM-DD HH:mm',
						unit: 'hour', // Adjust this to 'day', 'month', 'year', etc., as needed, I am using a variable to control this
						displayFormats: 
						{
							day: 'eee dd-MMM HH:mm', // Customize the hourly time format (e.g., 'h:mm a' for 12-hour format)
							hour: 'eee dd-MMM HH:mm' // Customize the hourly time format (e.g., 'h:mm a' for 12-hour format)
						},
					},
					title: 
					{
						display: true,
						text: 'Time'
					}
				},
				y: 
					{	
						beginAtZero: true,
						title: 
						{
							display: true,
							text: 'External dose rate \u03BCSv/hr'
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

//window.onbeforeprint = function() {
	function preparePrint(){
	
	    
	
	
    // Check if the print table already exists and create or clear it
    let table = document.querySelector('.print-table');
    if (!table) {
        table = document.createElement('table');
        table.className = 'print-table';
        document.body.appendChild(table); // Append the table if it's newly created
    } else {
        table.innerHTML = ''; // Clear existing content if table already exists
    }
    
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    table.appendChild(thead);
    table.appendChild(tbody);

    // Create the header row
    const headerRow = document.createElement('tr');
    let th = document.createElement('th');
    th.textContent = 'Measurement Number';
    headerRow.appendChild(th);

    // Assuming the first formInputDiv to define the headers
    const firstFormInputs = document.querySelector('.formInputDiv').querySelectorAll('input');
    firstFormInputs.forEach(input => {
        th = document.createElement('th');
        th.textContent = input.name || 'Input'; // Use input name if available
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Iterate over each formInputDiv to create table rows
    const formInputDivs = document.getElementsByClassName('formInputDiv');
    Array.from(formInputDivs).forEach((div, index) => {
        const row = document.createElement('tr');
        let td = document.createElement('td');
        td.textContent = index + 1; // Measurement Number
        row.appendChild(td);

        const inputs = div.querySelectorAll('input');
        var colNum = 1;
		inputs.forEach(input => {
            td = document.createElement('td');
            if (input.type === 'datetime-local') {
                td.textContent = formatDateTime(input.value);
            } else {
                td.textContent = input.value;
            }
			//fixing the column error. I dont know why this happens
			if (colNum <4)
				row.appendChild(td);
			colNum++;
        });

        tbody.appendChild(row);
    });
	
    createBottomTable();
	positionCanvasForPrint();
	
};

function createBottomTable() {
    // Clear or create the bottom table container
    let container = document.querySelector('.bottom-table');
    if (!container) {
        container = document.createElement('div');
        container.className = 'bottom-table';
        document.body.appendChild(container);
    } else {
        container.innerHTML = ''; // Clear existing content
    }

    const inputs = [
        { name: 'result', displayName: 'Estimated discharge time', type: 'datetime-local' },
        { name: 'effHalfLife', displayName: 'Estimated half-life (h)', type: 'number' },
        { name: 'populationDischarge', displayName: 'Estimated population discharge time', type: 'datetime-local' }
    ];

    // Create header row
    const headerRow = document.createElement('div');
    headerRow.className = 'print-table-row';
    inputs.forEach(input => {
        const headerCell = document.createElement('div');
        headerCell.className = 'print-table-cell';
        headerCell.textContent = input.displayName;
        headerRow.appendChild(headerCell);
    });
    container.appendChild(headerRow);

    // Create value row
    const valueRow = document.createElement('div');
    valueRow.className = 'print-table-row';
    inputs.forEach(input => {
        const inputElement = document.querySelector(`input[name="${input.name}"]`);
        const valueCell = document.createElement('div');
        valueCell.className = 'print-table-cell';
        
        // Handle formatting based on input type
        if (inputElement) {
            let valueText = inputElement.value;
            //already converted
			/*if (input.type === 'datetime-local' && valueText) {
                valueText = formatDateTime(valueText);
            } else if (input.type === 'number' && valueText) {
                valueText = parseFloat(valueText).toFixed(2); // Assuming you want to format the number
            }*/
            valueCell.textContent = valueText;
        } else {
            valueCell.textContent = 'N/A';
        }

        valueRow.appendChild(valueCell);
    });
    container.appendChild(valueRow);
}

function positionCanvasForPrint() {
    const originalCanvas = document.getElementById('myChart');
    if (originalCanvas) {
        // Convert canvas to a data URL
        const canvasUrl = originalCanvas.toDataURL();

        // Check if a print version already exists to avoid duplicates
        let printCanvasImg = document.querySelector('.print-canvas');
        if (!printCanvasImg) {
            printCanvasImg = new Image();
            printCanvasImg.className = 'print-canvas';
            document.body.appendChild(printCanvasImg);
        }
/*
        // Set the src of the image to the canvas data URL
        printCanvasImg.src = canvasUrl;

        // Adjust styling to ensure it does not overflow the page width
        //printCanvasImg.style.maxWidth = '100%';
        //printCanvasImg.style.height = 'auto';
		 
//        printCanvasImg.style.pageBreakBefore = 'auto'; // Ensure it's printed at the bottom
//printCanvasImg.style.pageBreakInside = 'avoid';
        // Add a line break before the canvas image for visual separation
        const lineBreak = document.createElement('br');
        printCanvasImg.before(lineBreak);
    */
	
	printCanvasImg.style.display = 'block';
	    // Add a load event listener to the image
    printCanvasImg.onload = function() {
        // Here you can trigger the print process, now that the image is loaded
        console.log('Image loaded, ready to print.');

        // Example: Trigger a custom print function or the browser's print dialog
        // window.print(); // Uncomment this to trigger printing automatically
    };

    // Set the src of the image to the canvas data URL
    printCanvasImg.src = canvasUrl;

    // Commented out styles, as you're handling styles in CSS
    // Adjust styling as needed via CSS

    // Add a line break before the canvas image for visual separation
    const lineBreak = document.createElement('br');
    printCanvasImg.before(lineBreak);
	
	
	}
};

//thank you chrome for making me have to do this
window.onafterprint = function(){
	let printCanvasImg = document.querySelector('.print-canvas');
	printCanvasImg.style.display = 'none'
	
	
	
}

function formatDateTime(dateTimeStr) {
    const date = new Date(dateTimeStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    // Get day name
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[date.getDay()];

    return `${year}-${month}-${day} ${dayName} ${hours}:${minutes}`;
}


