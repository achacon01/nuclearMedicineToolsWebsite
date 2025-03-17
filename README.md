# nuclearMedicineToolsWebsite

Nuclear Medicine Tools

Author: Andrew Chacon
Contact: andrew.chacon@austin.org.au
Date: March 17, 2025
Overview

Nuclear Medicine Tools is an open-source, modular website designed to perform a range of nuclear medicine calculations. Built exclusively with HTML, JavaScript, and CSS, it supports various operating systems (Ubuntu, macOS, iPadOS, Windows) and browsers (Chrome, Firefox, Edge, Safari). The tool consolidates key functions into one platform while ensuring high compatibility and ease of use across desktop, tablet, and mobile devices.

    Important: This website is provided as a tool only—it is not a certified medical device. All outputs must be verified by qualified professionals.

Table of Contents

    Features
    Project Aims
    Modules and Tools
        Flow Rate Calculator
        Physics Constants
        Unit Conversion
        Waste Management
        BMI Calculator
        Decay Calculator
        Activity Calculator
        GFR Calculator
        Volume Draw Calculator
        Patient Discharge Calculator
        Population Radiopharmaceutical Dose Calculator
        Urgent Calculations
            Exposure Calculator
            Baby Breast Milk Exposure Calculator
            Administered Activity Calculator
    Current Rollout and Results
    Discussion and Future Development
    References
    License

Features

    Modular Design: Each tool functions independently, allowing you to add, remove, or update modules with ease.
    Responsive Layout: Automatically adjusts to various screen sizes for optimal viewing on desktops, tablets, and mobile devices.
    Light/Dark Mode: Adapts to the user’s browser settings to reduce eye strain.
    Local Processing: All data is processed on the user’s device (except when using database functions), ensuring enhanced data security.
    Optional Database Integration: Provides functionality for saving and retrieving user data (currently implemented for waste management and GFR modules).

Project Aims

The goal of this project is to create a comprehensive and user-friendly website for performing common nuclear medicine calculations. Its modular architecture not only streamlines routine tasks but also paves the way for future expansion, allowing additional features and calculations to be integrated over time.
Modules and Tools
Flow Rate Calculator

Calculates the required delivery time for radiopharmaceuticals by dividing the volume by the desired flow rate—ideal for therapeutic procedures.
Physics Constants

Provides essential physics constants (e.g., gamma constants for F-18 and Tc-99m) and embeds a comprehensive radionuclide information booklet for quick reference.
Unit Conversion

Converts between SI and empirical units for activity, absorbed dose, equivalent dose, and exposure, ensuring consistent and accurate calculations.
Waste Management

Simplifies radioactive waste labeling and logging. The module generates printable waste labels and manages a digital logbook, streamlining compliance with regulatory guidelines.
BMI Calculator

Calculates Body Mass Index (BMI) using standard, lean (James method), and ideal (Devine method) approaches. It also suggests dosing parameters based on the calculated BMI.
Decay Calculator

Determines decayed or undecayed activity of an isotope by applying decay equations that factor in half-life and elapsed time between measurements.
Activity Calculator

Estimates the administered radiopharmaceutical dose by accounting for residual activity in the syringe and applying decay corrections.
Glomerular Filtration Rate (GFR) Calculator

Calculates kidney function using blood sample data (typically at three time points). Includes features to generate detailed GFR reports and optionally save patient data via a database.
Volume Draw Calculator

Helps determine the volume of stock solution required to achieve a desired activity level. All values are converted to Bq internally for consistency.
Patient Discharge Calculator

Estimates safe discharge times for patients after radioisotope therapy by using external dose rate measurements and clearance times as per ARPANSA guidelines.
Population Radiopharmaceutical Dose Calculator

Computes organ and effective doses based on population averages—useful for clinical trials and adjusting protocols for varying age groups.
Urgent Calculations
Exposure Calculator

Provides a rapid, worst-case scenario estimate of effective dose and radiation risk in urgent situations using physical and biological decay factors.
Baby Breast Milk Exposure Calculator

Calculates the estimated effective dose a baby might receive from breast milk following a nuclear medicine procedure, including recommended cessation times for breastfeeding.
Administered Activity Calculator

Assists in determining additional dosing required when an initial radiopharmaceutical administration is interrupted, ensuring an accurate total dose.
Current Rollout and Results

The website is currently implemented in parallel with existing legacy systems at a training facility. Senior staff are using both the new tool and traditional methods simultaneously to ensure accuracy. Any discrepancies are under review, and full deployment is anticipated in early 2025.
Discussion and Future Development

A more detailed documentation can be found in the encloded readme PDF
