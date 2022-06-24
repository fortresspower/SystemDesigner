//NREL Developer API KEY
let api_key = "WkDNJ5GuHQJROwhr64ZgH4Hxu2fc51d3FlKijtsD"

//Variables store information on HTML elements in the page
let lastDropDownVal;
const zipCodeInp = document.getElementById("zip-code");
const billInp = document.getElementById("monthly-bill");
const solarDetailsChbox = document.getElementById("solar-details");

//Get button to trigger running utility api
const buttonVal = document.getElementById("utility-api");
buttonVal.addEventListener("click", function() {
    if (zipCodeInp.value.length != 0 && billInp.value.length != 0) {
        console.log("RUNNING");
        //Utility Rates API
        let utility_root_url = "https://developer.nrel.gov/api/utility_rates/v3.json?"
        let utility_parameters = "api_key=" + api_key + "&address=" + zipCodeInp.value;
        try {
            fetch(utility_root_url + utility_parameters)
            .then(response => response.json())
            .then(data => handleUtilityResult(data.outputs.residential));
        } catch(e) {
            console.log(e);
        }
    } else {
        console.log("Input missing for API call")
    } 

});

//Set up button listener to call solar api
document.getElementById('solar-api').addEventListener('click', function() {
    runPVWattsAPI();
});

//have solar slider call api again
document.getElementById('solar-array-slider').addEventListener('change', function() {
    runPVWattsAPI();
});

//Run API getting solar data for given location
function runPVWattsAPI() {
    let system_capacity = "1" 
    let module_type = "1"
    let losses = "12"
    let array_type = "1"
    let tilt = document.getElementById('inp-tilt').value.toString();
    let azimuth = document.getElementById('inp-azimuth').value.toString();

    let rootURL = "https://developer.nrel.gov/api/pvwatts/v6.json?"
    let requiredParameters = "api_key="+api_key+"&system_capacity="+system_capacity+"&module_type="+ module_type + "&losses=" + losses + "&array_type=" + array_type + "&tilt=" + tilt + "&azimuth=" + azimuth + "&address=" + zipCodeInp.value + "&timeframe=hourly"
    try {
        fetch(rootURL + requiredParameters)
        .then(response => response.json())
        .then(data => handlePVWattsOutput(data));
    } catch(e) {
        console.log(e);
    }
}


//Function used to process PV Watts return data
function handlePVWattsOutput(data) {
    let systemData = {
        pvOutput: 0,
        solarOutflow: 0,
        amountStored: 0,
        gridOutflow: 0,
        genOutput: 0,
        genDays: 0
    };
    //let averageConsumption = new Array(8760);
    //let pvOutput = new Array(8760);
    let dcData = data.outputs.dc;
    let solarArraySize = document.getElementById('solar-array-slider').value;
    let averageConsumption = document.getElementById('residential-rate-inp').value / 730; //Your average monthly consumption divided by hours in a month to get Kw
    let batterySize = parseInt(document.getElementById('battery-array-kwhs').innerHTML.replace('kWh', ''));

    let pvOutput; //Dc array output hourly
    let solarOutflow; //Flow out of PV
    let amountStored; //Flow to battery
    let gridOutflow; //Flow to grid
    let batteryCapacity = batterySize + dcData[0] - averageConsumption; //Capacity of battery before current hour runs
    let genChargeStart = 0.2; //What battery capactiy to start charging with generator at
    let genSize = 10; //generator charging rate in kW
    let genOutput;

    //Initialize generator output
    if (batteryCapacity/batterySize < genChargeStart) {
        genOutput = genSize;
    } else { genOutput = 0; }

    let lastGeneratorDay;

    //Iterate over all hours of dc solar array output
    for (let i = 1; i < dcData.length; i++) {
        pvOutput = dcData[i] * (solarArraySize / 1000); //Store solar array output data
    
        if (pvOutput - averageConsumption > 0) { 
            solarOutflow = pvOutput - averageConsumption;
        } else { 
            solarOutflow = 0; 
        }

        if (solarOutflow + batteryCapacity > batterySize) {
            amountStored = solarOutflow- (batteryCapacity + solarOutflow - batterySize);
        } else {
            amountStored = solarOutflow;
        }

        gridOutflow = solarOutflow - amountStored;

        if (batteryCapacity + pvOutput + genOutput - averageConsumption) {
            batteryCapacity = batteryCapacity + pvOutput + genOutput - averageConsumption
        } else {
            batteryCapacity = genSize;
        }

        //Generator was run
        if (batteryCapacity/batterySize < genChargeStart) {
            if (lastGeneratorDay == 'undefined') {
                lastGeneratorDay = Math.floor(i/24);
            }
            genOutput = genSize;
            console.log("GENERATOR RAN");
            let currentDay = Math.floor(i/24);
            if (currentDay != lastGeneratorDay) {
                systemData['genDays'] = systemData['genDays'] + 1;
                lastGeneratorDay = currentDay;
            }
        } else { 
            genOutput = 0; 
        }

        systemData['pvOutput'] = systemData['pvOutput'] + pvOutput;
        systemData['solarOutflow'] = systemData['solarOutflow'] + solarOutflow;
        systemData['amountStored'] = systemData['amountStored'] + amountStored;
        systemData['gridOutflow'] = systemData['gridOutflow'] + gridOutflow;
        systemData['genOutput'] = systemData['genOutput'] + genOutput;
    }
    console.log(systemData);
    return systemData;
}

//Function displays the electricity consumptions and sets up event listener for dropdown
function handleUtilityResult(electricRate) {
    let monthlyConsumption = Math.round(billInp.value / electricRate);
    let rateInp = document.getElementById('residential-rate-inp');
    rateInp.value = monthlyConsumption;

    let dropDown = document.getElementById('output-options');
    lastDropDownVal = dropDown.value;
    let slider = document.getElementById('kwh-slider');
    slider.value = monthlyConsumption;

    //Create event listener that updates slider when rate input is changed
    rateInp.addEventListener('change', function () {
        slider.value = rateInp.value;    
    })

    //Create event listener that modifies kwh input based on display option
    dropDown.addEventListener('change', function () {
        let multiplier = 1;
        switch(lastDropDownVal) {
            case 'month':
                if (dropDown.value == 'day') {
                    multiplier = 1/30;
                } else if (dropDown.value == 'year') {
                    multiplier = 12/1000;
                }
                break;
            case 'day':
                if (dropDown.value == 'month') {
                    multiplier = 30;
                } else if (dropDown.value == 'year') {
                    multiplier = 365/1000;
                }
                break;
            case 'year':
                if (dropDown.value == 'month') {
                    multiplier = (1/12)*1000;
                } else if (dropDown.value == 'day') {
                    multiplier = (1/365)*1000;
                }
                break;
          }
          slider.max = multiplier * slider.max;
          rateInp.value = Math.round(multiplier * rateInp.value);
          lastDropDownVal = dropDown.value;
          slider.value = rateInp.value;
    });

    //Create event listener updating input value when slider is modified
    slider.addEventListener('input', function() {
        console.log("Slider value is: " + slider.value);
        rateInp.value = parseInt(slider.value);
    });
 
    document.getElementById('utility-results').style.display = 'block';
    document.getElementById('module-system-information').style.display = 'block';
    document.getElementById('module-fortress-system').style.display = 'block';

}
 
