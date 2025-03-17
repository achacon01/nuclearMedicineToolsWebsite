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
const timeout = 60; // minutes for the cookie logout
const passwordHASH = "569cd2f50924f69e3e845556bb21b99db68b63e10d1619ab2b2c37a20b6da3fb"; 
var isAuthenticated = 0; //This is the fix for mobile as it breaks it if you click on the dropdown list

/////////////////////////


 //////////////////////////////////////////////
// This is for the cookie management of the hidden webpages

function setCookie(name, value, minutes) 
{
    const date = new Date();
    date.setTime(date.getTime() + (minutes * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
	
	var cookieName= "";
	
	//Giving the right cookie depending if using http or https
	if (location.protocol === 'https:') 
	{
		cookieName = name + "=" + value + ";" + expires + ";path=/;SameSite=None;Secure";
	} else if (location.protocol === 'http:') 
	{
		console.log("using http cookie");
		cookieName = name + "=" + value + ";" + expires + ";path=/";
	} 
	else 
	{	
		//we dont know the protocol, trying http cookie
		cookieName = name + "=" + value + ";" + expires + ";path=/";
	}

    //document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=None;Secure"; //if the website is hosted on https use this
	document.cookie = cookieName; //if the website is not hosted on https use this
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(nameEQ) === 0) 
		{
            return c.substring(nameEQ.length, c.length);
        }
    }
    return "";
}

//Shows the extra options in the physics drop down menu
async function toggleDropdown() 
{
	if (isAuthenticated === 0) //this is the fix for mobile as you have to click on the header to see the drop down list
	{
		const dropdown = document.getElementById("hidden");
		const isDropdownVisible = dropdown.classList.toggle("show");
		if (isDropdownVisible) 
		{
			if ( await authenticate() === 1) 
			{
				addStylesheet("css/show.css");
				isAuthenticated = 1;
				setCookie("dropdownVisible", "true", timeout); // cookie expires in 0.25 minutes
				//If login successfull need to timeout the bar to hide it again
				setTimeout( () => 
				{
					removeStylesheet("css/show.css");
					isAuthenticated = 0;
				}, timeout * 60 * 1000); // in minutes the stored is in millisecond		
			}
			else 
			{
				alert("Incorrect password. Access denied.");
			}
		} 
		else 
		{
			setCookie("dropdownVisible", "false", -1); // Expire the cookie
			removeStylesheet("css/show.css"); //hiding the file
		}
	}
}

//This is used to make sure when you load the webpage, the hidden files are hidden
document.addEventListener("DOMContentLoaded", (event) => 
{
	
    const isDropdownVisible = getCookie("dropdownVisible");
    if (isDropdownVisible === "true") 
	{
	  addStylesheet("css/show.css");
    }
	else
	{
		removeStylesheet("css/show.css")
	}
});

//Cleares the cookie and rehides the elements
function logout()
{
	setCookie("dropdownVisible", "false", -1);
	removeStylesheet("css/show.css")
}

//window.onload = onLoadFunction;
window.addEventListener('load', onLoadFunction);
window.addEventListener('pageshow', pageShowFunction);
var passwordChecked = 0;
function pageShowFunction() //used to prevent using a cached viewing
{
	if (passwordChecked === 0) //ony triggers is viewing a cached page
	{	
		//console.log("I am here 0");
		onLoadFunction();
	}
	else
	{
		//console.log("I am here 1");
		passwordChecked = 0;
	}
	
}

