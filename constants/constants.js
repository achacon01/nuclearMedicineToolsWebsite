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

//For populating the drop down menus
document.addEventListener('DOMContentLoaded', function() 
{

	//populating the drop down menu
    var dropdown = document.getElementById('dropdown');
    for (var i = 0; i < smithStabin.length; i++) {
        var option = document.createElement('option');
        option.text = smithStabin[i][0]; // Column 1 value
        option.value = i; // Index to reference later
        dropdown.appendChild(option);
    }

	//changing the selected value
    dropdown.addEventListener('change', function() 
	{
        var selectedIndex = this.value; // Get selected index
        
		document.getElementById('exposureConstant').value = smithStabin[selectedIndex][1];
		document.getElementById('HVL').value = smithStabin[selectedIndex][2];
		document.getElementById('TVL').value = smithStabin[selectedIndex][3];
	
    });
});

//This is for displaying the PDF in line
document.addEventListener('DOMContentLoaded', function() 
{
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
	