import express from 'express'
import HttpStatusCode from '../utils/httpStatusCode.js';
import { User, Board, Comment, CommentUpvote, Post, Permission, PostUpvote, Role, Event } from '../utils/database/models.js'
import { Op, Sequelize } from 'sequelize'
import { isNotLoggedIn } from './authentication.js';

const router = express.Router();

router.get("/getBoards", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not Logged In")
        return;
    }
    const currentRole = await Role.findOne({
        where: {
            id: req.user.role,
        },
        raw: true,
    })
    const boards = await getAccessibleBoards(currentRole);
    res.status(HttpStatusCode.OK).send(boards);
    return;
})

const getPermissions = async (role) => {
    const permissions = await Permission.findAll({
        where: {
            role: role.id,
        },
        raw: true,
    })
    return permissions;
}

const getAccessibleBoardIds = async (role) => {
    const permissions = await getPermissions(role)
    const boardIdArray = [];
    for (let i = 0; i < permissions.length; i++) {
        boardIdArray.push(permissions[i].board)
    }
    return boardIdArray
}

const getAccessibleBoards = async (role) => {
    const boardIdArray = await getAccessibleBoardIds(role);
    const boards = await Board.findAll({
        where: {
            id: {
                [Op.or]: boardIdArray,
            }
        },
        raw: true,
    })
    return boards
}

router.get("/getBoard/:boardId", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not Logged In")
        return;
    }
    const board = await Board.findOne({
        where: {
            boardId: req.params.boardId,
        }
    })
    res.status(200);
    res.send(board);
    return;
})

router.get("/getPosts/:boardId", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not Logged In")
        return;
    }
    const board = await Board.findOne({
        where: {
            boardId: req.params.boardId,
        }
    })
    const posts = await Post.findAll({
        where: {
            board: board.id,
        },
        attributes: {
            include: [
                [Sequelize.literal(`(SELECT name FROM Users as User WHERE User.id = Post.author)`), "author"],
                [Sequelize.literal(`(SELECT email FROM Users as User WHERE User.id = Post.author)`), "email"]
            ],
            exclude: ["author"]
        }
    })
    for (let i = 0; i < posts.length; i++) {
        if (posts[i].isEvent) {
            const event = await Event.findByPk(posts[i].content)
            const tempContent = JSON.parse(event.content)
            posts[i].content = tempContent.description
        }
    }
    res.status(HttpStatusCode.OK).send(posts);
    return;
})

router.get("/getAnnouncements", (req, res) => {
    const announcementBoard = await Board.findOne({
        where: {
            boardId: "announcement"
        },
        attributes: ['id']
    })
    const announcements = await Post.findAll({
        where: {
            board: announcementBoard.id
        },
        raw: true,
    })
    res.status(HttpStatusCode.OK).send(announcements)
})

export default router;
export { getAccessibleBoardIds, getAccessibleBoards, getPermissions }