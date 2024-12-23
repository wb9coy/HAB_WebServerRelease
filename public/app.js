var lat;
var lon;
var status;
const sensorSocket = io.connect(document.location.host)

function UpdateGPSData(GPSData)
{
    if(GPSData != null)
    {
        if(GPSData.sentenceId== "GGA")
        {
            if(GPSData.chxOk == true)
            {
                lat                                               = GPSData.latitude;
                lon                                               = GPSData.longitude;
                tempTime                                          = GPSData.time;
                parseTime                                         = tempTime.split('T');
                parseTime                                         = parseTime[1].split('.');
                document.getElementById("GPSTimeID").innerHTML    = parseTime[0];
                document.getElementById("latID").innerHTML        = parseFloat(GPSData.latitude).toFixed(4);
                document.getElementById("lonID").innerHTML        = parseFloat(GPSData.longitude).toFixed(4);
                document.getElementById("altID").innerHTML        = Math.round(GPSData.altitudeMeters*3.28);
                document.getElementById("SatellitesID").innerHTML = GPSData.satellitesInView;
                document.getElementById("statusID").innerHTML     = GPSData.fixType;
                status = GPSData.fixType;
            }
        }
    }

    if(GPSData.sentenceId== "RMC")
    {
        if(GPSData.chxOk == true)
        {
            document.getElementById("speedID").innerHTML    = Math.round(GPSData.speedKnots*1.15077845);
        }
    }
}

sensorSocket.on('GPS', function(data)
{
  UpdateGPSData(data);
});

sensorSocket.on('INT_TEMP', function(data)
{
  document.getElementById("IntTemperatureID").innerHTML = data.temp;
});

sensorSocket.on('EXT_TEMP', function(data)
{
  document.getElementById("ExtTemperatureID").innerHTML = data.temp;
});

sensorSocket.on('CALL', function(data)
{
    document.getElementById("callID").innerHTML     = data.call;
});

sensorSocket.on('HUM', function(data)
{
  document.getElementById("HumidityID").innerHTML    = data.hum;
});

sensorSocket.on('PRES', function(data)
{
  document.getElementById("PressureID").innerHTML    = data.pres;
});

sensorSocket.on('BATT', function(data)
{
  document.getElementById("BatteryID").innerHTML    = data.batt;
});

sensorSocket.on('CONN_TIMEOUT', function(data)
{
  labelID = "rssiGW" + data.gw + "Label"
  rssiID  = "rssiGW" + data.gw
  document.getElementById(labelID).style.color = "White"
  document.getElementById(rssiID).innerHTML   = "";
});

sensorSocket.on('RSSI_TIMEOUT', function(data)
{
  labelID = "rssiGW" + data.gw + "Label"
  rssiID  = "rssiGW" + data.gw
  document.getElementById(rssiID).innerHTML   = "";
});

sensorSocket.on('PING', function(data)
{
  labelID = "rssiGW" + data.gw + "Label"
  document.getElementById(labelID).style.color = "Green"
});

sensorSocket.on('RSSI', function(data)
{
  labelID = "rssiGW" + data.gw + "Label"
  rssiID  = "rssiGW" + data.gw
  document.getElementById(labelID).style.color = "Green"
  document.getElementById(rssiID).innerHTML    = data.rssi;
});

function myMap() 
{
  var map;
  var myLatLng;
  var marker;
  if(status == "fix" ||  status == "delta" )
  {
    myLatLng = new google.maps.LatLng(lat,lon);
    var mapOptions = {center: myLatLng, zoom: 18 , key:"AIzaSyA_8MwH1_-lsTpZOiKZXedBtwb1zLh5I2o"};
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);

  	var marker = new google.maps.Marker({
  	  position: myLatLng,
  	  map: map,
  	  title: 'Mount Carmel High Demo'
  	});

  }
  else
  {
    document.getElementById("map").innerHTML   = "GPS Not Valid";
  }
}

function displayImages() 
{
  window.open("/images");
} 

