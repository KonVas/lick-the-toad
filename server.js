const express = require('express')
const app = express()
const Ball = require('./api/Ball.js')
const host = "192.168.1.104"
let port;
let handshake;

const osc = require('osc'),
      WebSocket = require('ws');

var getIPAddresses = function () {
    var os = require("os"),
    interfaces = os.networkInterfaces(),
    ipAddresses = [];

    for (var deviceName in interfaces){
        var addresses = interfaces[deviceName];

        for (var i = 0; i < addresses.length; i++) {
            var addressInfo = addresses[i];

            if (addressInfo.family === "IPv4" && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }

    return ipAddresses;
};

let udp = new osc.UDPPort({
    // This is the port we're listening on.
    localAddress: "0.0.0.0",
    localPort: 57121,
    // This is where sclang is listening for OSC messages.
    remoteAddress: "127.0.0.1",
    remotePort: 57120
})

udp.on("ready", function () {
    var ipAddresses = getIPAddresses();
    console.log("Listening for OSC over UDP.");
    ipAddresses.forEach(function (address) {
        console.log(" Host:", address + ", Port:", udp.options.localPort);
    });
    console.log("Broadcasting OSC over UDP to", udp.options.remoteAddress + ", Port:", udp.options.remotePort);
})

udp.open()

var wss = new WebSocket.Server({
    port: 8081
})

wss.on("connection", function (socket) {

    console.log(`New OSC client was connected: ${handshake.address}`);

    let socketPort = new osc.WebSocketPort({
        socket: socket
    })

    let relay = new osc.Relay(udp, socketPort, {
        raw: true
    })
})


let server = app.listen(8000, host, function() {
    port = server.address().port
    console.info(`Server is running: http://${host}:${port}/main/`);
});

const io = require("socket.io")(server, {
    cors: {
        origin: `http://${server.address.host}:${server.address.port}`,
        methods: ["GET", "POST"],
        credentials: true
    }
});

let balls = [];

app.use(express.static('public'));

app.get('/osc-browser.min.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/osc/dist/osc-browser.min.js');
})

/*osc.udpPort.on("message", (oscMsg) => {
    console.log("An OSC message just arrived!", oscMsg)
})*/


function heartbeat() {
    io.sockets.emit('heartbeat', balls)
    //console.log(balls)
}

setInterval(heartbeat, 33)

io.sockets.on('connection', (socket) => {

    handshake = socket.handshake

    socket.on('usr', (data) => {
        console.log(`New Client Connection \n ============ \n ID: ${data.customId.toUpperCase()} \n IP: ${handshake.address} \n When: ${handshake.time} \n ============= \n`)
        socket.customId = data.customId
        //  })

        //    socket.on('start', (data) => { //was socket.id insted username
        let ball = new Ball (socket.customId, data.x, data.y, data.r*2)
        balls.push(ball)
        //  console.log(ball)
    })

    socket.on('update', (data) => {

        let ball = {}

        for(let i=0; i < balls.length; i++) {
            if(socket.customId == balls[i].id) {
                ball = balls[i]
            }
        }
        ball.x = data.x,
        ball.y = data.y,
        ball.r = data.r
    })

    socket.on('disconnecting', (cause) => {
        console.info(`--- Update: ${socket.customId} (${handshake.address}) has disconnected (reason) => ${cause} ---`)
        delete socket.customId
        balls.splice(0,1)
    })

    let objectData = {}, obj

    /*socket.on('controller', (data) =>  {

        console.log(data)

        objectData = {
            frequency: data[0].frequency,
            raw: data[0].unNormalizedValue,
            x_pos: data[1],
            y_pos: data[2]
        }

        obj = Object.fromEntries(
            Object.entries(objectData).map(([key, value]) => [key, value.toFixed(2)])
        )

        function dataFilterDup(array) {
            return new Set(array).size !== data.length
        }

        if(dataFilterDup(data)){
            console.warn("array length changed")
        } else {
            osc.udpPort.send({
                address: "/lick/the/toad",
                args: [
                    {
                        type: 's',
                        value: JSON.stringify(obj)
                    }
                ]
            })
        }

    })*/
})
