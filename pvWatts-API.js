import {showResult} from './script.js';

//NREL Developer API KEY
let api_key = "WkDNJ5GuHQJROwhr64ZgH4Hxu2fc51d3FlKijtsD"

let apiCallACData = {}; //Variable stores ac data of last PVWatts API Call

//Run API getting solar data for given location
export function runPVWattsAPI(callBack, coords, monthlyConsumption) {
    let system_capacity = "1" 
    let module_type = "1"
    let array_type = "1"
    let tilt = document.getElementById('inp-tilt').value.toString();
    let azimuth = document.getElementById('inp-azimuth').value.toString();
    let derate = (document.getElementById('inp-derate').value * 100).toString(); //Losses in percent

    let rootURL = "https://developer.nrel.gov/api/pvwatts/v6.json?"
    let requiredParameters = "api_key="+api_key+"&system_capacity="+system_capacity+"&module_type="+ module_type + "&array_type=" + array_type + "&timeframe=hourly"
    let detailParameters = "&dc_ac_ratio=1" + "&tilt=" + tilt + "&azimuth=" + azimuth + "&losses=" + derate;
    let addressParameters = "&lat=" + coords.lat + "&lon=" + coords.lng;

    try {
        fetch(rootURL + requiredParameters + detailParameters + addressParameters)
        .then(response => response.json())
        .then(data => {
            apiCallACData = data.outputs.ac;
            if(callBack != null){
                callBack(handlePVWattsOutput(monthlyConsumption));
            } else {
                showResult(handlePVWattsOutput(monthlyConsumption));
            }
        });
    } catch(e) {
        console.log(e);
    }
}

//Function used to process PV Watts return data
export function handlePVWattsOutput(monthlyConsumption) {
    //Variables keep track of what month we are on to populate monthly results
    let daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let currentMonth = 0;
    let daysPast = 0;
    let hourCounter = 1;

    //Initialize object that stores sum of data values as we iterate over all hours
    let systemData = {
        pvOutput: 0,
        solarOutflow: 0,
        amountStored: 0,
        gridOutflow: 0,
        genOutput: 0,
        genDays: 0,
        solarConsumption: 0,
        acData: apiCallACData
    };

    let monthlyData = {
        pvOutput: 0,
        solarOutflow: 0,
        amountStored: 0,
        gridOutflow: 0,
        genOutput: 0,
        genDays: 0,
        solarConsumption: 0,
        acData: apiCallACData
    };

    //Pull input values user put into webpage
    let solarArraySize = document.getElementById('solar-array-slider').value * 0.43;
    let averageConsumption = parseInt(document.getElementById('module-kwh').getAttribute('consumption')) / 730; //Your average monthly consumption divided by hours in a month to get Kw
    let batterySize = parseFloat(document.getElementById('battery-array-panels').innerHTML.split(', ')[1].replace('kWh', ''))
    let inverterSize = parseFloat(document.getElementById('inverter-options').value); 
    let inverterQuantity = parseInt(document.getElementById('inverter-quantity').value);
    let additionalCapacity = parseInt(document.getElementById('inp-additional-capacity').value);    //Consumption array allows a consumption value per month defaulted to average consumption
    //Every month when input array is not provided
    let consumptionArray;
    if (monthlyConsumption.length == 0) {
        consumptionArray = Array(12).fill(averageConsumption);
    } else { consumptionArray = monthlyConsumption}
    

    let pvOutput; //Dc array output hourly
    let solarOutflow; //Flow out of PV
    let amountStored; //Flow to battery
    let gridOutflow; //Flow to grid
    let solarConsumption; //Instant solar consumption
    let batteryCapacity = batterySize + (apiCallACData[0]* solarArraySize/1000) - averageConsumption; //Capacity of battery before current hour runs
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
    for (let i = 1; i < apiCallACData.length; i++) {
        if (apiCallACData[i] != 0) { //Make sure value is not 0
            if ((apiCallACData[i] * solarArraySize) / 1000 > (inverterSize * inverterQuantity) + additionalCapacity) { //Check for inverter clipping
                pvOutput = inverterSize * inverterQuantity; 
            } else {
                pvOutput = (apiCallACData[i] * solarArraySize) / 1000; //Store solar array output data in kW
            }
        } else {
            pvOutput = 0;
        }
    
        if (pvOutput - consumptionArray[currentMonth] > 0) { //Row N calc
            solarOutflow = pvOutput - consumptionArray[currentMonth];
        } else { 
            solarOutflow = 0; 
        }

        //Uses battery capacity from iteration i-1, mimic going a row back in the excel
        if (solarOutflow + batteryCapacity > batterySize) { //Row O calc
            //amountStored = solarOutflow- (batteryCapacity + solarOutflow - batterySize);
            amountStored = batterySize - batteryCapacity;
        } else {
            amountStored = solarOutflow;
        }

        gridOutflow = solarOutflow - amountStored; //Row P calc

        solarConsumption = pvOutput - gridOutflow; //Row M Calc

        if (batteryCapacity + pvOutput + genOutput - consumptionArray[currentMonth] < batterySize) { //Row Q calc
            batteryCapacity = batteryCapacity + pvOutput + genOutput - consumptionArray[currentMonth]
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
                monthlyData['genDays'] = monthlyData['genDays'] + 1;
                lastGeneratorDay = currentDay;
            }
        } else { 
            genOutput = 0; 
        }

        //Update monthly Data
        monthlyData['pvOutput'] = monthlyData['pvOutput'] + pvOutput;
        monthlyData['solarOutflow'] = monthlyData['solarOutflow'] + solarOutflow;
        monthlyData['amountStored'] = monthlyData['amountStored'] + amountStored;
        monthlyData['gridOutflow'] = monthlyData['gridOutflow'] + gridOutflow;
        monthlyData['genOutput'] = monthlyData['genOutput'] + genOutput;
        monthlyData['solarConsumption'] = monthlyData['solarConsumption'] + solarConsumption;

        //After completing all calculations increment hours run
        hourCounter++;
        
        if (hourCounter == 24) { //Check if day is complete
            daysPast++;
            hourCounter = 0; 

            if (daysPast == daysPerMonth[currentMonth]){ //check if month is complete
                //Populate table row with data
                updateMonthlyTable(currentMonth, monthlyData, consumptionArray[currentMonth] * 730);

                //Add completed month data to annual, reset month data
                systemData = updateAnnualData(systemData, monthlyData);
                monthlyData = resetMonthlyData(monthlyData);
                daysPast = 0; //Reset days iterated over this month
                currentMonth++; //Move on to next month
            }
        }
    }

    //Update total row off table with systemData
    updateMonthlyTable('all', systemData, consumptionArray.reduce((a, b) => a + b, 0) * 730);
    return systemData; //Equivalent to last row of hourly energy flow spreadsheet
}

