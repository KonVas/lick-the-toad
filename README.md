# Lick the toad
Sonification project using neural net and SuperCollider.

Some videos demonstrating the project [here](https://www.youtube.com/playlist?list=PLiCZTYIqSUAb1J-Iu4lhVwDz6ljKCVj-W)

## Overview of the project
This project aims to explore the idea of remoteness vs. isolation. It is using a custom made system that acts as a digital bridge over interconnected peers across the network using a web interface accessed by URL. 

Users are able to interact with each other while being connected to a main hub which in turn will be able to render this data to sound and visuals incorporating machine learning capabilities. 

This project stems from my personal interest using custom made generative systems enacting human intervention.  

The generated output can control real time sonfication algorithms which will run independently, but it may also be used as raw material for live coding and thusly expand on other performance possibilities and interactive media making it a highly flexible and versatile project. 

Other inputs, which could be used from the provided resources may include the motion capture system available on site, and use this data to train the model of the machine learning system. 

The system provides a user interface through which one is able to interact with other connected users, and generate data using their location or manually. 

At the moment the system uses a model to train a neural network and provide prediction output which is used as raw material for real time sound synthesis algorithms implemented in SuperCollider. 
Specifically, the interface will offer a mouse object which can be dragged by the user, but my intention is to use location sensors (this viability can be discussed with the event organizers furtherly). 

While this provides a minimal approach of user interaction, no complications attached, it also provides a medium to collaborate with other logged users locally and/or remotely. 

## Back-end support
The app will be installed on a server where and be accessible via a URL. However, at the moment it runs locally using NodeJS and thus is only accessible in a local network.

## Technical specifications
The system is developed as a cross platform application running on NodeJS, and JavaScript and various frameworks for sound/visuals, machine learning etc.
Additional details regarding the modules that the system is using can be provided upon request.
