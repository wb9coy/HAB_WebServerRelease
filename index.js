
import express           from 'express'
import {Server}          from 'socket.io'
import {WebSocketServer} from 'ws'
import FtpSvr            from 'ftp-srv';
import fs                from 'fs';
import path              from 'path';
import { fileURLToPath } from 'url';
import nmea              from 'nmea-simple';
import Gallery           from 'express-photo-gallery';
import sleep             from 'sleep';
import { spawn }         from 'child_process';
import ip                from 'ip';
      
const HOST_ADDR       = ip.address()
const PORT            = 80;
const GW_PORT         = 8081;

var FTP_PORT          = 8082;
var FTP_PORT_PASV_MIN = 8083;
var FTP_PORT_PASV_MAX = 8110;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wss = new WebSocketServer({ port: GW_PORT });

const app = express()

app.use(express.static(path.join(__dirname, "public")))

const expressServer = app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})

const io = new Server(expressServer)

const path_req = './pipe_req';
var fifoWs     = null;

var connTimerObjs        = [];
var rssiTimerObjs        = []; 

var GW_TIMEOUT     = 15000;
var RSSI_TIMEOUT   = 60000;

var options = {
  title: 'HAB Image Viewer'
};


fs.mkdir(path.join(__dirname, 'logs'),
  { recursive: true }, (err) => {
    if (err) {
      return console.error(err);
    }
    console.log('Directory created logs successfully!');
  });

sleep.sleep(2)

fs.mkdir(path.join(__dirname, 'logs/images'),
  { recursive: true }, (err) => {
    if (err) {
      return console.error(err);
    }
    console.log('Directory created logs/images successfully!');
  });

sleep.sleep(4)

fs.mkdir(path.join(__dirname, 'logs/imageSeq'),
  { recursive: true }, (err) => {
    if (err) {
      return console.error(err);
    }
    console.log('Directory created logs/imageSeq successfully!');
  });

sleep.sleep(4)

if (fs.existsSync(path_req)) {
    fs.unlink(path_req, (err) => {
        if (err) {
            console.log(err);
        }
        console.log(path_req +" " + "deleted");
    })
}

let fifo_req   = spawn('mkfifo', [path_req]);

const ftpServer = new FtpSvr ({
	url:'ftp://' + HOST_ADDR + ':' + FTP_PORT ,
	pasv_url: HOST_ADDR,
	pasv_min:FTP_PORT_PASV_MIN,
	pasv_max:FTP_PORT_PASV_MAX,
	anonymous: false,
	greeting : [ "ANSR FTP Server"]
});


connTimerObjs.push(setInterval(function(){connTimeout(1)},GW_TIMEOUT));
connTimerObjs.push(setInterval(function(){connTimeout(2)},GW_TIMEOUT));
connTimerObjs.push(setInterval(function(){connTimeout(3)},GW_TIMEOUT));
connTimerObjs.push(setInterval(function(){connTimeout(4)},GW_TIMEOUT));
connTimerObjs.push(setInterval(function(){connTimeout(5)},GW_TIMEOUT));
connTimerObjs.push(setInterval(function(){connTimeout(6)},GW_TIMEOUT));
connTimerObjs.push(setInterval(function(){connTimeout(7)},GW_TIMEOUT));
connTimerObjs.push(setInterval(function(){connTimeout(8)},GW_TIMEOUT));
connTimerObjs.push(setInterval(function(){connTimeout(9)},GW_TIMEOUT));
connTimerObjs.push(setInterval(function(){connTimeout(10)},GW_TIMEOUT));
connTimerObjs.push(setInterval(function(){connTimeout(11)},GW_TIMEOUT));
connTimerObjs.push(setInterval(function(){connTimeout(12)},GW_TIMEOUT));
connTimerObjs.push(setInterval(function(){connTimeout(13)},GW_TIMEOUT));
connTimerObjs.push(setInterval(function(){connTimeout(14)},GW_TIMEOUT));
connTimerObjs.push(setInterval(function(){connTimeout(15)},GW_TIMEOUT));


rssiTimerObjs.push(setInterval(function(){rssiTimeout(1)},RSSI_TIMEOUT));
rssiTimerObjs.push(setInterval(function(){rssiTimeout(2)},RSSI_TIMEOUT));
rssiTimerObjs.push(setInterval(function(){rssiTimeout(3)},RSSI_TIMEOUT));
rssiTimerObjs.push(setInterval(function(){rssiTimeout(4)},RSSI_TIMEOUT));
rssiTimerObjs.push(setInterval(function(){rssiTimeout(5)},RSSI_TIMEOUT));
rssiTimerObjs.push(setInterval(function(){rssiTimeout(6)},RSSI_TIMEOUT));
rssiTimerObjs.push(setInterval(function(){rssiTimeout(7)},RSSI_TIMEOUT));
rssiTimerObjs.push(setInterval(function(){rssiTimeout(8)},RSSI_TIMEOUT));
rssiTimerObjs.push(setInterval(function(){rssiTimeout(9)},RSSI_TIMEOUT));
rssiTimerObjs.push(setInterval(function(){rssiTimeout(10)},RSSI_TIMEOUT))
rssiTimerObjs.push(setInterval(function(){rssiTimeout(11)},RSSI_TIMEOUT))
rssiTimerObjs.push(setInterval(function(){rssiTimeout(12)},RSSI_TIMEOUT))
rssiTimerObjs.push(setInterval(function(){rssiTimeout(13)},RSSI_TIMEOUT))
rssiTimerObjs.push(setInterval(function(){rssiTimeout(14)},RSSI_TIMEOUT))
rssiTimerObjs.push(setInterval(function(){rssiTimeout(15)},RSSI_TIMEOUT))