//Retrievs appropriate row of monthly results table and populates cells
function updateMonthlyTable(monthIndex, data, averageConsumption) {
    var tableCells = document.getElementById('month-' + monthIndex).children;
    //console.log(document.getElementById('month-' + monthIndex).children);
    tableCells[1].innerHTML = Math.round(data['pvOutput']);
    tableCells[2].innerHTML = Math.round(averageConsumption);
    tableCells[2].setAttribute('contenteditable',"true"); //Allow users to modify monthly consumption
    //Add event listener to change total when a month value is changed
    if (monthIndex != ' all') {
        tableCells[2].addEventListener('input', (event) => {
            let sum = 0;
            //Compute sum of month consumption values
            for (let i = 0; i < 12; i++) {
                sum += parseFloat(document.getElementById('month-' + i.toString()).children[2].innerHTML);
            }
            //Update total after a cell is changed
            document.getElementById('month-all').children[2].innerHTML = sum;
        });
    }   

    tableCells[3].innerHTML = Math.round(data['solarConsumption']);
    tableCells[4].innerHTML = Math.round(data['genOutput']);
    tableCells[5].innerHTML = Math.round(data['gridOutflow']);
    tableCells[6].innerHTML = data['genDays'];
}

//Updates annual data everytime a month is done running
function updateAnnualData(annual, monthly) {
    Object.keys(annual).forEach(key => {
        if (key != 'acData') {
            annual[key] = annual[key] + monthly[key];
        }
    });
    return annual;
}

//Reset system data to 0 when month is done running
function resetMonthlyData(monthly) {
    Object.keys(monthly).forEach(key => {
        if (key != 'acData') {
            monthly[key] = 0;
        }
    });
    return monthly;
};
