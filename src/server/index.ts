import * as express from 'express';
import * as socketio from 'socket.io';
import * as http from 'http';
import * as path from 'path';
import * as serveStatic from 'serve-static';

let app = express();

const port = process.env.PORT || 8080;

let server = http.createServer(app);
let io: SocketIO.Server = socketio(server);

server.listen(port, function() {
    console.log('Server listening on port %d', port);
});

app.use(serveStatic(path.join(__dirname, 'html')));

io.on("connection", function (socket: SocketIO.Socket) {
    console.log("Some guy just connected.");
});