import app from './App';

const port = process.env.port || 8080;

app.listen(port, (err) => {
    if (err) {
        return console.log(err);
    }

    return console.log(`Server is listening on port ${port}`);
});