const express = require('express')
const socket = require('socket.io')
const osc = require('osc')
const { notes } = require('./lib/lib.js')
let balls = [];
let clients = {}
let name = ' ';

function Ball(id, x, y, r) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.r = r;
}

const app = express()

app.use(express.static('public'));

let server = app.listen(8000, function () {
    console.log(`Listening to requests on http://localhost:${server.address().port}/main/ (OSC Port:${udpPort.options.remotePort})`);
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
})

udpPort.open()


function heartbeat() {
    io.sockets.emit('heartbeat', balls)
    //console.log(balls)
}
setInterval(heartbeat, 33)


io.sockets.on('connection', (socket) => {

    let handshake = socket.handshake

    socket.on('usr', (data) => {
        console.log(`A client has connected: ${data.customId} from ${handshake.address}`)
        socket.customId = data.customId
  //  })

//    socket.on('start', (data) => { //was socket.id insted username
        let ball = new Ball(socket.customId, data.x, data.y, data.r*2)
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

    socket.on('disconnecting', (reason) => {
        console.info(`--- Update: ${socket.customId} (${handshake.address}) has disconnected (reason) => ${reason} ---`)
        delete socket.customId
        balls.splice(0,1)
    })

    socket.on('controller', (data) => {

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

        console.log(`Sending OSC ${msg.packets} to ${udpPort.options.remoteAddress} + port: ${udpPort.options.remotePort}` )

    })

})
