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
/// For the footer /////////////////////////////

//document.addEventListener('DOMContentLoaded', function() 
{
    // Create the footer element
    const footer = document.createElement('footer');
    footer.id = 'page-footer';
    footer.innerHTML = '© Andrew Chacon and Graeme O\'Keefe. All rights reserved. <a href="#" id="openModal">User License Agreement</a>';

    // Append the footer to the <main> element
    const mainContent = document.querySelector('main');
    mainContent.appendChild(footer);

    // Create the modal element
    const modal = document.createElement('div');
    modal.id = 'licenseModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>User License Agreement</h2>
            <p>This code and associated data were created by Andrew Chacon and Graeme O'Keefe (the "Creators"). By using this code and associated data (the "Software"), you agree to the following terms:</p>
            <ol>
                <li>The Software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement. In no event shall the Creator be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the Software or the use or other dealings in the Software.</li>
                <li>The Software is intended for non-clinical use only. The Creator does not provide any guarantees or assurances regarding the suitability of the Software for medical or clinical purposes. Users assume all responsibility for any application of the Software in any setting.</li>
                <li>Redistribution and use of the Software, with or without modification, are permitted provided that the following conditions are met:
                    <ul>
                        <li>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</li>
                        <li>Proper attribution to the Creator must be provided in all derivative works or reproductions.</li>
                    </ul>
                </li>
                <li>The Creator reserves the right to modify or discontinue the Software at any time without prior notice.</li>
                <li>Any disputes arising from the use of the Software shall be governed by and construed in accordance with the laws of Australia.</li>
            </ol>
            <p>© 2024 Andrew Chacon and Graeme O'Keefe. All rights reserved.</p>
            <button class="modal-close-button">Close</button>
        </div>
    `;

    // Append the modal to the body
    document.body.appendChild(modal);

    // Add event listeners for the modal
    const openModalBtn = document.getElementById('openModal');
    const closeModalSpan = document.querySelector('.close');
    const closeModalButton = document.querySelector('.modal-close-button');

	closeModalButton.classList.add("redBackground");

    // Open the modal
    openModalBtn.onclick = function() {
        modal.style.display = 'block';
    };

    // Close the modal
    closeModalSpan.onclick = function() {
        modal.style.display = 'none';
    };

    // Close the modal using the button at the bottom
    closeModalButton.onclick = function() {
        modal.style.display = 'none';
    };

    // Close the modal if user clicks outside of it
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}
//});