import express from 'express';
// import ViteExpress from "vite-express";
// import 'mysql2';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const app = express();
const path = require('path');
const PORT = process.env.PORT || 5173;

app.use(express.json());

app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/root'));
app.use('/users', require('./routes/userRoutes'));

app.all('*', (req,res) => {
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
})

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));