//Add event listener to bound tilt input
document.getElementById('inp-tilt').addEventListener('change', function () {
    let el = document.getElementById('inp-tilt');
    console.log(el.value);
    if (el.value > 90) { el.value = 90;} 
    else if (el.value < 0) { el.value = 0;}
});

//Add event listener to bound azimuth input
document.getElementById('inp-azimuth').addEventListener('change', function () {
    let el = document.getElementById('inp-azimuth');
    if (el.value > 359) { el.value = 359;} 
    else if (el.value < 0) { el.value = 0; }
});

//Add event listener to bound inverter quantity
document.getElementById("inverter-quantity").addEventListener('change', function () {
    let el = document.getElementById("inverter-quantity");
    if (el.value < 0) { el.value = 0;}
})

//Add event listener to bound battery quantity
document.getElementById("battery-quantity").addEventListener('change', function () {
    let el = document.getElementById("battery-quantity");
    if (el.value < 0) { el.value = 0;}
})

const solarDetailsChbox = document.getElementById("solar-details");
//Show/Hide optional solar details when solar details checkbox value changes
solarDetailsChbox.addEventListener("change", function () {
    if (solarDetailsChbox.checked) {
        document.getElementById('tilt-azimuth').style.display = 'inline-block';
    } else {
        document.getElementById('tilt-azimuth').style.display = 'none';
    }
})

//Set up event listener for slider that updates text for solar array
document.getElementById("solar-array-slider").addEventListener("input", function () {
    console.log("Reached");
    let el = document.getElementById("solar-array-slider");
    let kWVal = Math.round(parseInt(el.value) * 0.43);
    document.getElementById("solar-array-panels").innerHTML = el.value + " panels";
    document.getElementById("solar-array-kws").innerHTML = kWVal.toString() + " kW";
    updateBatterySystemText(kWVal);

});

//Set up event listener for eflex vs evault max drpdown to update battery type and count
document.getElementById("battery-options").addEventListener('change', function () {
    let el = document.getElementById("solar-array-slider");
    let kWVal = Math.round(parseInt(el.value) * 0.43);
    if (document.getElementById('battery-options').value == 'eVault Max') {
        document.getElementById('battery-quantity').value = Math.ceil(document.getElementById('battery-quantity').value * 5.4 / 18.5);
    } else {
        document.getElementById('battery-quantity').value = Math.ceil(document.getElementById('battery-quantity').value * 18.5 / 5.4);
    }
    updateBatterySystemText(kWVal);
});

//Set up event listener for eflex vs evault max drpdown to update battery type and count
document.getElementById("battery-quantity").addEventListener('change', function () {
    let el = document.getElementById("solar-array-slider");
    let kWVal = Math.round(parseInt(el.value) * 0.43);
    updateBatterySystemText(kWVal);
});

//Set up event listener to update text when slider gets updated
document.getElementById('battery-array-slider').addEventListener('input', function () {
    let battSelection = document.getElementById('battery-options');
    let battSlider = document.getElementById('battery-array-slider');
    document.getElementById('battery-array-panels').innerHTML = battSlider.value.toString() + " " +  battSelection.value + "s";
    if (battSelection.value == 'eFlex') {
        document.getElementById('battery-array-kwhs').innerHTML = Math.round(battSlider.value * 5.4 , 1).toString() + " kWh";
    } else if (battSelection.value == 'eVault Max') {
        document.getElementById('battery-array-kwhs').innerHTML = Math.round(battSlider.value * 18.5, 1).toString() + " kWh";
    }
})

//Function update battery text next to battery slider
function updateBatterySystemText(kWVal) {
    let battSelection = document.getElementById('battery-options');
    let quantity = parseInt(document.getElementById('battery-quantity').value); 
    let minimumBatts = 0;
    if (battSelection.value == "eFlex") {
        while (kWVal > 5.4 * minimumBatts) {
            minimumBatts++;
        }
    } else if (battSelection.value == "eVault Max") {
        while (kWVal > 18.5 * minimumBatts) {
            minimumBatts++;
        }
    } 
    let batteryString = minimumBatts.toString();
    if (quantity > minimumBatts) {
        batteryString = quantity.toString();
    }
    //document.getElementById('battery-system-text').innerHTML = "Your Fortress Battery system needs to be comprised of: " + batteryString + " " +  battSelection.value + "s";
    document.getElementById('battery-array-panels').innerHTML = batteryString + " " +  battSelection.value + "s";
    //Update Slider
    document.getElementById('battery-array-slider').value = parseInt(batteryString);
    //Update kwh text
    if (battSelection.value == 'eFlex') {
        document.getElementById('battery-array-kwhs').innerHTML = Math.round(parseInt(batteryString) * 5.4 , 1).toString() + " kWh";
    } else if (battSelection.value == 'eVault Max') {
        document.getElementById('battery-array-kwhs').innerHTML = Math.round(parseInt(batteryString) * 18.5, 1).toString() + " kWh";
    }
}