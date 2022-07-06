import {runUtilityAPI} from './utilityRates-API.js';
import {runPVWattsAPI} from './pvWatts-API.js';
import {showResult} from './script.js';

//Set up references to html elements to add event listeners  
let invQuant = document.getElementById("inverter-quantity");
let invOpt = document.getElementById('inverter-options');
let batteryQuant = document.getElementById("battery-quantity");
let batteryOptions = document.getElementById('battery-options');
let batterySlider = document.getElementById('battery-array-slider');
let solarSlider = document.getElementById('solar-array-slider');

//Add event listener to bound inverter quantity and update solar array slider default val
invQuant.addEventListener('change', function () {
    updateSolarSlider();
})

//Add event listener that updates inverter quantity and solar array slider and text when inverter dropwdown option changes
invOpt.addEventListener('change', function () {
    updateSolarSlider();
});

//Add event listener to bound battery quantity
batteryQuant.addEventListener('change', function () {
    if (batteryQuant.value < 0) { batteryQuant.value = 0;}
    //Bound upper end based on battery type:
    let upperBound;
    if (batteryOptions.value == 'eFlex') {
        upperBound = 16;
    } else if (batteryOptions.value == 'eVault Max') {
        upperBound = 20;
    } else if (batteryOptions.value == 'eSpire') { 
        upperBound = 3;
    }
    if (batteryQuant.value > upperBound) {
        batteryQuant.value = upperBound;
    }
})

//Set up event listener for slider that updates text for solar array
solarSlider.addEventListener("input", function () {
    let kWVal = Math.round(parseInt(solarSlider.value) * 0.43, 1);
    document.getElementById("solar-array-panels").innerHTML = solarSlider.value + " panels, " + kWVal.toString() + " kW";
    //document.getElementById("solar-array-kws").innerHTML = kWVal.toString() + " kW";
    updateBatterySystemText(kWVal);
});

let lastBatteryVal = 1;
//Set up event listener for eflex vs evault max drpdown to update battery type and count
batteryOptions.addEventListener('change', function () {
    let kWVal = Math.round(parseInt(solarSlider.value) * 0.43, 1);
    let currentOption = document.querySelector("option[value='" + batteryOptions.value + "']");
    let battVal = Math.ceil(batteryQuant.value * lastBatteryVal / currentOption.getAttribute('power'));
    let battMax = currentOption.getAttribute('max');
    lastBatteryVal = currentOption.getAttribute('power');
    battVal > battMax ? batteryQuant.value = battMax : batteryQuant.value = battVal;
    batterySlider.max = battMax;
    updateBatterySystemText(kWVal);
});

//Set up event listener for battery quantity to update text
document.getElementById("battery-quantity").addEventListener('change', function () {
    let kWVal = Math.round(parseInt(solarSlider.value) * 0.43);
    updateBatterySystemText(kWVal);
});

//Set up event listener to update text when slider gets updated
document.getElementById('battery-array-slider').addEventListener('input', function () {
    let currentOption = document.querySelector("option[value='" + batteryOptions.value + "']");
    document.getElementById('battery-array-panels').innerHTML = batterySlider.value.toString() + " " +  batteryOptions.value + "s, " +
    Math.round(batterySlider.value * parseFloat(currentOption.getAttribute('power')), 1).toString() + " kWh";
    //document.getElementById('battery-array-kwhs').innerHTML = Math.round(batterySlider.value * parseFloat(currentOption.getAttribute('power')), 1).toString() + " kWh";
    batteryQuant.value = batterySlider.value;
})

