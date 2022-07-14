//NREL Developer API KEY
let api_key = "WkDNJ5GuHQJROwhr64ZgH4Hxu2fc51d3FlKijtsD"

const zipCodeInp = document.getElementById("zip-code");

//Run API getting solar data for given location
export function runPVWattsAPI(callBack, coords) {
    console.log(coords);
    // //Wait for lat and long values to be resolved before calling pv watts API
    // runGeoAPI().then(res => coords = res);
    let system_capacity = "1" 
    let module_type = "1"
    let losses = "12"
    let array_type = "1"
    let tilt = document.getElementById('inp-tilt').value.toString();
    let azimuth = document.getElementById('inp-azimuth').value.toString();

    let rootURL = "https://developer.nrel.gov/api/pvwatts/v6.json?"
    let requiredParameters = "api_key="+api_key+"&system_capacity="+system_capacity+"&module_type="+ module_type + "&losses=" + losses + "&array_type=" + array_type + "&tilt=" + tilt + "&azimuth=" + azimuth + "&timeframe=hourly"
    let addressParameters = "&lat=" + coords.lat + "&lon=" + coords.lng;

    try {
        fetch(rootURL + requiredParameters + addressParameters)
        .then(response => response.json())
        .then(data => {
            if(callBack != null){
                callBack(handlePVWattsOutput(data.outputs.dc));
            } else {
                handlePVWattsOutput(data.outputs.dc);
            }
        });
    } catch(e) {
        console.log(e);
    }
}


//Function used to process PV Watts return data
export function handlePVWattsOutput(data) {
    //Initialize object that stores sum of data values as we iterate over all hours
    let systemData = {
        pvOutput: 0,
        solarOutflow: 0,
        amountStored: 0,
        gridOutflow: 0,
        genOutput: 0,
        genDays: 0,
        solarConsumption: 0,
        dcData: data
    };

    //Pull input values user put into webpage
    let solarArraySize = document.getElementById('solar-array-slider').value * 0.43;
    let averageConsumption = parseInt(document.getElementById('module-kwh').getAttribute('consumption')) / 730; //Your average monthly consumption divided by hours in a month to get Kw
    //let batterySize = parseInt(document.getElementById('battery-array-kwhs').innerHTML.replace('kWh', ''));
    let batterySize = parseFloat(document.getElementById('battery-array-panels').innerHTML.split(', ')[1].replace('kWh', ''))
    console.log(batterySize);
    let inverterSize = parseFloat(document.getElementById('inverter-options').value); 
    let inverterQuantity = parseInt(document.getElementById('inverter-quantity').value);


    let pvOutput; //Dc array output hourly
    let solarOutflow; //Flow out of PV
    let amountStored; //Flow to battery
    let gridOutflow; //Flow to grid
    let solarConsumption; //Instant solar consumption
    let batteryCapacity = batterySize + (data[0]* solarArraySize/1000) - averageConsumption; //Capacity of battery before current hour runs
    let genChargeStart = 0.2; //What battery capactiy to start charging with generator at
    let genSize = inverterQuantity * inverterSize; //generator charging rate in kW
    let genOutput; //Power generated from grid

    //Initialize generator output
    if (batteryCapacity/batterySize < genChargeStart) {
        genOutput = genSize;
    } else { genOutput = 0; }

    //Save last day generator was run to only increment generator run days once at most every 24 hours
    let lastGeneratorDay;

    //Iterate over all hours of dc solar array output
    //Continously update systemData object with calculated values in for loop mimicking excel
    for (let i = 1; i < data.length; i++) {
        if (data[i] != 0) { //Make sure value is not 0
            pvOutput = (data[i] * solarArraySize) / 1000; //Store solar array output data
        } else {
            pvOutput = 0;
        }
    
        if (pvOutput - averageConsumption > 0) { //Row N calc
            solarOutflow = pvOutput - averageConsumption;
        } else { 
            solarOutflow = 0; 
        }

        solarConsumption = pvOutput - solarOutflow; //Row M Calc

        //Uses battery capacity from iteration i-1, mimic going a row back in the excel
        if (solarOutflow + batteryCapacity > batterySize) { //Row O calc
            //amountStored = solarOutflow- (batteryCapacity + solarOutflow - batterySize);
            amountStored = batterySize - batteryCapacity;
        } else {
            amountStored = solarOutflow;
        }

        gridOutflow = solarOutflow - amountStored; //Row P calc

        if (batteryCapacity + pvOutput + genOutput - averageConsumption < batterySize) { //Row Q calc
            batteryCapacity = batteryCapacity + pvOutput + genOutput - averageConsumption
        } else {
            batteryCapacity = batterySize;
        }

        //Generator was run condition
        if (batteryCapacity/batterySize < genChargeStart) {
            if (lastGeneratorDay == 'undefined') {
                lastGeneratorDay = Math.floor(i/24);
            }
            genOutput = genSize;
            let currentDay = Math.floor(i/24);
            if (currentDay != lastGeneratorDay) { //Increment generator days once a 24hour period
                systemData['genDays'] = systemData['genDays'] + 1;
                lastGeneratorDay = currentDay;
            }
        } else { 
            genOutput = 0; 
        }

        //System data stores the sum of the fields as we iterate over all hours
        systemData['pvOutput'] = systemData['pvOutput'] + pvOutput;
        systemData['solarOutflow'] = systemData['solarOutflow'] + solarOutflow;
        systemData['amountStored'] = systemData['amountStored'] + amountStored;
        systemData['gridOutflow'] = systemData['gridOutflow'] + gridOutflow;
        systemData['genOutput'] = systemData['genOutput'] + genOutput;
        systemData['solarConsumption'] = systemData['solarConsumption'] + solarConsumption;
    }
    return systemData; //Equivalent to last row of hourly energy flow spreadsheet
}