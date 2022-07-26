// var express = require('express'),
//     request = require('request'),
//     bodyParser = require('body-parser'),
//     app = express();

// var myLimit = typeof(process.argv[2]) != 'undefined' ? process.argv[2] : '100kb';
// console.log('Using limit: ', myLimit);

// app.use(bodyParser.json({limit: myLimit}));

// app.all('*', function (req, res, next) {

//     // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
//     res.header("Access-Control-Allow-Headers", req.header('access-control-request-headers'));

//     if (req.method === 'OPTIONS') {
//         // CORS Preflight
//         res.send();
//     } else {
//         var targetURL = req.header('Target-URL'); // Target-URL ie. https://example.com or http://example.com
//         if (!targetURL) {
//             res.send(500, { error: 'There is no Target-Endpoint header in the request' });
//             return;
//         }
//         request({ url: targetURL + req.url, method: req.method, json: req.body, headers: {'Authorization': req.header('Authorization')} },
//             function (error, response, body) {
//                 if (error) {
//                     console.error('error: ' + response.statusCode)
//                 }
// //                console.log(body);
//             }).pipe(res);
//     }
// });

// app.set('port', process.env.PORT || 3000);

// app.listen(app.get('port'), function () {
//     console.log('Proxy server listening on port ' + app.get('port'));
// });

// function fetchLessAPI() {
//     let redirect = "http://localhost:5500"
//     //https://fortresspower.github.io/SystemDesigner/
//     let access_root_url = "https://accounts.zoho.com/oauth/v2/auth?"
//     let access_parameters = "response_type=code&client_id=" + clientID + "&scope=ZohoSheet.dataAPI.UPDATE&redirect_uri=" + redirect;

//     var xhr = new XMLHttpRequest();
//     xhr.open("GET", access_root_url+access_parameters, true);
//     xhr.onload = function (e) {
//     if (xhr.readyState === 4) {
//         if (xhr.status === 200) {
//         console.log(xhr.responseText);
//         var response = JSON.parse(xhr.responseText);
//         console.log(response);
//         } else {
//         console.error(xhr.statusText);
//         }
//     }
//     };
//     xhr.onerror = function (e) {
//     console.error(xhr.statusText);
//     };
//     xhr.send(null);
// }

//ZOHO Developer Params
let clientSecret = "0b9faca77c8ea1da044aeccf65b8b5e35aa24f6bb7";
let clientID = "1000.66ZJE80XRS53IW3LFX84LJNMFOR20T";
let refreshToken;
let accessToken;

export function getAuthorization() {
    console.log("Reached");
    //Utility Rates API
    //let redirect = "http://localhost:5500"
    let redirect = "https://fortresspower.github.io/SystemDesigner/";
    //https://fortresspower.github.io/SystemDesigner/
    let access_root_url = "https://accounts.zoho.com/oauth/v2/auth?"
    let access_parameters = "response_type=code&client_id=" + clientID + "&scope=ZohoSheet.dataAPI.UPDATE&redirect_uri=" + redirect;
    try { 
        // fetch(access_root_url + access_parameters,
        //     {
        //         mode: 'no-cors'
        //         // method : "GET",
        //         // mode: 'cors',
        //         // headers: {
        //         //     "Access-Control-Allow-Origin" : '*'
        //         // }
        //     })
            fetch(access_root_url + access_parameters)
            // fetch(access_root_url + access_parameters, 
            // {
            //     method: 'GET',
            //     mode: 'cors',
            //     headers: {
            //       'Access-Control-Allow-Origin' : '*',
            //       'Access-Control-Allow-Headers' : 'Origin, Content-Type, X-Auth-Token',
            //       'Access-Control-Allow-Methods' : 'GET, POST, PATCH, PUT, DELETE, OPTIONS'
            //     }
            // })
            .then(response => response.json())
            .then(data => 
            console.log(data)
            //getAccessToken(data.code)
            );
    } catch(e) {
        console.log(e);
    }
}

export function getAccessToken(code) {
    let root_url = " https://accounts.zoho.com/oauth/v2/token?";
    let parameters = "code=" + code + "&client_id" + clientID + "&client_secret" + clientSecret + "&grant_type=authorization_code&redirect_uri=https://fortresspower.github.io/SystemDesigner/"
    try {
        fetch(root_url + parameters, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            refreshToken = data.refresh_token;
            accessToken = data.access_token;
        })
    } catch(e) {
        console.log(e);
    }
}