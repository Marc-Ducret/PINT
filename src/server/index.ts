import * as express from 'express';
import * as socketio from 'socket.io';
import * as http from 'http';
import * as path from 'path';
import * as serveStatic from 'serve-static';
import {Vec2} from "../client/ts/vec2";
import {Project} from "../client/ts/docState";
import {ActionNetworkPacket, HelloNetworkPacket} from "../client/ts/networkLink";
import {PixelSelectionHandler} from "../client/ts/selection/selection";

let app = express();

const port = process.env.PORT || 8080;

let server = http.createServer(app);
let io: SocketIO.Server = socketio(server);

server.listen(port, function() {
    console.log('Server listening on port %d', port);
});

app.use('/src/', serveStatic(path.join(__dirname, '../../src/')));
app.use('/', serveStatic(path.join(__dirname, '../client/')));


let project = new Project(null, "0", new Vec2(800,600));
let selectionHandlers: {[id: string]: PixelSelectionHandler} = {};
let clients: {[id: string]: SocketIO.Socket} = {};

io.on("connection", function (socket: SocketIO.Socket) {
    socket.on("join", function (name: string) {
        console.log(socket.id + " joining drawing `"+name+"`");

        let data = {
            dimensions: project.dimensions,
            data: project.currentLayer.getHTMLElement().toDataURL(),
        };

        socket.emit("joined", data);
        for (let id in selectionHandlers) {
            let hello: HelloNetworkPacket = {
                sender: id,
                serializedSelection: selectionHandlers[id].serialize(),
            };
            socket.emit ("hello", hello);
        }


        selectionHandlers[socket.id] = new PixelSelectionHandler(null, 800, 600);

        let hello: HelloNetworkPacket = {
            sender: socket.id,
            serializedSelection: selectionHandlers[socket.id].serialize(),
        };

        for (let id in clients) {
            clients[id].emit("hello", hello);
        }

        clients[socket.id] = socket;
    });

    socket.on("disconnect", function() {
        console.log(socket.id + " left.");
        delete selectionHandlers[socket.id];
        delete clients[socket.id];
    });

    socket.on("action", function (data: ActionNetworkPacket) {
        if (data.sender !== socket.id) {
          console.warn("Some guy is trying to fuck everything up.");
          socket.disconnect();
        }

        io.sockets.emit("action", data);
        console.log("Action by " + data.sender + " with tool " + data.data.toolName);
        project.applyAction(data.data, selectionHandlers[data.sender]);
    })
});