//Function determines minimum amount of batteries and updates battery text next to battery slider
function updateBatterySystemText(kWVal) {
    let quantity;
    let minimumBatts; //Counts the minimum number of batteries needed given solar array size
    //Update kwh text
    if (batteryOptions.value == 'eFlex') {
        minimumBatts = Math.ceil(kWVal/5);
        if (minimumBatts > 16) {quantity = 16;} else { quantity = Math.max(batteryQuant.value, minimumBatts) } //set bound on battery number for eFlex
        //document.getElementById('battery-array-kwhs').innerHTML = Math.round(parseInt(batteryString) * 5.4 , 1).toString() + " kWh";
    } else if (batteryOptions.value == 'eVault Max') {
        minimumBatts = Math.ceil(kWVal/12);
        if (minimumBatts > 20) { quantity = 20;} else { quantity = Math.max(batteryQuant.value, minimumBatts) } //set bound on battery number for eVault Max
        //document.getElementById('battery-array-kwhs').innerHTML = Math.round(parseInt(batteryString) * 18.5, 1).toString() + " kWh";
    } else if (batteryOptions.value == 'eSpire') {
        minimumBatts = Math.ceil(kWVal/125);
        if (minimumBatts > 3) { quantity = 3; } else { quantity = Math.max(batteryQuant.value, minimumBatts) } //set bound on battery number for eSpire      
    }
    let currentOption = document.querySelector("option[value='" + batteryOptions.value + "']");
    //document.getElementById('battery-array-kwhs').innerHTML = Math.round(quantity * parseFloat(currentOption.getAttribute('power'))).toString() + " kWh";
    document.getElementById('battery-array-panels').innerHTML = quantity.toString() + " " +  batteryOptions.value + "s, " +
    Math.round(quantity * parseFloat(currentOption.getAttribute('power'), 1)).toString() + " kWh";
    //Update Battery Quantity
    batteryQuant.value = quantity;
    //Update Battery Slider
    batterySlider.value = quantity;
}

//Updates solar slider for inverter listeners
function updateSolarSlider() {
    //Make sure dropwdown has a value
    if (invOpt.value.length == 0) { 
        return;
    }

    if (invQuant.value < 0) { invQuant.value = 0;} //Bound negative input

    //Bound inv quantity depending on inverter type
    //7.6kW and 12kW inverter maximum 12 units
    //125kW inverter maximum 5 units    
    if (invOpt.value == '7.6' || invOpt.value == '12') {
        if (invQuant.value > 12) {
            invQuant.value = 12;
        }
    } else if (invOpt.value == '125') { 
        if (invQuant.value > 5) {
            invQuant.value = 5;
        }
    } 

    //Compute solar kW value based one inverter size and quantity
    let kWVal = Math.round(parseFloat(invOpt.value) * parseFloat(invQuant.value) * 10) /10;
    //Make sure solar array can be no bigger than 130% inverter size
    solarSlider.max = 1.3 * Math.ceil(kWVal / 0.43);
    //Calculate number of panels based on 0.43 kw sized ones
    solarSlider.value =  Math.ceil(kWVal / 0.43);
    //Update text next to solar slider
    document.getElementById("solar-array-panels").innerHTML = solarSlider.value + " panels, " + kWVal.toString() + " kW";
    //document.getElementById("solar-array-kws").innerHTML = kWVal.toString() + " kW";
    //Update battery values as well if battery dropdown filled out
    if (batteryOptions.value.length != 0) {
        updateBatterySystemText(kWVal);
    }
}

export function createUtilityListeners() {
    const buttonVal = document.getElementById("utility-api");
    const zipCodeInp = document.getElementById('zip-code');
    const billInp = document.getElementById('monthly-bill');

    buttonVal.addEventListener("click", function() {
        if (zipCodeInp.value.length != 0 && billInp.value.length != 0) {
            runUtilityAPI();
        }
    });
    
    //Get updating zip code input or bill to recall utility api
    zipCodeInp.addEventListener("change", function() {
        if (zipCodeInp.value.length != 0 && billInp.value.length != 0) {
            runUtilityAPI();
        }
    });
    billInp.addEventListener("change", function() {
        if (zipCodeInp.value.length != 0 && billInp.value.length != 0) {
            runUtilityAPI();
        }
    });
}

export function createPVWattsListeners() {
    //Get updating rate slider to recall solar api
    document.getElementById('kwh-slider').addEventListener('input', function() {
        if (solarSlider.value.length != 0 && batterySlider.value.length != 0) {
            runPVWattsAPI(showResult);
        }
    });

    document.getElementById('residential-rate-inp').addEventListener('change', function() {
        if (solarSlider.value.length != 0 && batterySlider.value.length != 0) {
            runPVWattsAPI(showResult);
        }
    });

    //Set up button listener to call solar api
    document.getElementById('solar-api').addEventListener('click', function() {
        if (solarSlider.value.length != 0 && batterySlider.value.length != 0) {
            runPVWattsAPI(showResult);
        }
    });

    //have solar slider recall solar api recalculting data
    solarSlider.addEventListener('input', function() {
        if (solarSlider.value.length != 0 && batterySlider.value.length != 0) {
            runPVWattsAPI(showResult);
        }
    });

    //have battery slider recall battery api recalculting data
    batterySlider.addEventListener('input', function() {
        if (solarSlider.value.length != 0 && batterySlider.value.length != 0) {
            runPVWattsAPI(showResult);
        }
    });
}