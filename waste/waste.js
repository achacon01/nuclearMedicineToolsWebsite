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

var currentDateTimeGlobal = new Date(); //date variable which will hold the predicted end date in date format
var isotopeHalfLifeGlobal = -99.9; // in days!!!!!
var estimatedReleaseDateGlobal = new Date(); //date variable which will hold the predicted end date in date format
var CurrentPeakSurfaceDose = -99.9; // in uSv/hr peak surface dose rate current
const releaseDoseRateGlobal = 0.05; // uSv/hr peak surface dose




// if there is no database we will hide the button
document.addEventListener('DOMContentLoaded', function() 
{
	if (useDatabase === false)
	{
		document.getElementById('saveButton').style.display = 'none';

	}
	else
	{
		document.getElementById('saveButton').style.display = 'block';

	}		
		
})

function needUpdateCalculations()
{
	document.getElementById('checkDate').innerText = "Push calculate";

	document.getElementById('printDateClosed').value = "Need to Update";
	document.getElementById('printIsotope').value = "Need to Update";
	document.getElementById('printName').value = "Need to Update";
	document.getElementById('printCheckOn').value = "Need to Update";
	document.getElementById('printActivity').value = "Need to Update";
	
	document.getElementById('saveButton').style.display = 'none';
	document.getElementById('PrintButton').style.display = 'none';

}

//prints the page. Make sure that the css is in so that it fits to the window.
function printPage() 
{
	//preparePrint();
	setTimeout(function() 
	{
    window.print();
	}, 1000);//adjust delay if chrome still doesn't work
}

//This is used to get the user information to save to the database
function getRequestDigest() 
{	
	//shouldn't be able to get here without a database but if you do will return
	if (useDatabase === false) 
		return;

    var siteUrl = window.CONSTANTS.sharepointURL;
    return $.ajax({
        url: siteUrl + "/_api/contextinfo",
        type: "POST",
        headers: { "Accept": "application/json; odata=verbose" }
    });
}

//used for saving to the database and making sure it is ready
async function getDigest(siteUrl) 
{
	const response = await fetch(siteUrl + "/_api/contextinfo", {
		method: "POST",
		headers: {
			"Accept": "application/json;odata=verbose",
		}
	});
	const data = await response.json();
	return data.d.GetContextWebInformation.FormDigestValue;
}

/*
//debugging to get the database information
function getListMetadata() 
{
    var siteUrl = window.CONSTANTS.sharepointURL;
    var listName = window.CONSTANTS.WASTEDB;

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
*/

		
//This writes to the database
async function writeToDatabase() 
{
	//shouldn't be able to get here without a database but if you do will return
	if (useDatabase === false) 
		return;
	
	var dateReleased = estimatedReleaseDateGlobal;
	var dateClosed = currentDateTimeGlobal;
	var isotope = document.getElementById("isotopeSelect").value;
	var personName = document.getElementById("PersonName").value;
	
	var siteUrl = window.CONSTANTS.sharepointURL;

	getRequestDigest().done(function(data) 
	{
		var requestDigest = data.d.GetContextWebInformation.FormDigestValue;
		var listName = window.CONSTANTS.WASTEDB;
		var listItemEntityTypeFullName = "SP.Data."+listName+"ListItem"; //the database list				

		//the sql to get to the database
        $.ajax({
            url: siteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items",
            type: "POST",
			//data to save to the database, make sure that the names match the database fields
            data: JSON.stringify({
                '__metadata': { 'type': listItemEntityTypeFullName },
                'Name': personName,
                'Isotope': isotope,
                'StoredDateTime': dateClosed,
				'ExpReleaseDate': dateReleased,
				'PeakSurfaceRate': CurrentPeakSurfaceDose,
				'hasBeenReleased': false,

            }),
            headers: {
                "Accept": "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "X-RequestDigest": requestDigest
            },
            success: function (data) {
                alert("Item added successfully!");
            },
            error: function (error) {
                alert("Error adding Item: " + JSON.stringify(error));
            }
        });
    }).fail(function(error) {
        alert("Error retrieving request digest: " + JSON.stringify(error));
    });
}


