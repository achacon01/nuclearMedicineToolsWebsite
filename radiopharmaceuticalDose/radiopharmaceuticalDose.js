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

//Importing all of the data
let jsFiles = [
	'FDG.js',
	'Tc99mMIBIRest.js',
	'Tc99mMIBIExercise.js',
	'Tc99mMDP.js',
	'Tc99mPertechnetate.js',
	'Tc99mMAA.js',
	'Tc99mMAG3.js'
];

//Adding the path to all the files
jsFiles = jsFiles.map(entry => "radiopharmaceuticalDose/" + entry);

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
////////////////////////// For the Table //////////////////////////////////////////
const colHeaders = ['Adult', '15 Year old', '10 Year old', '5 year old', '1 year old'];
const rowHeadersNoSavGlands = ["Adrenals", "Bone surfaces", "Brain", "Breast", "Gallbladder wall", "Stomach wall", "Small intestine wall", "Colon wall", "Upper large intestine wall", "Lower large intestine wall", "Heart wall", "Kidneys", "Liver", "Lungs", "Muscles", "Oesophagus", "Ovaries", "Pancreas", "Red marrow", "Skin", "Spleen", "Testes", "Thymus", "Thyroid", "Urinary bladder wall", "Uterus", "Remaining organs", "Effective dose (mSv)"];
const rowHeaders = ["Adrenals", "Bone surfaces", "Brain", "Breast", "Gallbladder wall", "Stomach wall", "Small intestine wall", "Colon wall", "Upper large intestine wall", "Lower large intestine wall", "Heart wall", "Kidneys", "Liver", "Lungs", "Muscles", "Oesophagus", "Ovaries", "Pancreas", "Red marrow", "Salivary glands", "Skin", "Spleen", "Testes", "Thymus", "Thyroid", "Urinary bladder wall", "Uterus", "Remaining organs", "Effective Dose (mSv)"];
const rowHeadersMAG3 = ["Adrenals", "Bone surfaces", "Brain", "Breast", "Gallbladder wall", "Stomach wall", "Small intestine wall", "Colon wall", "Upper large intestine wall", "Lower large intestine wall", "Heart wall", "Kidneys", "Liver", "Lungs", "Muscles", "Oesophagus", "Ovaries", "Pancreas", "Red marrow", "Skin", "Spleen", "Testes", "Thymus", "Thyroid", "Urinary bladder wall", "Uterus", "Remaining organs", "Effective Dose (mSv) Standard voiding", "Effective Dose (mSv) 1 hour voiding after administration", "Effective Dose (mSv) 0.5 hour voiding after administration"];

function createTableFrom2DArray() 
{
	
	//Add functionality to load the desired tracer only. Can't get it working yet. Oh well ram is cheap

	var dose = document.getElementById('dose').value;
	if (document.getElementById('unitSelect').value === "mCi")
	{
		dose =  dose*37.0;
	}

	var radiotracer = document.getElementById('radiopharmaceutical').value;
	
	var rowHeadersToDisplay = rowHeaders;
	
	switch(radiotracer)
	{
		case "F18 FDG": organDoseData = FDG; rowHeadersToDisplay = rowHeadersNoSavGlands; break;
		case "Tc99m MIBI Rest": organDoseData = Tc99mMIBIRest; break;
		case "Tc99m MIBI Exercise": organDoseData = Tc99mMIBIExercise; break;
		case "Tc99m MDP": organDoseData = Tc99mMDP; rowHeadersToDisplay = rowHeadersNoSavGlands; break;
		case "Tc99m Pertechnetate": organDoseData = Tc99mPertechnetate;  break;
		case "Tc99m MAA": organDoseData = Tc99mMAA; rowHeadersToDisplay = rowHeadersNoSavGlands;  break;
		case "Tc99m MAG3": organDoseData = Tc99mMAG3; rowHeadersToDisplay = rowHeadersMAG3;  break;
	
	}

	//Scaling the data by the dose. Data is in mGy/MBq
	array = organDoseData.map(row => row.map(value => value * dose));

	if (document.getElementById('arrayTable'))// if statement to stop annoying error
	{
		const table = document.getElementById('arrayTable');
		
		// Clear existing table content
		table.innerHTML = '';

		const titleRow = document.createElement('tr');
		const titleCell = document.createElement('th');
		titleCell.colSpan = colHeaders.length + 1; // Span across all columns
		titleCell.textContent = radiotracer + ' Organ Dose (mGy)';
		titleRow.appendChild(titleCell);
		table.appendChild(titleRow);
		
		// Create column headers row
		const headerRow = document.createElement('tr');
		headerRow.appendChild(document.createElement('th')); // Empty corner cell

		colHeaders.forEach(header => {
			const th = document.createElement('th');
			th.textContent = header;
			headerRow.appendChild(th);
		});
		table.appendChild(headerRow);

		// Create table rows with row headers
		array.forEach((row, rowIndex) => {
			const tr = document.createElement('tr');
			
			// Add row header
			const th = document.createElement('th');
			th.textContent = rowHeadersToDisplay[rowIndex];
			tr.appendChild(th);

			// Add row cells
			row.forEach(cell => {
				const td = document.createElement('td');
				td.textContent = cell.toFixed(2); //fixing the values to 2 decimal places
				tr.appendChild(td);
			});
			
			table.appendChild(tr);
		});
	}
}

function clearTable()
{
	if (document.getElementById('arrayTable'))
	{
		const table = document.getElementById('arrayTable');
		// Clear existing table content
		table.innerHTML = '';
	}
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

