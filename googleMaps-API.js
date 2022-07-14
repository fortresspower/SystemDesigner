import {runPVWattsAPI} from './pvWatts-API.js';
import {showResult} from './script.js';

//Geocoding API Key
let api_key = "AIzaSyDT6IVOnSgeDfRGE75fFo2LBMm7vrnkVEI"

const zipCodeInp = document.getElementById("zip-code");
const billInp = document.getElementById("monthly-bill");

//Function calls the google geocoder api which turns an address into lat and long coordinates
export function runGeoAPI() {
    if (zipCodeInp.value.length != 0 && billInp.value.length != 0) {
        let address = zipCodeInp.value.replaceAll(' ', '+').replaceAll(',', '+').replaceAll('++', '+');
        console.log(address);
        let geo_root_url = "https://maps.googleapis.com/maps/api/geocode/json?"
        let geo_parameters = "key=" + api_key + "&address=" + address;
        console.log(geo_root_url + geo_parameters);
        try {
            fetch(geo_root_url + geo_parameters)
            .then(response => response.json())
            .then(data => handleGeoResult(data));
        } catch(e) {
            console.log(e);
        }
    } else {
        console.log("Input missing for API call")
    } 

}

//Function takes the lat and long results from the geocoder api and runs PV Watts with those values
function handleGeoResult(res) {
    console.log(res.results[0].geometry.location);
    let location = res.results[0].geometry.location;
    return runPVWattsAPI(showResult, location);
}