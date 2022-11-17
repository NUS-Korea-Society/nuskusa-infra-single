import dotenv from "dotenv"
dotenv.config()
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
import { checkBodyNull } from './utils/util.js'
import HttpStatusCode from './utils/httpStatusCode.js';
import nodemailer from 'nodemailer'
import fileUpload from 'express-fileupload'
import { setTimer } from './utils/instagram.js'

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
        secure: false, // true
        _expires: 1000 * 60 * 60 * 3, // (3 Hours),
        httpOnly: false,
    }
}))
app.use(passport.session())
app.use(fileUpload({
    useTempFiles: true
}));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/api/test', (req, res) => {
    res.send("World Hello!")
})

app.get('/api/checkDb', (req, res) => {
    res.send(dbIP)
})

app.post("/api/contactus", (req, res) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",//process.env.EMAIL_SERVICE,
        auth: {
            user: "nuskusa@gmail.com",
            pass: process.env.EMAIL_PASSWORD,
        },
        from: "nuskusa@outlook.com"
    })

    if (checkBodyNull(req)) {
        res.status(HttpStatusCode.NO_CONTENT).send("Body is not attached")
        return;
    }

    const options = {
        from: "NUS 한인회 <nuskusa@gmail.com>",//process.env.EMAIL_SENDER,
        to: "nuskusa@gmail.com",
        subject: req.body.name + "님의 문의사항입니다.",
        text: `${req.body.name} (${req.body.email})님께서 문의사항을 보내주셨습니다: \n\n ${req.body.message}`,
    }

    transporter.sendMail(options, (error, info) => {
        if (info.rejected.length > 0) {
            res.status(HttpStatusCode.EXPECTATION_FAILED).send(info)
        }
        else {
            res.status(HttpStatusCode.OK).send("메세지를 성공적으로 보냈습니다.");
        }
    })
})

app.use("/api/board", boardRouter)

app.use("/api/post", postRouter)

app.use("/api/auth", authRouter)

app.use("/api/profile", profileRouter)

app.use("/api/event", eventRouter)

setTimer()

app.listen(port, () => {
    console.log(`NUSKUSA Web Server Listening on Port ${port}`)
})

export default app;
