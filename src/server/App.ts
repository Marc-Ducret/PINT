import * as express from 'express';
import * as serveStatic from 'serve-static';
import * as path from 'path';

class App {
    public express;

    constructor () {
        this.express = express();
        this.mountStaticServer();
    }

    private mountStaticServer (): void {
        this.express.use(serveStatic(path.join(__dirname, 'html')));
    }
}

export default new App().express;