//security function to restrict access to physics
//window.onload = async function() 
async function onLoadFunction()
{
	passwordChecked = 1;
	
	const currentPage = window.location.href;
	
	//List of pages to run secuity on
	let pagePatterns = ["exposure","discharge", "radiopharmaceuticalDose", "milk", "AdministeredActivity", "extravasation" ];
    
	//figure out if we are using .html or .aspx
	var urlEnding = '';
	if (currentPage.includes('.aspx')) {
        urlEnding = '.aspx';
    } else if (currentPage.includes('.html')) {
        urlEnding = '.html';
    }
	
	pagePatterns = pagePatterns.map(pagePatterns => pagePatterns + urlEnding);	//adding the appropriate ending to the url
	
	

    for (let pattern of pagePatterns) 
	{
		if (currentPage.includes(pattern)) //checking if the html matches the linked html
		{
			
			removeStylesheet("css/show.css");
			
			const isDropdownVisible = getCookie("dropdownVisible");
			//console.log(getCookie("dropdownVisible"));
			if (isDropdownVisible === "true") 
			{
				//do nothing because the person is authenticated
				isAuthenticated = 1;
				addStylesheet("css/show.css");
			}
			else
			{

				if (await authenticate() === 1) //means the user successfully authenticated
				{
					addStylesheet("css/show.css"); //turning the visibility on
					setCookie("dropdownVisible", "true", timeout); // cookie expires in minutes
				}
				else //incorrect password. Redirecting to index
				{   
					const currentPage = window.location.href;
	
					//figure out if we are using .html or .aspx
					var urlEnding = '';
					if (currentPage.includes('.aspx')) 
					{
						urlEnding = '.aspx';
					} else if (currentPage.includes('.html')) 
					{
						urlEnding = '.html';
					}
					const redirectPage = "index" + urlEnding;
					console.log(redirectPage);
					alert("Incorrect password. Access denied.");
					window.location.href = redirectPage;
				}
				
			}
	
        	break; // Stop checking further once a match is found
        }
    }
}


	
	/////////////// For password prompt /////////////
	//This a custom prompt as I dont want to use the inbuilt prompt because the
	//prompt shows the text and I want the password hidden
function passwordPrompt(text) 
{
	
	
	//getting the browser to set the popup to dark or light mode. It doesnt work with the css for some reason
	const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
    
	var width = 200;
    var height = 300;
    var pwprompt = document.createElement("div");
    pwprompt.id = "password_prompt";
	pwprompt.style.position = "fixed";
    pwprompt.style.left = "50%";
    pwprompt.style.transform = "translateX(-50%)"; // Center horizontally
	pwprompt.style.width = width + "px";
    pwprompt.style.height = height + "px";
    pwprompt.style.top = "20px"; // Adjust top position as needed
	//pwprompt.style.background = "#fff";
	pwprompt.classList.add("passwordDiv"); // I now handle the background using this class, left the other code in if I want to change in the future
	
	var pwtext = document.createElement("div");
    pwtext.innerHTML = text;

    pwprompt.appendChild(pwtext);

    var pwinput = document.createElement("input");
    pwinput.id = "password_id";
    pwinput.type = "password";
    pwprompt.appendChild(pwinput);

    var pwokbutton = document.createElement("button");
    pwokbutton.innerHTML = "ok";
    pwprompt.appendChild(pwokbutton);

    var pwcancelb = document.createElement("button");
    pwcancelb.innerHTML = "cancel";
    pwprompt.appendChild(pwcancelb);

    document.body.appendChild(pwprompt);

    pwinput.focus();

    return new Promise(function(resolve, reject) {
        function handleButtonClicks(e) {
            if (e.target.tagName !== 'BUTTON') { return; }
            pwprompt.removeEventListener('click', handleButtonClicks);
            if (e.target === pwokbutton) {
                resolve(pwinput.value);
            } else {
                reject(new Error('User cancelled'));
            }
            document.body.removeChild(pwprompt);
        }

        function handleEnter(e) {
            if (e.keyCode == 13) {
                resolve(pwinput.value);
                document.body.removeChild(pwprompt);
            } else if (e.keyCode == 27) {
                document.body.removeChild(pwprompt);
                reject(new Error("User cancelled"));
            }
        }

        pwprompt.addEventListener('click', handleButtonClicks);
        pwinput.addEventListener('keyup', handleEnter);
    });
}

//This function checks if the password is input correctly, 1 if correct 0 otherwise
async function authenticate() 
{
    var password;
    try {
        password = await passwordPrompt("Enter the Physics Password");

        password = encryptString(password); 
        if (password === passwordHASH) 
		{
            return 1;
        } else 
		{
            return 0;
        }
    } catch(e) 
	{
        console.log("Error: ", e);
        return 0;
    }
}	


//Used to encrypt a string
function encryptString(string) 
{
    return CryptoJS.SHA256(string).toString(CryptoJS.enc.Hex);
}