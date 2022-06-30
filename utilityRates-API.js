//NREL Developer API KEY
let api_key = "WkDNJ5GuHQJROwhr64ZgH4Hxu2fc51d3FlKijtsD"

const zipCodeInp = document.getElementById("zip-code");
const billInp = document.getElementById("monthly-bill");

//Variables store information on HTML elements in the page
let lastDropDownVal;

export function runUtilityAPI() {
    if (zipCodeInp.value.length != 0 && billInp.value.length != 0) {
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

}

//Function displays the electricity consumptions and sets up event listener for dropdown
function handleUtilityResult(electricRate) {
    let monthlyConsumption = Math.round(billInp.value / electricRate);
    document.getElementById('module-kwh').setAttribute('consumption', monthlyConsumption)
    let rateInp = document.getElementById('residential-rate-inp');
    rateInp.value = monthlyConsumption;

    let dropDown = document.getElementById('output-options');
    lastDropDownVal = dropDown.value;
    let slider = document.getElementById('kwh-slider');
    slider.value = monthlyConsumption;

    //Create event listener that updates slider when rate input is changed
    rateInp.addEventListener('change', function () {
        slider.value = rateInp.value;    
        setMonthlyConsumption(); //Make sure consumption attribute always in monthly form
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
          lastDropDownVal = dropDown.value;
          slider.max = multiplier * slider.max;
          rateInp.value = Math.round(multiplier * rateInp.value);
          slider.value = rateInp.value;
    });

    //Create event listener updating input value when slider is modified
    slider.addEventListener('input', function() {
        rateInp.value = parseInt(slider.value);
        setMonthlyConsumption(); //Make sure consumption attribute always in monthly form
    });

    document.getElementById('utility-results').style.display = 'block';
    document.getElementById('module-system-information').style.display = 'block';
    document.getElementById('module-fortress-system').style.display = 'block';

}

//Function updates attribute of div id = module-kwh to store monthly consumption for data processing later
function setMonthlyConsumption() {
    let consumptionFactor = 1;
    let dropDown = document.getElementById('output-options');
    let rateInp = document.getElementById('residential-rate-inp');

    if (dropDown.value == 'day') {  
        consumptionFactor = 30;
    } else if (dropDown.value == 'year') {
        consumptionFactor = (1/12)*1000;
    } 
    document.getElementById('module-kwh').setAttribute('consumption', parseInt(rateInp.value * consumptionFactor));
}