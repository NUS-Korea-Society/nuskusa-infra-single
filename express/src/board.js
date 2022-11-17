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

    if (board == null) {
        res.status(HttpStatusCode.NO_CONTENT).send("No board with given ID Found")
        return;
    }

    const permissionsData = await Permission.findAll({
        where: {
            board: board.id,
            role: req.user.role,
        }
    })

    const permissions = {
        "EDIT": false,
        "COMMENT": false,
        "VIEW": false,
    }

    for (let i = 0; i < permissionsData.length; i++) {
        if (permissionsData[i].type == "EDIT") {
            permissions.EDIT = true
        }
        else if (permissionsData[i].type == "COMMENT") {
            permissions.COMMENT = true
        }
        else if (permissionsData[i].type == "VIEW") {
            permissions.VIEW = true
        }
    }

    if (! permissions.VIEW && ! permissions.EDIT && ! permissions.COMMENT) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not authorized to this board")
        return;
    }

    const data = {
        'permissions': permissions,
        'data': board
    }

    res.status(HttpStatusCode.OK).send(data);
    return;
})

router.get("/getEditableBoard", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not Logged In")
        return;
    }
    const permissions = await Permission.findAll({
        where: {
            role: req.user.role,
            type: "EDIT"
        }
    })
    const boardIds = []
    for (let i = 0; i < permissions.length; i++) {
        boardIds.push(permissions[i].board)
    }

    const boards = await Board.findAll({
        where: {
            id: {
                [Op.or]: boardIds,
            }
        },
        raw: true,
    })
    res.status(HttpStatusCode.OK).send(boards)
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
    if (board == null) {
        res.status(HttpStatusCode.NO_CONTENT).send("No board with given ID Found")
        return
    }
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
        },
        order: [
            ['id', 'DESC']
        ]
    })
    const pinned = []
    const unpinned = []
    for (let i = 0; i < posts.length; i++) {
        if (posts[i].isEvent) {
            const event = await Event.findByPk(posts[i].content)
            const tempContent = JSON.parse(event.content)
            posts[i].content = tempContent.description
        }
        if (posts[i].isPinned) {
            pinned.push(posts[i])
        }
        else {
            unpinned.push(posts[i])
        }
    }
    const result = pinned.concat(unpinned)
    res.status(HttpStatusCode.OK).send(result);
    return;
})

router.get("/getAnnouncements", async (req, res) => {
    const announcementBoard = await Board.findOne({
        where: {
            boardId: "announcement"
        },
        attributes: ['id']
    })
    const pinnedAnnouncements = await Post.findAll({
        where: {
            board: announcementBoard.id,
            isHidden: false,
            isPinned: true,
        },
        raw: true
    })
    const length = pinnedAnnouncements.length > 10 ? 0 : 10 - pinnedAnnouncements.length
    const announcements = await Post.findAll({
        where: {
            board: announcementBoard.id,
            isHidden: false,
            isPinned: false,
        },
        order: [
            ['id', 'DESC']
        ],
        limit: length,
        raw: true,
    })
    res.status(HttpStatusCode.OK).send(pinnedAnnouncements.concat(announcements))
})

export default router;
export { getAccessibleBoardIds, getAccessibleBoards, getPermissions }