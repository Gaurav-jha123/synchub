import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import router from './routes/auth.routes';

dotenv.config();


connectDB();


const app = express();
const server = http.createServer(app);

const io = new SocketServer(server , {
    cors : {
        origin : process.env.CLIENT_URL,
        methods : ['GET' , 'POST'],
        credentials : true
    }
});


app.use(cors ({
    origin : process.env.CLIENT_URL,
    credentials : true
}));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({extended : false}));

app.use('/api/auth', router);

app.get('/' , (req : Request , res : Response) => {
    res.send('API is running...');
})


io.on('connection' , (socket) => {
    console.log(`A user connected`);

    socket.on('disconnect' , () => {
        console.log(`User disconnected`);
    });
});


const PORT  = process.env.PORT || 2000;
server.listen(PORT , () => {
    console.log(`Server started in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
