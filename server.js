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

const {createServer} = require('http');
const allowedOrigins = require('./config/allowedOrigins');
const server = createServer(app);
const io = require('socket.io')(server, {cors: {origin: allowedOrigins}});
console.log("Websocket server running");
io.on('connection', socket => {
    console.log("client connected");
    socket.on('join-table', (tableID, userID) => {
        socket.join(tableID);
        console.log(`tableID: ${tableID}`)
        // module.exports.sendMessage = (roomId, event, message) => {
        //     console.log(message);
        //     console.log(event);
        //     socket.to(roomId).emit(event, message)
        // };
        
    })
    module.exports = io;
    
})

mongoose.connection.once('open', () => {
    console.log("Connected to MongoDB");
    server.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    })
});

mongoose.connection.on('error', err => {
    console.log(err);
});

// module.exports.sendMessage = (roomId, event, message) => io.to(roomId).broadcast.emit(event, message);
