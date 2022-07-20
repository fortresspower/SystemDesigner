import {createPVWattsListeners} from './listeners.js';
import {createUtilityListeners} from './listeners.js';

//Set up utlity rate API listeners
createUtilityListeners();

//Set up pvWatts API listeners
createPVWattsListeners();

//Handles runPVWattsAPI result, displays calc results from API call in a div below solar and battery sliders
export function showResult(res) {
    //showAPIData(res); //Legacy Line that will show pvwatts api result for testing reasons
    document.getElementById('solar-api').innerHTML = 'Recalculate'; //Change button text to recalculate after API Called at least once
    let resultModule = document.getElementById('system-results');
    let averageConsumption = parseInt(document.getElementById('module-kwh').getAttribute('consumption')); //monthly average kww consumption
    
    //Set Gen Days Text
    document.getElementById('gen-days').innerHTML = 'Days with Grid/Gen use: ' + res.genDays;
    //Set self reliance text
    document.getElementById('self-reliance').innerHTML = 'Percent Off-Grid: ' + Math.round(100 * (res.solarConsumption/(12 * averageConsumption)), 3) + '%';
    //Set solar production text
    document.getElementById('solar-production').innerHTML = 'Total Solar Production (kwh): ' + numberWithCommas(Math.round(res.pvOutput));
    //Set solar consumption text
    document.getElementById('solar-consumption').innerHTML = 'Estimated Building Consumption (kwh): ' + numberWithCommas(12 * averageConsumption);
    //Set percent offset text
    document.getElementById('percent-offset').innerHTML = 'Additional Offset from Grid Sellback: ' + Math.round(100 * (res.gridOutflow/(12 * averageConsumption)), 3) + '%'

    //Show result text 
    resultModule.style.display = 'block';
    //Show monthly results table
    document.getElementById('monthly-results').style.display = 'block';
    //Initialize ability to click on the consumption of any month in the table
    //monthlyConsumptionChange()
    //Show email input and submit system data button
    document.getElementById('email-results').style.display = 'flex';
    
}

//Helper to display large numbers with commas
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ", ");
}

/*
    LEGACY FUNCTION TO VIEW PV WATTS API OUTPUT DATA
/*
//Function shows api result data on the left for testing purpose
function showAPIData(res) {
    //Remove old test info div
    let el = document.getElementById('test-info');
    el.remove();

    //Create new test info div
    let newEl = document.createElement('div');
    newEl.setAttribute('id', 'test-info');
    document.getElementById('system-designer').appendChild(newEl);

    //Create header and linespace
    let header = document.createElement('h3');
    header.innerHTML = 'PV Watts API Result:';
    newEl.appendChild(header);
    newEl.appendChild(document.createElement('br'));

    //Show text of result data 
    console.log(res);
    Object.keys(res).forEach(key => {
        let p = document.createElement('p');
        p.innerHTML = key + ' : ' + numberWithCommas(Math.round(res[key]));
        newEl.appendChild(p);
    });
}

* WORKAROUND CODE KEEPING HERE FOR NOW AVOIDS API CALLS ON INPUT CHANGES

Put this if statement in solar api event lsitener and create var pvWattsData, add to other listeners
    //Assign API return data to pvWattsData local var the first time we call API with this address
    if (pvWattsData == undefined) {
        pvWattsData = res;
        console.log(pvWattsData);
    }

// //have solar slider changes recalculates values not recall API
// document.getElementById('solar-array-slider').addEventListener('input', function() {
//     if (pvWattsData != undefined) {
//         showResult(handlePVWattsOutput(pvWattsData.dcData));
//         console.log(pvWattsData);
//     }
// });

// //have battery slider changes recalculate values
// document.getElementById('battery-array-slider').addEventListener('input', function() {
//     if (pvWattsData != undefined) {
//         showResult(handlePVWattsOutput(pvWattsData.dcData));
//         console.log(pvWattsData);
//     }
// });

*/
