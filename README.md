
# PINT  [![Build Status](https://travis-ci.org/VengeurK/PINT.svg?branch=master)](https://travis-ci.org/VengeurK/PINT)

PINT is a revolutionary painting Web-app rocking on JavaScript and HTML5 canvas.

The latest build is available on [Heroku](https://pintjs.herokuapp.com/).

## Features

PINT is an open source alternative to the Glorious Microsoft Paint. 
Most standard features are therefore available:
* Line and shape drawing
* Selection, copy and paste
* Pen drawing
* Fill tool
* Transparency channel
* Layers with composition settings
* Import/export image

Moreover it can either be built as:
 * a standalone client-side app.
 * a server hosting multiple drawings and that features online collaboration.

## Development 

PINT is written in [Typescript](https://www.typescriptlang.org/) 2.5.3. 
The source code documentation is available [here](https://vengeurk.github.io/PINT/doc).
You can find [hints](https://github.com/VengeurK/PINT/blob/master/CONTRIBUTING.md) to understand the structure of the project.
### Installation 
Requirements:
* a keyboard
* a computer
* NodeJS 6.x 

Project setup:
* ``npm install -g grunt-cli`` (might need to be as root)
* ``npm install``

### Build
* Standalone client build: ``grunt standalone-client``
* Server build: ``grunt server``

### Run and test
#### Server
* Start server: ```npm start```
#### Client
* A folder named ```pint-<arch>``` should have been created after build. 
Launching ```pint-<arch>/pint``` should launch the app.
#### Misc
* Documentation: ``grunt doc``
* Tests: ``npm test``
* Clean: ``grunt clean``