function sendGPSData(nmeaSentence)
{
    if(nmeaSentence!= null)
    {
        io.emit('gps',nmeaSentence);
    }
}

function connTimeout(gw)
{
    if(gw != null)
    {
        io.emit("CONN_TIMEOUT",{ 'gw': gw.toString() });
    }
}

function rssiTimeout(gw)
{
    if(gw != null)
    {
        io.emit("RSSI_TIMEOUT",{ 'gw': gw.toString() });
    }
}

function sendIntTempData(temp)
{
    if(temp != null)
    {
        io.emit('INT_TEMP',{ 'temp': temp });
    }
}

function sendExtTempData(temp)
{
    if(temp != null)
    {
      io.emit('EXT_TEMP',{ 'temp': temp });
    }
}

function sendCallData(call)
{
    if(call != null)
    {
        io.emit('CALL',{ 'call': call });
    }
}

function sendPresData(pres)
{
    if(pres != null)
    {
        io.emit('PRES',{ 'pres': pres });
    }
}

function sendHumData(hum)
{
    if(hum != null)
    {
        io.emit('HUM',{ 'hum': hum });
    }
}

function sendBattData(batt)
{
    if(batt != null)
    {
      io.emit('BATT',{ 'batt': batt });
    }
}

function processRSSIMsg(gw_rssi)
{
    var gwID         = null
    var splitMessage = ""

    splitMessage = gw_rssi.split(' ')

    if(splitMessage[0] != null)
    {
        if(splitMessage[1] != null)
    	{
            io.emit("RSSI",{ 'gw':splitMessage[0],'rssi':splitMessage[1]});
            gwID = parseInt(splitMessage[0]);
  	    rssiTimerObjs[gwID-1].refresh();
        }
    }
}

function processPingMsg(gw)
{
    var gwID = null

    if(gw != null)
    {
        io.emit("PING",{ 'gw': gw });
        gwID = parseInt(gw)
        connTimerObjs[gwID-1].refresh();
    }
}

function sendTelemetry(GPSJSON)
{
    if(GPSJSON != null)
    {
      io.emit('GPS',GPSJSON);
    }
}

wss.on('connection', function connection(ws) {
    console.log('wss connected')

    ws.on('error', console.error);

    ws.on('message', function message(message) {
        var strMessage   = ""
        var splitMessage = ""
        console.log("*************** Gateway Data ***********"+ message);

        strMessage   = message.toString()
        splitMessage = strMessage.split('$G')
        if(splitMessage[0] == '')
        {
            try
            {
                const packet = nmea.parseNmeaSentence(message+'\n'+'\r');

                if (packet.sentenceId === "RMC")
                {
                    //console.log("Got location via RMC packet:", packet.latitude, packet.longitude);
                    sendTelemetry(packet)
                }

                if (packet.sentenceId === "GGA") 
                {
                    //console.log("Got location via GGA packet:", packet.latitude, packet.longitude);
                    sendTelemetry(packet)
                }
            } 
            catch (error)
            {
                console.error("Got bad packet:", strMessage, error);
            }
        }
        else
        {
            splitMessage = strMessage.split('$INT_TEMP')
            if(splitMessage[0] == '')
            {
                sendIntTempData(splitMessage[1])
            }

            splitMessage = strMessage.split('$EXT_TEMP')
            if(splitMessage[0] == '')
            {
                sendExtTempData(splitMessage[1])
            }

            splitMessage = strMessage.split('$CALL')
            if(splitMessage[0] == '')
            {
                sendCallData(splitMessage[1])
            }

            splitMessage = strMessage.split('$PRES')
            if(splitMessage[0] == '')
            {
                sendPresData(splitMessage[1])
            }

            splitMessage = strMessage.split('$HUM')
            if(splitMessage[0] == '')
            {
                sendHumData(splitMessage[1])
            }
              	    
            splitMessage = strMessage.split('$BATT')
            if(splitMessage[0] == '')
            {
                sendBattData(splitMessage[1])
            }

            splitMessage = strMessage.split('$RSSI_GW')
            if(splitMessage[0] == '')
            {
                processRSSIMsg(splitMessage[1])
            }

            splitMessage = strMessage.split('$PING_GW')
            if(splitMessage[0] == '')
            {
                processPingMsg(splitMessage[1])
            }
        }
    });

    ws.on('close', function close() {
        console.log('wss disconnected');
    });
});


fifo_req.on('exit', function(status) {
    console.log('Created Req Pipe');

    fifoWs = fs.createWriteStream(path_req);

    console.log('JS fs.createWriteStream(path_req)')

    console.log("Js Start Python");
    const pyProg = spawn('./imageSeqFileManager.sh', ['']);
    pyProg.stdout.on('data', function(data) {
    console.log(data.toString());
    });

});


app.use('/images', Gallery('logs/images', options));

ftpServer.on('login', ({connection, username, password}, resolve, reject) => 
{
    if(username === "sonde" && password === "sonde")
    {
        // call resolve 
       resolve({root: 'logs/imageSeq'});
    }
    else
    {
        // if password and username are incorrectly then call reject
        reject({});
    }

    connection.on('STOR', (error, fileName) => 
    {
        console.log("***************  STOR ***********" + fileName);
        fifoWs.write(fileName + "\n")
        console.log("Wrote to fifoWs")
        sleep.sleep(2)
    });
});

ftpServer.listen()
    .then(() =>
    {
        console.log ( `Server Running at ftp://${HOST_ADDR}:${FTP_PORT}` );
    }); 
