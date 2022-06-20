from turtle import onclick
import streamlit as st
import pandas as pd
import requests

#NREL Developer API KEY
api_key = "WkDNJ5GuHQJROwhr64ZgH4Hxu2fc51d3FlKijtsD"
# htmlString = "<script type='text/javascript'> selectElement = document.querySelector('.kwh-value');" \
# "selectElement.addEventListener('change', (event) => {" \
# "console.log(event.target.value);" \
# "}); </script>"
# st.components.v1.html(htmlString)
# "result.textContent = `You like ${event.target.value}`;" \

#Streamlit Page Beginning
st.title('Solar\Battery System Designer')
zip_code = st.text_input("Enter your ZIP code")
elec_bill = st.text_input("Enter your monthly electric bill in $")
elec_rate = None
elec_consumption = None
fix_result_pressed = False
kwh_view_option = None
st.session_state.kwhOption = "Monthly"

def showSlider():
    fix_result_pressed = True
    #st.write('You selected:', option)

def handle_kwh_format():
    print("session state val: " + st.session_state.kwhOption)
    #if kwh_view_option:
        #print("selecter value: " + kwh_view_option)
    # if lastOption == "Monthly":

#API calls setup here
if (zip_code) :
    #Utility Rates API
    utility_root_url = "https://developer.nrel.gov/api/utility_rates/v3.json?"
    utility_parameters = "api_key=" + api_key + "&address=" + zip_code
    utility_response = requests.get(utility_root_url + utility_parameters).json()
    #Extract residential elec rate from utility api response
    elec_rate = utility_response.get("outputs").get("residential")
    
    #PVWatts API
    system_capacity = "1" 
    module_type = "1"
    losses = "12"
    array_type = "1"
    tilt = "20"
    azimuth = "180"

    pv_url_root = "https://developer.nrel.gov/api/pvwatts/v6.json?"
    pv_parameters = "api_key="+api_key+"&system_capacity="+system_capacity+"&module_type="+ module_type + "&losses=" + losses + "&array_type=" + array_type + "&tilt=" + tilt + "&azimuth=" + azimuth + "&address=" + zip_code
    pv_optional_parameters = "&timeframe=hourly"

    pv_response = requests.get(pv_url_root + pv_parameters + pv_optional_parameters).json()

    #Extract dc hourly ouput form pv_watts api response and put it into dataframe
    # df = pd.DataFrame(pv_response.get("outputs").get("dc"), columns = ['dc_output_hourly'])
    # df.to_csv("testDataCSV.csv")

#If we were able to get address electricity rate and user enter their monthly bill compute monthly elec consumption
if (elec_bill and elec_rate):
    elec_consumption = float(elec_bill) / elec_rate #kwh/month
    st.markdown("""
    <style>
    .big-font {
    font-size:20px !important;
    margin-top:40px;
    }
    .kwh-value {
    width: 50px;
    height: 38x;
    }
    .kwh-output-type {
    width: 120px;
    height: 38px;
    }
    </style>
    """, unsafe_allow_html=True)

    col1, col2, col3 = st.columns((6,1,3))
    col1.markdown('<p class="big-font">' + "Your average monthly electricity consumption is: </p>", unsafe_allow_html=True)
    kwh_value = col2.text_input("", value = str(int(elec_consumption)))
    col3.markdown('<p class="big-font">' + 'kwh/Month </p>', unsafe_allow_html=True)
    print("kwh_val: " + kwh_value)

    if kwh_value:
        
        solarCol1, solarCol2, solarCol3 = st.columns((2,1,1))
        solar_options = solarCol1.checkbox('Check to update optional solar details', value=False);
        if solar_options is True :
            tilt_angle = solarCol2.text_input('Tilt Angle', value = "20")
            azimuth_angle = solarCol3.text_input('Azimuth Angle', value = "180")

        st.text("Select Battery Inverter and Quantity")
        with st.container():
            inverter1, inverter_opt1 = st.columns((5,2))

        inverter2, inverter_opt2 = st.columns(2)
        inverter1.text('7.6 kW inverter quantity: ')
        small_inverter_quant = inverter_opt1.text_input('', value='0')
        inverter2.text('12 kW inverter quantity: ')
        large_inverter_quant = inverter_opt2.text_input('', value='0', key='large_inv');


    







    #kwh_view_option = col3.selectbox('',('Daily (kWh/day)', 'Monthly(kWh/month)', 'Yearly(kWh/year)'),key = "kwhOption", index = 1, on_change= handle_kwh_format)
    #col1.markdown('<div> <p class="big-font">' + "Your average monthly electricity consumption is: </p> <input class='kwh-value' value=" +  str(int(elec_consumption)) + "> </input> </div>", unsafe_allow_html=True)
    #st.markdown('<div> <p class="big-font">' + "Your average monthly electricity consumption is: <input class='kwh-value' type='text' value=" +  str(int(elec_consumption)) + "> </input> <select class='kwh-output-type'> <option value='day'>kwh/day </option> <option value='month'>kwh/month </option> <option value='year'>kwh/year</option> </select> </p> </div>", unsafe_allow_html=True)
    
    #txtVal = col2.text_input("Enter Value")
    # col2.button("Fix Result", on_click = showSlider())
    # if st.button('Say hello'):
    #  st.write('Why hello there')
    # else:
    #  st.write('Goodbye')
    # if txtVal:
    #     option = st.selectbox('How would you like to specify your average electricity consumption?',('Daily (kWh/day)', 'Monthly(kWh/month)', 'Yearly(kWh/year)'))
    # if fix_result_pressed:
    #     option = st.selectbox('How would you like to specify your average electricity consumption?',('Daily (kWh/day)', 'Monthly(kWh/month)', 'Yearly(kWh/year)'))
    #st.text("Your average monthly electricity consumption is **" + str(int(elec_consumption)) + " kwh**" )
    #st.write("Your average monthly electricity consumption is **" + str(int(elec_consumption)) + " kwh**")

#df = pd.read_json(str(json.loads(response.content)))s
#df.to_csv("jsonData.csv")
#print(json.loads(response))
#print(json.loads(response.content))
