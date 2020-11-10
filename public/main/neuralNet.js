
let state = 'waiting', xoff = 0.0, speedSlider, modelInfo, learnRate = 0.2, targetSlider;
let socket, brain, rgrsn = 0.0, cursor = {}, epochsSlider, epochs = 10, rotX = 0;

const inputs = []


const freqs = {
    low: 80,
    mid: 220,
    high: 660
}



/*function mousePressed() {
  if (mouseX > 0 && mouseX < 100 && mouseY > 0 && mouseY < 100) {
  let fs = fullscreen();
  fullscreen(!fs);
  }
  }
*/

const options = {
    task: 'regression',
    debug: true
}

const trainingOptions = {
    epochs: 20,
    batchSize: 12
}




function setup(){
    createCanvas(displayWidth, displayHeight)

    background(0)
    strokeWeight(1.25);
    stroke(304)
    colorMode(HSB, 255);

    let modelInfo = {
        model: '../model/model.json',
        metadata: '../model/model_meta.json',
        weights: '../model/model.weights.bin'
    }

    brain = ml5.neuralNetwork(options)

    //brain.load(modelInfo, modelLoaded)

    //Host IP address
    socket = io.connect('http://192.168.1.102:8000/')

    //receive input data from server
    socket.on('heartbeat', (data) => {
        let inputs = []
        if(data !== null && state == 'collecting'){
            data.forEach(items => {
                if(items.id !== " ")
                    inputs.push(items)
            })
            getInputs(inputs)
        }
    })
}

function getInputs(data) {
    if(data == null){
        console.log('no data flow')
    }
    else {
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
        console.log(data)
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

        console.log('training started')

        brain.normalizeData()

        brain.train(trainingOptions, whileTraining, finished)
    }

    //load file from data folder
    if(key == 'd' && state == 'waiting') {
        brain.loadData('../data/data.json', dataLoaded)
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
    console.log(trainingOptions)

    brain.normalizeData()
    brain.train(trainingOptions, whileTraining, finished)
}

function modelLoaded() {
    console.log('model loaded')
    //state = 'prediction' //comment for training the model.
}


function whileTraining(epoch, loss){
    console.log(`epoch:${epoch}, loss:${loss}`)
}

function finished(){
    console.log('training finished!')
    state = 'prediction'
    inputs.push(brain.data.training)
    //brain.predict([mouseX, mouseY], handleResults)
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

/*
  function drawCursor() {
  noFill()
  let speedCursor = speedSlider.value()
  xoff = xoff + speedCursor
  cursor = {
  x:noise(xoff) * width,
  y:noise(xoff) * height
  }
  line(cursor.x, 0, cursor.x, height)
  line(0, cursor.y, width, cursor.y)
  brain.predict(cursor, handleResults)
  }

  function drawCursorVals(){
  text("X: " +cursor.x, 10, 30)
  text("Y: " +cursor.y, 10, 45)
  text("Rgrsn: " +regression_rate, 10, 60)
  }
*/

function draw(){
    noStroke()
    background(0)
    rotX+= 0.02

    if(state == 'collecting') {
        fill(255);
        textSize(32);
        floor(text('collecting...', width/2, height/2))
    }

    if(state == 'prediction') {
        let mx, my;
        inputs[0].forEach(items => {
            let inputs = items.xs
            mx = map(inputs.x, 0, 1, 0, width)
            my = map(inputs.y, 0, 1, 0, height)
            ellipse(mx,  my, 20)
            fill('grey')
            text(rgrsn, mouseX, mouseY)
        })



    }

}

function mouseDragged(){
    brain.predict([mouseX, mouseY], handleResults)
}

function handleResults(error, result) {
    if(error){
        console.error(error);
        return
    }

    console.log(result[0])
    rgrsn = parseFloat(result[0].value)
    socket.emit('controller', [rgrsn, mouseX, mouseY])
}
