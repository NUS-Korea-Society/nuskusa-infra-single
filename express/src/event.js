import express, { raw } from 'express'
import HttpStatusCode from '../utils/httpStatusCode.js';
import { User, Salt, Notification, Role, Event, Post, Board, EventRegistration } from '../utils/database/models.js'
import { Op } from 'sequelize'
import { isNotLoggedIn, createSalt, sendVerificationEmail } from './authentication.js';
import {
    collectCommentNotifications,
    collectUpvoteNotifications
} from "./notification.js"
import crypto from 'crypto';

const router = express.Router()

router.post("/addEvent", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not logged in")
        return
    }
    const currentRole = await Role.findOne({
        where: {
            id: req.user.role
        }
    })
    if (currentRole.name != "Admin") {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not logged in")
        return
    }

    const content = JSON.parse(req.body.content)
    const board = await Board.findOne({
        where: {
            boardId: 'announcement'
        }
    })
    
    const newPost = await Post.create({
        title: req.body.title,
        content: "temp",
        isAnnouncement: true,
        isAnonymous: false,
        isPinned: true,
        isHidden: false,
        isEvent: true,
        author: req.user.id,
        board: board.id,
    })

    const newEvent = await Event.create({
        title: req.body.title,
        content: req.body.content,
        canApplyMultiple: content.canApplyMultiple,
        post: newPost.id
    })

    newPost.update({
        content: newEvent.id
    })

    res.status(HttpStatusCode.CREATED).send(newPost.id.toString());
})

router.post("/registerEvent", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not logged in")
        return
    }
    const event = await Event.findOne({
        where: {
            post: req.body.post,
        }
    })

    if (! event.canApplyMultiple) {
        const prevRegistration = await EventRegistration.findAll({
            where: {
                user: req.user.id
            }
        })
        if (prevRegistration.length > 0) {
            res.status(HttpStatusCode.BAD_REQUEST).send("이미 지원하신 이벤트입니다.");
        }
    }

    const registration = await EventRegistration.create({
        event: event.id,
        response: req.body.responseData,
        user: req.user.id,
    })

    res.status(HttpStatusCode.OK).send();
})

router.get('/getEvents', async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not logged in")
        return
    }
    const currentRole = await Role.findOne({
        where: {
            id: req.user.role
        }
    })
    if (currentRole.name != "Admin") {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not logged in")
        return
    }

    const events = await Event.findAll({
        attributes: ['title', 'id']
    });    
    res.status(HttpStatusCode.OK).send(events);
})

router.get('/getEventParticipants/:eventId', async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not logged in")
        return
    }
    const currentRole = await Role.findOne({
        where: {
            id: req.user.role
        }
    })
    if (currentRole.name != "Admin") {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not logged in")
        return
    }

    const participants = await EventRegistration.findAll({
        where: {
            event: req.params.eventId
        },
        order: [['updatedAt', 'DESC']],
        include: [{
            model: User,
            attributes: ['name', 'gender', 'enrolledYear', 'yearOfBirth', 'major', 'kakaoTalkId', 'email']
        }],
        attributes: {
            exclude: ['createdAt', 'EventId', 'UserId']
        }
    })
    res.status(HttpStatusCode.OK).send(participants)
})

export default router;