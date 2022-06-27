import {runUtilityAPI} from './utilityRates-API.js';
import {runPVWattsAPI} from './pvWatts-API.js';

//Get button to trigger running utility api
const buttonVal = document.getElementById("utility-api");
buttonVal.addEventListener("click", function() {
    runUtilityAPI();
});


//Set up button listener to call solar api
document.getElementById('solar-api').addEventListener('click', function() {
    runPVWattsAPI(showResult);
});

//Handles runPVWattsAPI result, displays calc results from API call in a div below solar and battery sliders
function showResult(res) {
    showAPIData(res);

    let resultModule = document.getElementById('system-results');
    let averageConsumption = document.getElementById('residential-rate-inp').value; //monthly average kww consumption

    //Set Gen Days Text
    document.getElementById('gen-days').innerHTML = 'Days with Generator Use: ' + res.genDays;
    //Set Gen Hours Text
    let size = parseInt(document.getElementById('inverter-quantity').value) * parseFloat(document.getElementById('inverter-options').value); //Generator size
    document.getElementById('gen-hours').innerHTML = 'Hours with Generator Use: ' + Math.round(res.genOutput / size);
    //Set Pv sell back text
    document.getElementById('pv-sell-back').innerHTML = 'Percent of Solar You Sold Back vs Consumed: ' + Math.round((100 * res.gridOutflow)/(12 * averageConsumption), 3) + '%';
    //Set self reliance text
    document.getElementById('self-reliance').innerHTML = 'Percent Self Reliant: ' + Math.round(100 * (1 - (res.genOutput/(12 * averageConsumption))), 3) + '%';
    //Show result text 
    resultModule.style.display = 'block';
}

//have battery slider recall solar api recalculting data
document.getElementById('solar-array-slider').addEventListener('input', function() {
    runPVWattsAPI(showResult);
});

//have battery slider recall battery api recalculting data
document.getElementById('battery-array-slider').addEventListener('input', function() {
    runPVWattsAPI(showResult);
});

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
        p.innerHTML = key + ' : ' + Math.round(res[key]);
        newEl.appendChild(p);
    });
}
/*
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
