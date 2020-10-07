//Start-up: change IP in sketch.js with current IP. Run server.js in root directory  "node server.js"

const express = require('express')
const socket = require('socket.io')
const osc = require('osc')
const { notes } = require('./lib/lib.js')
let balls = [];

function Ball(id, x, y, r) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.r = r;
}

const app = express()

app.use(express.static('public'));

let server = app.listen(8000, function () {
    console.log(`Listening to requests on http://localhost:${server.address().port} | OSC Port:${udpPort.options.remotePort}`);
});

let io = socket(server);

const udpPort = new osc.UDPPort({
    // This is the port we're listening on.
    localAddress: "127.0.0.1",
    localPort: 57121,

    // This is where sclang is listening for OSC messages.
    remoteAddress: "127.0.0.1",
    remotePort: 57120,
    metadata: true
});

udpPort.open()

function normalizeData(value, min, max) {
    (value - min) / (max - min)
    return
};

setInterval(heartbeat, 33);

function heartbeat() {
    io.sockets.emit('heartbeat', balls)
};

io.sockets.on('connection', (socket) => {

    console.log('A client has connected: ' + socket.id);

    socket.on('start', (data) => {
        let ball = new Ball(socket.id, data.x, data.y, data.r*2);
        balls.push(ball);
        //console.log(socket.id, data.x, data.y, data.r);
        //io.sockets.emit('start', data)
    });

    socket.on('update', (data) => {
        //console.log( data.x, data.y, data.r);
        let ball = {};
        for(let i=0; i < balls.length; i++) {
            if(socket.id == balls[i].id) {
                ball = balls[i];
            }
        }
        ball.x = data.x,
        ball.y = data.y,
        ball.r = data.r
    });

    socket.on('disconnecting', (reason) => {
        console.log(`A client has disconnected cause: ${reason}`)
    })

    socket.on('controller', (data) => { //receive and forward OSC bundle.

        const msg = {

            timeTag: osc.timeTag(60),

            packets: [
                {
                    address: '/neural/net/regression',
                    args: [
                        {
                            type: 'f',
                            value: data[0]
                        }
                    ]
                },
                {
                    address: '/neural/net/cursor/x',
                    args: [
                        {
                            type: 'f',
                            value: data[1]
                        }
                    ]
                },
                {
                    address: '/neural/net/cursor/y',
                    args: [
                        {
                            type: 'f',
                            value: data[2]
                        }
                    ]
                }
            ]

        }

        data.map((elem) => {

            if( elem !== NaN && elem !== null && elem !== undefined  ){

                udpPort.send(msg)

            } else {

                console.log('undefined data')
                
            }
            
        })

        console.log("Sending OSC", msg.packets, "to", udpPort.options.remoteAddress + ":" + udpPort.options.remotePort)

    })

})
