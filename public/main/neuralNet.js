
let state = 'waiting', xoff = 0.0, speedSlider;
let socket, brain, regression_rate = 0.0, cursor = {},  balls = [];

function setup(){
    createCanvas(720, 720)
    stroke(204)
    speedSlider = createSlider(0, 1, 0.01, 0.01);
    speedSlider.position(10, 730);
    speedSlider.style('width', '80px');
    
    let options = {
        inputs:['x', 'y'],
        outputs:['x', 'y'],
        task:'regression',
        debug:'true'
    }

    brain = ml5.neuralNetwork(options);

    //Host IP address
    socket = io.connect('http://127.0.0.1:8000/')

    //respond to event from server:
    socket.on('heartbeat', (data) => {balls=data; addDataNN(data)})
}

function addDataNN(data){
    if(state == 'collecting') {
        data.forEach(item => {
            let inputs = {
                x: item.x,
                y: item.y
            }
            let outputs = {
                x: random(width),
                y: random(height)
            }
            brain.addData(inputs, outputs)
        })
    }
}

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function keyPressed(){
    if (key == 's') {
        brain.saveData('data')
    } else if (key == 'c') {

        await sleep(3000)
        state = 'collecting'
        console.log('collecting');

        await sleep(5000)
        console.log('not collecting');
        state = 'waiting'
    }
    if(key == 'd' && state == 'waiting') {
        //load training data
        brain.loadData('../data/data-mul-targ.json', dataLoaded)
    }
}

function dataLoaded(){
    console.log('data loaded')
    let data = brain.data.data.raw
    console.log(data)
    state = 'training'
    console.log('normalizing data')
    brain.normalizeData();
    console.log('starting training')
    const trainingOptions = {
        epochs:10
    }
    brain.train(trainingOptions, whileTraining, finished)
}

function whileTraining(epoch, loss){
    console.log(`epoch:${epoch}, loss:${loss}`)
}

function finished(){
    console.log('training finished!')
    state = 'prediction'
}

function positions(){
    background('white')
    
    let ball = []
    let x = 0
    let y = 15

    for (let i=0; i < balls.length; i++){
        text("ID: "+ balls[i].id, x, y)
        ball = balls[i]
        text(["X: " +ball.x + "\n" + "Y: "+ball.y], x+250, y)
        x += 0
        y += 45
    }
}

function drawData(){
    if(brain.data == null){
        console.log('no data loaded')
    } else {

        brain.data.data.raw.forEach(items => {
        let inputs = items.xs
        let targets = items.ys
        noFill()
        ellipse(inputs.x, inputs.y, 24/2)
        ellipse(targets.x, targets.y, 24/4)
    })
    }
}

function drawCursor(){
    let speedCursor = speedSlider.value()
    xoff = xoff + speedCursor
    
    cursor = {
        x:noise(xoff) * innerWidth,
        y:noise(xoff) * innerHeight
    }
    
    line(cursor.x, 0, cursor.x, width)
    line(0, cursor.y, height, cursor.y)
    brain.predict(cursor, handleResults)
}

function drawCords(){
    text("X " +cursor.x, 10, 30)
    text("Y: " +cursor.y, 10, 45)
    text("Regression: " +regression_rate, 10, 60)
}

function draw(){
    background(0)
    if(state == 'collecting') {
        textSize(16)
        text("Collecting...", 200, 200)
        positions()
    }

    if(state == 'prediction') {
        ellipseMode(CENTER)
        translate(30, 20)
        drawData()
        drawCursor()
        drawCords()
    }
}

function handleResults(error, results) {
    if (error) {
        console.error(error)
        return
    } else {
        //console.log(`Prediction: ${results[0]}`)
        regression_rate = results[0].value
        socket.emit('controller', [regression_rate, cursor.x, cursor.y])
    }
}
