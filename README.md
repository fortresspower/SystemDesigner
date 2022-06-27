# SystemDesigner
An app that helps you design a solar/battery system to Fortress Battery product specifications

- script.js file uses the API call data to display processed results 

- pvWatts-API.js takes care of calling the pvWatts solar API with user inputted parameters and also has the function handlePVWattsOutput that 
calculates our energy flow parameters based on the raw DC solar output of the array. 

- utilityRates-API.js takes care of calling the utility rates API with user zip code as input to get their local utilit rate and use that info with 
their monthly electric bill to estimate their consumption.

-listeners.js sets up all the event listeners reponsible for making sure the input values are correct, and most of the listeners for inputs that 
update other inputs when their value changes

-index.html Renders page elements

-styles.css Styles html elements, controls visuals
