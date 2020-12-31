const osc = require('./osc/osc_server.js')
const express = require('express')
const app = express()
const Ball = require('./api/Ball.js')


let server = app.listen(8000, function () {
    console.log(`Listening to requests on http://localhost:${server.address().port}/main/ (OSC Port:${osc.udpPort.options.remotePort})`);
});

const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:8000",
        methods: ["GET", "POST"]
    }
});

let balls = [];

//ball api
/*function Ball(id, x, y, r) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.r = r;
}*/

app.use(express.static('public'));

osc.udpPort.open()

osc.udpPort.on("message", (oscMsg) => {
    console.log("An OSC message just arrived!", oscMsg)
})


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

    socket.on('disconnecting', (reason) => {
        console.info(`--- Update: ${socket.customId} (${handshake.address}) has disconnected (reason) => ${reason} ---`)
        delete socket.customId
        balls.splice(0,1)
    })

    socket.on('controller', (data) =>  {

        function dataFilterDup(array){
            return new Set(array).size !== data.length
        }

        if(dataFilterDup(data)){
            console.log("dups found")
        } else {
            console.log(`no dups found OSC is served to (${osc.udpPort.options.remotePort})`)

            osc.udpPort.send({
                address: "/lick/the/toad",
                args: [
                    {
                        type: 'f',
                        value: Number.parseFloat(data[0]).toFixed(2)
                    },
                    {
                        type: 'f',
                        value: data[1]
                    },
                    {
                        type: 'f',
                        value: data[2]
                    }
                ]
            })
        }

    })
})
