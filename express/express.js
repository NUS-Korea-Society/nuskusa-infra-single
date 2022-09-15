import express from 'express'
import session from 'express-session'
import passport from 'passport'
import dbService from './utils/database/db.js'; //DO NOT REMOVE THIS IMPORT
import { dbIP } from './utils/database/db.js'
import * as Models from "./utils/database/models.js" //DO NOT REMOVE THIS IMPORT
import cors from 'cors';
import { default as postRouter } from './src/post.js'
import { default as boardRouter } from './src/board.js'
import { default as authRouter } from './src/authentication.js'
import { default as profileRouter } from './src/profile.js'
import { default as eventRouter } from './src/event.js'

const app = express();
const port = 3000;

const corsMiddleware = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'localhost'); //replace localhost with actual host
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, PATCH, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization');

    next();
}

app.use(corsMiddleware);

app.use(express.json())
app.use(cors());
app.use(session({
    secret: process.env.PKR_VAR_MYSQL_PASSWORD,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, //true
        _expires: 1000 * 60 * 60 * 3, //(3 Hours),
        httpOnly: false,
    }
}))
app.use(passport.session())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/api/test', (req, res) => {
    res.send("World Hello!")
})

app.get('/api/checkDb', (req, res) => {
    res.send(dbIP)
})

app.use("/api/board", boardRouter)

app.use("/api/post", postRouter)

app.use("/api/auth", authRouter)

app.use("/api/profile", profileRouter)

app.use("/api/event", eventRouter)

app.listen(port, () => {
    console.log(`NUSKUSA Web Server Listening on Port ${port}`)
})

export default app;
