# Lick the toad
Hybrid sonification project using machine learning and neural networks.

## Overview of the project
This project aims to explore the idea of remoteness & isolation. It is a custom made system that works as a digital bridge over interconnected peers across the network (currently works only locally).  This project stems from my personal interest using custom made generative systems enacting human interaction and sonification, and [networked music systems](https://konvas.github.io/ice/). Some primary videos demonstrating the project can be found [here](https://www.youtube.com/playlist?list=PLiCZTYIqSUAb1J-Iu4lhVwDz6ljKCVj-W)

## Modus Operandi 

### User Interface
Each user has a custom made client interface which may be accessed via local and ad-hoc networ, dragging X and Y positions of each participating client are emitted as training data of the neural network model. Client communication is through web-sockets (see technical details at the end of this page).

![](https://github.com/KonVas/lick-the-toad/blob/main/images/user.gif?raw=true)

### Training Interface
At the moment the system uses a model to train a neural network using the X and Y of the user inputs, once the model is trained the system streams out the prediction rates using [regression](https://en.wikipedia.org/wiki/Regression_analysis) and X and Y values of the cursor position. These rates are then used as raw material for real time sound synthesis algorithms implemented in SuperCollider.

![](https://github.com/KonVas/lick-the-toad/blob/main/images/nnet.gif?raw=true)

### Creative Outcomes
The generated output can control real time sonfication algorithms which can run independently as an interactive installation and "on site" work and/or received by other performers remotely and thus can be interpreted to other sonification ad-hoc processes online expanding it as networked music system. Thus, the system provides a hybrid mode of interaction, and can be used in many contexts. Data can be distributed to other audio platforms supporting OSC communication.

![](https://github.com/KonVas/lick-the-toad/blob/main/images/audio-control-ltt.gif?raw=true)

## Technical specifications
The system is developed as a cross platform application running on NodeJS, and JavaScript and [SuperCollider](https://supercollider.github.io), and [ml5](https://ml5js.org) for the implementation of machine learning capabilities. Client and SuperCollider communication is via websockets and [Socket.io](https://socket.io). I am using SC for sonification but any other audio environment able to receive OSC messages can be used.

## Stage planning
This is based in an immersive environment ideally, a dark space. The projection must be placed vertically inside the room somewhere from top and facing to the floor. The cursor is scanning the room constantly and diffusing the sound to the speaker(s) that is closer.

![](https://github.com/KonVas/lick-the-toad/blob/main/images/lickthetoad_stageplan.jpg)

## Acknowledgments
I would like to express my gratitude to the following coding communities of [P5.js](https://p5js.org) and [Ml5.js](https://ml5js.org) respectivelly.
