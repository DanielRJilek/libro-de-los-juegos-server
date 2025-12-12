import express from 'express';
import ViteExpress from "vite-express";
import 'mysql2';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const app = express();
const path = require('path');
const PORT = process.env.PORT || 5173;

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));