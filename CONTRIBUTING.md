# How to contribute
Here are some indications to contribute to PINT.
## Project architecture
* ```build```: project build output
* ```coverage```: test coverage reports
* ```src```: source code
* ```test```: test code
### Source code (```src```)
Here is the interesting part.
#### Client (```client```)
* ```assets```: Graphical elements that might be displayed
* ```css```: Style sheets
* ```ts```: Typescript code (see Code architecture)
#### Server (```server```)
There is only Javascript and Typescript code in this directory. 
It may use code from the client directory as both are built jointly.
## Code architecture
Modularity and abstraction is the key and the goal of this project.
### Document instance
A ```Project``` represents an open document, with its settings and layers.
Its main way of communication is through ```ActionInterface``` that encode every alteration of the document.
### Tools
A the ```Tool``` abstract class generalizes the features of a tool and is the only way to interact with both the project
and user interface. It can request settings from the user interface through ```SettingsRequester``` and generate actions 
through ```ActionInterface```. 
### Selection
Selection is considered as a Special setting and can be requested and altered like other parameters.
### Network
```NetworkLink``` is the client side of the socket, that encapsulates socket data with ```ActionInterface``` to create 
an ```ActionNetworkPacket```. Therefore ```ActionInterface``` must contain serializable data that can be passed through 
the network. 
### Server
The server has a local copy of every shared project, and performs every action like the clients. Moreover it handles the
```PintHistory``` class whose name is pretty straightforward. 
## Guidelines
Please don't make a mess.