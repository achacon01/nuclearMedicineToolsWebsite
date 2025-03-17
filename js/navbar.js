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


//For management of the stylesheets to add or remove them
function removeStylesheet(href) 
{
    // Find the existing <link> element
    var links = document.getElementsByTagName('link');
    for (var i = 0; i < links.length; i++) {
        if (links[i].href && links[i].href.indexOf(href) !== -1) {
            // Remove the <link> element from the DOM
            links[i].parentNode.removeChild(links[i]);
            break; // Stop loop once the stylesheet is removed
        }
    }
}
function addStylesheet(href) 
{
   var link = document.createElement('link');
   link.rel = 'stylesheet';
   link.href = href;
   document.head.appendChild(link);
}




///This is to add the title back onto the page if uploaded to sharepoint manually when it 
//gets striped out
document.title = document.querySelector('meta[name="custom-title"]').getAttribute('content');

//Looks for when the page has loaded then executes the code
//This makes the nice looking drop down menus	
document.addEventListener('DOMContentLoaded', function() 
{
    // the navbar css code
    addStylesheet('css/navbar.css');
	var dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(function(dropdown) 
	{
        dropdown.addEventListener('click', function(event) 
		{
            event.stopPropagation();
            this.classList.toggle('is-active');
        });
    });

    document.addEventListener('click', function() 
	{
        dropdowns.forEach(function(dropdown) 
		{
			dropdown.classList.remove('is-active');
        });
    });
});

//Adding the dropdown menu.
document.addEventListener("DOMContentLoaded", function() 
{
	//This is the actual code, you could paste this into each calling file
	const navbarHTML = `
	<h3 style="text-align:center;"> Do NOT link to this website. Download and host your own copy. This is a demo for evaluation only, and subject to change at any time. </h3>
		<nav class="container-fluid">
			<ul class="navbar">
				<li class="dropdown">
					<a href="index.html" class="dropbtn">Home</a>
					</div>
				</li>
				<li class="dropdown">
					<a href="#" class="dropbtn">Calculators</a>
					<div class="dropdown-content">
						<a href="flow.html">Flow rate</a>
						<a href="constants.html">Physics Constants</a>
						<a href="units.html">Units Conversion</a>
					</div>
				</li>
				<li class="dropdown">
					<a href="#" class="dropbtn">Waste</a>
					<div class="dropdown-content">
						<a href="waste.html">Label</a>
					</div>
				</li>
				<li class="dropdown">
					<a href="#" class="dropbtn">Tech Tools</a>
					<div class="dropdown-content">
						<a href="bmi.html">BMI Calculator</a>
						<a href="Decay.html">Decay Calculator</a>
						<a href="Activity.html">Activity</a>
						<a href="GFR.html">GFR</a>
						<a href="volume.html">Volume Draw</a>

					</div>
				</li>
				<li class="dropdown">
					<a href="#" class="dropbtn" onClick="toggleDropdown()">Physics Tools</a>
					<div class="dropdown-content">
						
					
						<div class="secure" id="hidden">
							<a href="discharge.html">Patient Discharge</a>
							<a href="radiopharmaceuticalDose.html">Radiopharmaceutical Organ Dose</a>
							<a href="extravasation.html">Extravasation</a>
							<div class="right-menu-item">
								<a href="#">Urgent Calculations</a>
								<div class="right-menu">
									<a href="exposure.html">Exposure calculator</a>
									<a href="milk.html">Baby breast milk</a>
									<a href="AdministeredActivity.html">Administered Activity</a>
								</div>
								<a href="index.html" onClick="logout()">Logout</a>						

							</div
						</div>
					</div>
				</li>
			</ul>
		</nav>
    `;
	//Actually putting it into the calling source file.
    document.getElementById("navbar-container").innerHTML = navbarHTML;
	updateLinkEndings();
});


// Function to update link endings based on the current URL .html is normal, .aspx is for sharepoint
function updateLinkEndings() 
{
    // Get the current URL
    const currentUrl = window.location.href;
    
    // Determine the desired ending
    let newEnding = '';
    if (currentUrl.includes('.aspx')) {
        newEnding = '.aspx';
    } else if (currentUrl.includes('.html')) {
        newEnding = '.html';
    }
    
    // If no specific ending is needed, return
    if (!newEnding) {
        return;
    }

    // Get all links on the page
    const links = document.querySelectorAll('a');

    // Update each link's href to end with the desired ending
    links.forEach(link => {
        let href = link.getAttribute('href');
        if (href) {
            // Remove current ending if it exists
            href = href.replace(/(\.aspx|\.html)$/, '');
            // Append the new ending
            link.setAttribute('href', href + newEnding);
        }
    });
}

//////Handels the loading of the other functionality of the website ///////////
//Checks if a script is loaded and if it is not loaded will load it
function loadScript(url) 
{
    // Check if the script is already loaded
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) 
	{
        if (scripts[i].src === url) {
            console.log('Script already loaded:', url);
            return; // Exit the function to prevent reloading
        }
    }

    // If not loaded, create and append the script
    var script = document.createElement('script');
    script.src = url;
    script.type = 'text/javascript';
    document.head.appendChild(script);
   // console.log('Script loaded:', url);
}

loadScript('js/footer.js');
loadScript('js/security.js');
loadScript('js/database.js');
loadScript('externaljs/crypto-js.js');
loadScript('js/favicon.js');

