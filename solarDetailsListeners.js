const solarDetailsChbox = document.getElementById("solar-details");
//Show/Hide optional solar details when solar details checkbox value changes
solarDetailsChbox.addEventListener("change", function () {
    if (solarDetailsChbox.checked) {
        document.getElementById('tilt-azimuth').style.display = 'inline-block';
    } else {
        document.getElementById('tilt-azimuth').style.display = 'none';
    }
})

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