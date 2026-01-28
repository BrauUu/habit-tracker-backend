import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import client from "./database/config.js";
import user from './routes/user.js';

const PORT = process.env.PORT;
const server = express();

server.use(express.json());
server.use(cors());

server.listen(PORT, () => {
    console.log(`running on http://localhost:${PORT}`);
});

server.use(user);