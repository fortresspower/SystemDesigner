import streamlit as st
import pandas as pd
import requests
import json
#Streamlit Page Beginning
st.title('Solar\Battery System Designer')

api_key = "WkDNJ5GuHQJROwhr64ZgH4Hxu2fc51d3FlKijtsD"
system_capacity = "5"
module_type = "0"
losses = "0"
array_type = "1"
tilt = "0"
azimuth = "0"
address = "4141 Spruce St, Philadelphia, PA, United States"
request_url_root = "https://developer.nrel.gov/api/pvwatts/v6.json?"

#parameters contain all required parameters to the api call
parameters = "api_key="+api_key+"&system_capacity="+system_capacity+"&module_type="+ module_type + "&losses=" + losses + "&array_type=" + array_type + "&tilt=" + tilt + "&azimuth=" + azimuth + "&address=" + address
optional_parameters = ""

#API Call for PVWatts
response = requests.get(request_url_root + parameters + optional_parameters)
with open('responseData.txt', 'w') as f:
    f.write(str(json.loads(response.content)))

#df = pd.read_json(str(json.loads(response.content)))
#df.to_csv("jsonData.csv")
#print(json.loads(response))
#print(json.loads(response.content))
