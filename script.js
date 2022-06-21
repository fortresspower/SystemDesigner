//NREL Developer API KEY
let api_key = "WkDNJ5GuHQJROwhr64ZgH4Hxu2fc51d3FlKijtsD"

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

//Handle what to do when solar detilas checkbox value changes
solarDetailsChbox.addEventListener("change", function () {
    if (solarDetailsChbox.checked) {
        document.getElementById('tilt-azimuth').style.display = 'inline-block';
    } else {
        document.getElementById('tilt-azimuth').style.display = 'none';
    }
})
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

}
 
