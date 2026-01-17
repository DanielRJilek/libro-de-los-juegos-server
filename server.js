require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const PORT = process.env.PORT || 10000;
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');

connectDB();

app.use(cors(corsOptions));
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'public')));

const indexRouter = require('./routes/root');
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const gameRouter = require('./routes/gameRoutes');

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/games', gameRouter);

app.all('/*splat', (req,res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', 'error.html'))
    }
    else if (req.accepts('json')) {
        res.json({message: '404 not found'})
    }
    else {
        res.type('txt').send('404 not found')
    }
});

const {createServer} = require('http')
const server = createServer(app);
// const WebSocket = require('ws');
// const wss = new WebSocket.Server({server, path: '/ws'});
// console.log("Websocket server running");
const wss = require('./webSocket').init(server, path);
wss.on('connection', function connection(ws) {
    console.log("Client connected");
    ws.send("Hello client!");
    ws.on('error', console.error);

    ws.on('message', function message(data) {
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });
    // const broadcast = (msg) => {
    //     wss.clients.forEach(function each(client) {
    //         if (client.readyState === WebSocket.OPEN) {
    //             client.send(data);
    //         }
    //     });
    // }
});
wss.on('close', () => {
    console.log("client disconnected");
})



mongoose.connection.once('open', () => {
    console.log("Connected to MongoDB");
    // app.listen(PORT, (error) => {
    //     if (error) {
    //         throw error;
    //     }
    //     console.log(`Server is listening on port ${PORT}`);
    // });
    server.listen(PORT, () => {
    console.log(`Websocket server is listening on port ${PORT}`);
    })
});

mongoose.connection.on('error', err => {
    console.log(err);
});

module.exports = app;