function updatePeakSurfaceDose()
{
	CurrentPeakSurfaceDose = document.getElementById("currentPeakSurafeDose").value;
	needUpdateCalculations();
}

function updateIsotope()
{
	var selection = document.getElementById("isotopeSelect").value;
	if ( selection === '')
	{
		isotopeHalfLifeGlobal = -999.9;
	}
	else if ( selection === 'Tc99m')
	{
		isotopeHalfLifeGlobal = 6.06/24.0;
	}
	else if ( selection === 'F18')
	{
		isotopeHalfLifeGlobal = 109.0/60.0/24.0;
	}
	else if ( selection === 'Y90')
	{
		isotopeHalfLifeGlobal = 2.66;
	}	
	else if ( selection === 'I131')
	{
		isotopeHalfLifeGlobal = 8;
	}
	else if ( selection === 'Lu177')
	{
		isotopeHalfLifeGlobal = 6.647;
	}
	else if ( selection === 'Ga68')
	{
		isotopeHalfLifeGlobal = 68.0/60.0/24.0;
	}
	else if ( selection === 'Zr89')
	{
		isotopeHalfLifeGlobal = 78.41/60.0/24.0;
	}
	else if ( selection === 'Cu64')
	{
		isotopeHalfLifeGlobal = 12.7/60.0/24.0;
	}
	else if ( selection === 'I124')
	{
		isotopeHalfLifeGlobal = 4.18;
	}		
	else 
	{
		isotopeHalfLifeGlobal = -999.9;
	}	

	needUpdateCalculations();
}

function updateCurrentTime() 
{
    event.preventDefault(); // Prevent the default form submission
    
	const now = new Date();
	currentDateTimeGlobal.setTime(now); //remember to convert to ms
	now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for local time to display properly in the box
    document.getElementById('currentDateTime').value = now.toISOString().slice(0, 16);;
}


function SetTime()
{	
    const dateTimeValue = document.getElementById('currentDateTime').value;
    // Create a Date object from the value
    const NewDateTime = new Date(dateTimeValue);
	currentDateTimeGlobal = NewDateTime;
}

function calculate() 
{
	updateIsotope();
	updatePeakSurfaceDose();

	var estimatedHoldTime = Math.log(releaseDoseRateGlobal / CurrentPeakSurfaceDose )/Math.log(0.5) * isotopeHalfLifeGlobal; //inDays
	
	estimatedReleaseDateGlobal.setTime(currentDateTimeGlobal.getTime() + estimatedHoldTime*24*60*60*1000 + 24*60*60*1000); //remember to convert to ms Plus one day as I am rounding day to get to the next day
	
	document.getElementById('checkDate').innerText = estimatedReleaseDateGlobal.toDateString();
	document.getElementById('printDateClosed').value = formatDate(currentDateTimeGlobal);
	document.getElementById('printIsotope').value = document.getElementById("isotopeSelect").value;
	document.getElementById('printName').value = document.getElementById("PersonName").value;
	document.getElementById('printCheckOn').value = estimatedReleaseDateGlobal.toDateString();
	document.getElementById('printActivity').value = CurrentPeakSurfaceDose + " \u03BCSv/hr";
    
	if (useDatabase != false)
		document.getElementById('saveButton').style.display = 'inline-block';
	
	document.getElementById('PrintButton').style.display = 'inline-block';


}

//get the date to display nicely		
function formatDate(date) 
{
    const day = ("0" + date.getDate()).slice(-2);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);

    return `${day} ${month} ${year} ${hours}:${minutes}`;
}

document.addEventListener('DOMContentLoaded', function() 
{

	if (useDatabase === false)
	{
		document.getElementById('saveButton').style.display = 'none';
	}
})		