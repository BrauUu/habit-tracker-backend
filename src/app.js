import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit'

import user from './routes/user.routes.js';
import daily from './routes/daily.routes.js';
import incremental from './routes/incremental.routes.js'
import todo from './routes/todo.routes.js'

const PORT = process.env.PORT || 4001;
const server = express();

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	limit: 100, 
	standardHeaders: 'draft-8',
	legacyHeaders: false, 
	message: { message: 'Too many requests, please try again later.' },
	ipv6Subnet: 56,
	validate: {xForwardedForHeader: false}
})

server.use(express.json());
server.use(cors());
server.use(limiter)

server.listen(PORT, () => {
    console.log(`running on http://localhost:${PORT}`);
});

server.use(user);
server.use('/daily', daily);
server.use('/incremental', incremental);
server.use('/todo', todo);
