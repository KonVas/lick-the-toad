let state = 'waiting',
    predictionMode = 'manual',
    xoff = 0.0,
    speedSlider,
    modelInfo,
    socket,
    brain,
    cursor = {},
    button,
    inputs = [],
    oscObjMsg = {},
    msg = {};//oscPort;



let freqs = {
    low: 80,
    mid: 220,
    high: 660
}

const options = {
    task: 'regression',
    debug: true
}

const trainingOptions = {
    epochs: 20,
    batchSize: 12
}

function setup(){
    createCanvas(windowWidth, windowHeight)

    stroke(204)

    colorMode(HSB, 255);

    speedSlider = createSlider(0, 0.1, 0.001, 0.001);
    speedSlider.position(10, 100);
    speedSlider.style('width', '200px');


    let modelInfo = {
        model: '../model/model.json',
        metadata: '../model/model_meta.json',
        weights: '../model/model.weights.bin'
    }

    brain = ml5.neuralNetwork(options)

    //brain.load(modelInfo, modelLoaded)

    //Host IP address
    socket = io.connect('http://192.168.1.104:8000', {reconnect:true})

    function checkInput(input){
        console.log("Data received:", input)
    }

    //receive input data from ball clients
    socket.on('heartbeat', (data) => {
        //console.log(data)
        let inputs = []
        if(data !== null && state == 'collecting'){
            data.forEach(items => {
                if(items.id !== " ")
                    inputs.push(items)
            })
            getInputs(inputs)
            //console.log(inputs)
        }
    })

}

/*
//OSC UDP-Browser Configuration
    oscPort = new osc.WebSocketPort({
        url: "ws://192.168.1.104:8081",
        metadata: true
    })

oscPort.open()

function checkBadVals(input){
    msg = Object.fromEntries(
        Object.entries(input).map(([key, value]) => [key, value.toFixed(2)])
    )
}

function sendOSCMsg(input) {

    if(checkBadVals(input) === NaN){
        console.log(`NaN values detected ${vals}`)
    } else {

        oscPort.send({
            address: '/lick-the-toad/osc-data/to-sc',
            args: [
                {
                    type: 's',
                    value: JSON.stringify(socket.id)
                },
                {
                    type: 's',
                    value: JSON.stringify(msg)
                }
            ]
        })
    }

}*/

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function getInputs(data) {
    if(data == null){
        console.log('no data flow')
    }   else {
        data.forEach(item => {
            let inputs = {
                x: item.x,
                y: item.y
            }
            let target = {
                label: freqs[item.id]
            }
            brain.addData(inputs, target)
        })
        //console.log(data)
        return inputs
    }
}

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function keyPressed(){
    if (key == 's') {
        brain.saveData('data')
    }
    else if (key == 'c') {

        await sleep(1000)
        state = 'collecting'
        console.log('collecting...')
        await sleep(1000)
        console.log('done collecting!')
        state = 'waiting'

    }


    if(key == 't' && state == 'waiting') {

        state = 'training'

        console.log('training started')

        brain.normalizeData()

        brain.train(trainingOptions, whileTraining, finished)
    }

    //load file from data folder
    if(key == 'd' && state == 'waiting') {
        brain.loadData('./data.json', dataLoaded)
    }

    //save model in model folder
    if(key == 'm' && state == 'prediction') {
        brain.save('model')
    }
}

function dataLoaded(){
    console.log('data loaded')

    state = 'training'

    console.log('starting training')
    //console.log(trainingOptions)

    brain.normalizeData()
    brain.train(trainingOptions, whileTraining, finished)
}

function modelLoaded() {
    console.log('model loaded')
    //state = 'prediction' //comment for training the model.
}


function whileTraining(epoch, loss){
    //console.log(`epoch:${epoch}, loss:${loss}`)
}

function finished(){
    let data = brain.data.training
    console.log('training finished!')
    state = 'prediction'
    inputs.push(data)
    //brain.predict([mouseX, mouseY], handleResults)
    //brain.neuralNetwork.model.layers[0].getWeights()[0].print()
}

/*function ballVals(){
  noFill()
  let ball = []
  let inputs = getInputs()
  let x = 25
  let y = 165
  for (let i=0; i < inputs.length; i++){
  text(" ID: " + inputs[i].id, x, y)
  ball = inputs[i]
  text(["X: " + ball.x / width + "\n" + "Y: "+ ball.y / height], x + 200, y)
  x += 0
  y += 45
  }
  }*/

/*function drawData(){
  let inputs = getInputs()

  if(inputs == null){
  console.log('no data loaded')

  } else {

  inputs.forEach(items => {
  let inputs = items.xs
  let targets = items.ys

  //multiplied to scale in screen size using map.
  strokeWeight(0.2)
  background(0)
  //noFill()
  ellipse(
  inputs.x / 2,
  inputs.y / 2,
  targets.r / 2
  )
  })
  }
  }
*/

//predict using a cursor controlled by Perlin noise generator.

function drawCursor() {
    if(state == 'prediction' && predictionMode == 'automatic') {
        let speedCursor = speedSlider.value()


        xoff = xoff + speedCursor / 2

        cursor = {
            x:noise(xoff) * windowWidth,
            y:noise(xoff) * windowHeight
        }

        line(cursor.x, 0, cursor.x, windowHeight)
        line(0, cursor.y, windowWidth, cursor.y)

        brain.predict([cursor.x, cursor.y], handleResults)

    } else {
        cursor = {
            x:mouseX,
            y:mouseY
        }

        line(cursor.x, 0, cursor.x, windowHeight)
        line(0, cursor.y, windowWidth, cursor.y)

    }
}

function drawCords(){
    text("X: " + cursor.x, 10, 30)
    text("Y: " + cursor.y, 10, 45)
    text("RegressionValue: " + parseFloat(oscObjMsg.freq).toFixed(2), 10, 60)
}

function draw(){
    background(0)
    noSmooth();

    if(state == 'collecting') {
        floor( text("collecting".toUpperCase(), windowWidth/2, windowHeight/2) )
    }

    if(state == 'prediction') {
        let x, y;
        inputs[0].forEach(items => {
            let inputs = items.xs
            x = map(inputs.x, 0, 1, 0, windowWidth)
            y = map(inputs.y, 0, 1, 0, windowHeight)

            stroke(255)
            point(x,  y)
        })

        noFill()
        drawCursor()
        drawCords()
        brain.predict(cursor, handleResults)
    }
}

//predict manually using mouse coordinates
function mouseDragged(){
    if(state == 'prediction' && predictionMode == 'manual'){
        brain.predict([mouseX, mouseY], handleResults)
    }
}

function handleResults(error, result) {
    if(error){
        console.error(error);
        return
    }
    //socket.emit('controller', [result[0], cursor.x, cursor.y])
    
    oscObjMsg = {
        freq: result[0].value,
        raw: result[0].unNormalizedValue,
        x_pos: cursor.x,
        y_pos: cursor.y
    }

    //console.log(result[0])

    sendOSC(oscObjMsg)
}
