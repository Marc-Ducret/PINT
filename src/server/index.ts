require("amd-loader");

import * as express from 'express';
import * as socketio from 'socket.io';
import * as http from 'http';
import * as path from 'path';
import * as serveStatic from 'serve-static';
import {Vec2} from "../client/ts/vec2";
import {Project} from "../client/ts/docState";

let app = express();

const port = process.env.PORT || 8080;

let server = http.createServer(app);
let io: SocketIO.Server = socketio(server);

server.listen(port, function() {
    console.log('Server listening on port %d', port);
});

app.use(serveStatic(path.join(__dirname, '../client/')));


let project = new Project(this, "0", new Vec2(800,600));

io.on("connection", function (socket: SocketIO.Socket) {
    socket.on("join", function (name: string) {
        console.log("Client joining drawing `"+name+"`");


        let data = {
            dimensions: project.dimensions,
            data: project.currentLayer.getContext().getImageData(0, 0, project.dimensions.x, project.dimensions.y),
        };
        socket.emit("joined", data);
    })
});