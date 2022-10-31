import express from 'express'
import HttpStatusCode from '../utils/httpStatusCode.js';
import { User, Board, Comment, CommentUpvote, Post, PostUpvote, Role, Event } from '../utils/database/models.js'
import { Op, Sequelize } from 'sequelize'
import { isNotLoggedIn } from './authentication.js';
import { getAccessibleBoardIds } from './board.js';
import {
    notifyCommentOnPost,
    notifyCommentonComment,
    notifyUpvoteOnComment,
    notifyUpvoteOnPost,
} from "./notification.js"
import { checkBodyNull } from '../utils/util.js'

const router = express.Router();

router.get("/getPost/:id", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not Logged In")
        return;
    }
    const currentUserRole = await Role.findByPk(req.user.role);
    const post = await Post.findOne({
        where: {
            id: req.params.id
        },
        raw: true
    })
    if (!post) {
        res.status(HttpStatusCode.NOT_FOUND).send("The Post with given ID does not exist.");
        return;
    }
    if (post.isEvent) {
        const event = await Event.findByPk(parseInt(post.content))
        post.content = event.content
    }
    post.hasRoot = post.author == req.user.id || currentUserRole.name == "Admin";
    const authorProfile = await getAuthor(post);
    post.author = authorProfile;
    const upvotes = await getUpvoteCount(post);
    post.upvoteCount = upvotes;
    const commentCount = await getCommentCount(post);
    post.commentCount = commentCount;
    const board = await getBoardForPost(post);
    post.board = board;
    const upvoted = await getIsUpvoted(post, req.user.id);
    post.upvoted = upvoted,
    res.status(HttpStatusCode.OK)
    res.send(post);
})

const getIsUpvoted = async (post, user) => {
    const upvoted = await PostUpvote.count({
        where: {
            author: user,
            post: post.id
        }
    })
    if (upvoted > 0) {
        return true;
    }
    return false;
}

const getCommentCount = async (post) => {
    const count = await Comment.count({
        where: {
            post: post.id,
        }
    })
    return count;
}

const getBoardForPost = async (post) => {
    const board = await Board.findOne({
        where: {
            id: post.board,
        },
        attributes: {
            exclude: ["id"]
        },
        raw: true,
    });

    return board
}

const getAuthor = async (post) => {
    const author = await User.findOne({
        where: {
            id: post.author,
        },
        attributes: [
            "name",
            "email"
        ]
    });
    return {
        "name": author.name,
        "email": author.email
    }
}

const getUpvoteCount = async (post) => {
    const count = await PostUpvote.count({
        where: {
            post: post.id,
        },
    })
    return count;
}

router.get("/getPostComments/:postId", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED)
        res.send("Not Logged In");
        return;
    }
    const comments = await Comment.findAll({
        where: {
            post: req.params.postId,
            replyTo: null,
        },
        attributes: {
            include: [
                [Sequelize.fn("COUNT", Sequelize.col("CommentUpvotes.comment")), "upvoteCount"]
            ]
        },
        group: "id",
        include: [{
            model: CommentUpvote,
            attributes: [],
            on: {
                id: Sequelize.col("CommentUpvotes.comment")
            }
        }],
        raw: true
    })
    const promiseArray = [];
    for (let i = 0; i < comments.length; i++) {
        let comment = comments[i];
        promiseArray.push(new Promise(async (resolve, reject) => {
            console.log(comment.author);
            console.log(req.user.id);
            comment.isMine = comment.author == req.user.id;
            const author = await User.findOne({
                where: {
                    id: comment.author,
                },
                attributes: ["email", "name", "major", "enrolledYear", "profileImageUrl"]
            })
            comment.author = author;
            const upvoted = await CommentUpvote.findOne({
                where: {
                    author: req.user.id,
                    comment: comment.id,
                }
            })
            const upvoteCount = await CommentUpvote.count({
                where: {
                    comment: comment.id,
                }
            })
            if (upvoted != null) {
                comment.upvoted = true;
            }
            else {
                comment.upvoted = false;
            }
            comment.upvoteCount = upvoteCount;
            resolve(true)
        }))
    }
    Promise.all(promiseArray).then(() => {
        res.status(HttpStatusCode.OK)
        res.send(comments)
    })
})

router.get("/getComments/:commentId", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED)
        res.send("Not Logged In");
        return;
    }
    const comments = await Comment.findAll({
        where: {
            replyTo: req.params.commentId,
        },
        attributes: {
            include: [
                [Sequelize.fn("COUNT", Sequelize.col("CommentUpvotes.comment")), "upvoteCount"]
            ]
        },
        group: "id",
        include: [{
            model: CommentUpvote,
            attributes: [],
            on: {
                id: Sequelize.col("CommentUpvotes.comment")
            }
        }],
        raw: true
    })
    const promiseArray = [];
    for (let i = 0; i < comments.length; i++) {
        let comment = comments[i];
        promiseArray.push(new Promise(async (resolve, reject) => {
            comment.isMine = comment.author == req.user.id;
            const author = await User.findOne({
                where: {
                    id: comment.author,
                },
                attributes: ["email", "name", "major", "enrolledYear", "profileImageUrl"]
            })
            comment.author = author;
            const upvoted = await CommentUpvote.findOne({
                where: {
                    author: req.user.id,
                    comment: comment.id,
                }
            })
            const upvoteCount = await CommentUpvote.count({
                where: {
                    comment: comment.id,
                }
            })
            if (upvoted != null) {
                comment.upvoted = true;
            }
            else {
                comment.upvoted = false;
            }
            comment.upvoteCount = upvoteCount;
            resolve(true)
        }))
    }
    Promise.all(promiseArray).then(() => {
        res.status(HttpStatusCode.OK)
        res.send(comments)
    })
})

router.get("/getRecentPosts", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED)
        res.send("Not Logged In");
        return;
    }
    const currentRole = "Current"//req.user.role;
    const roleProfile = await Role.findOne({
        where: {
            name: currentRole
        },
        raw: true
    })
    const accessibleBoards = await getAccessibleBoardIds(roleProfile);
    const recentPosts = await Post.findAll({
        where: {
            board: {
                [Op.in]: accessibleBoards
            }
        },
        order: [
            ["updatedAt", "DESC"]
        ],
        limit: 10,
        raw: true,
    })
    const promiseArr = [];
    for (let i = 0; i < recentPosts.length; i++) {
        promiseArr.push(new Promise(async (resolve, reject) => {
            const boardData = await Board.findOne({
                where: {
                    id: recentPosts[i].board,
                },
                raw: true,
            })
            recentPosts[i].board = boardData;
            resolve(true);
        }))
    }
    Promise.all(promiseArr).then(() => {
        res.status(HttpStatusCode.OK)
        res.send(recentPosts);
    })
})

router.post("/pushCommentUpvote/:commentId", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not Logged In")
        return;
    }
    const currentId = req.user.id;
    const prevUpvote = await CommentUpvote.findOne({
        where: {
            author: currentId,
            comment: req.params.commentId
        }
    })
    let newStatus = true;
    if (prevUpvote) {
        await prevUpvote.destroy();
        newStatus = false;
    }
    else {
        await CommentUpvote.create({
            comment: req.params.commentId,
            author: currentId,
        })
    }
    const object = {
        upvoted: newStatus
    }
    res.status(HttpStatusCode.OK).send(object);
    notifyUpvoteOnComment(req.params.commentId, currentId)
})

router.post("/pushPostUpvote/:postId", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not Logged In")
        return;
    }
    const currentId = req.user.id;
    const prevUpvote = await PostUpvote.findOne({
        where: {
            author: currentId,
            post: req.params.postId
        }
    })
    let newStatus = true;
    if (prevUpvote) {
        await prevUpvote.destroy()
        newStatus = false;
    }
    else {
        await PostUpvote.create({
            post: req.params.postId,
            author: currentId,
        })
    }
    const object = {
        upvoted: newStatus
    }
    res.status(HttpStatusCode.OK).send(object);
    notifyUpvoteOnPost(req.params.postId, currentId)
})

router.post("/addComment/:postId", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not Logged In")
        return;
    }
    if (checkBodyNull(req)) {
        res.status(HttpStatusCode.NO_CONTENT).send("No body attached")
        return;
    }

    const commentData = req.body;
    const newComment = await Comment.create({
        content: commentData.content,
        replyTo: commentData.replyTo,
        author: req.user.id,
        post: req.params.postId,
    })
    res.status(HttpStatusCode.CREATED).send();
    if (commentData.replyTo) {
        notifyCommentonComment(commentData.replyTo, newComment.id)
    }
    else {
        notifyCommentOnPost(req.params.postId, newComment.id)
    }
})

router.post("/editComment/:commentId", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not Logged In")
        return;
    }
    if (checkBodyNull(req)) {
        res.status(HttpStatusCode.NO_CONTENT).send("No body attached")
        return;
    }

    const comment = await Comment.findByPk(req.params.commentId)
    if (comment == null) {
        res.status(HttpStatusCode.NO_CONTENT).send("No comment with given ID Found")
        return;
    }
    const role = await Role.findByPk(req.user.role);
    if (comment.author !== req.user.id && role.name !== "Admin") {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not the author. Only author can edit.")
        return;
    }
    const newData = req.body;
    await comment.update({
        content: newData.content,
    })
    res.status(HttpStatusCode.CREATED).send();
})

router.delete("/deleteComment/:commentId", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not Logged In")
        return;
    }
    const comment = await Comment.findByPk(req.params.commentId);
    if (comment == null) {
        res.status(HttpStatusCode.NO_CONTENT).send("No comment with given ID Found")
        return;
    }
    const role = await Role.findByPk(req.user.role);
    if (comment.author !== req.user.id && role.name !== "Admin") {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not the author. Only author can edit.")
        return;
    }
    await comment.destroy();
    res.status(HttpStatusCode.OK).send();
})

router.post("/addPost/:boardId", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not Logged In")
        return;
    }
    if (checkBodyNull(req)) {
        res.status(HttpStatusCode.NO_CONTENT).send("No body attached")
        return;
    }

    const postData = req.body;
    const board = await Board.findOne({
        where: {
            boardId: req.params.boardId,
        }
    })
    if (board == null) {
        res.status(HttpStatusCode.NO_CONTENT).send("No board with given ID Found")
        return;
    }
    const newPost = await Post.create({
        title: postData.title,
        content: postData.content,
        isAnnouncement: postData.isAnnouncement,
        isAnonymous: postData.isAnonymous,
        isHidden: postData.isHidden,
        isPinned: postData.isPinned,
        isEvent: postData.isEvent,
        author: req.user.id,
        board: board.id,
    })
    res.status(HttpStatusCode.CREATED).send(newPost.id.toString());
})

router.post("/editPost/:postId", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not Logged In")
        return;
    }
    if (checkBodyNull(req)) {
        res.status(HttpStatusCode.NO_CONTENT).send("No body attached")
        return;
    }

    const newPostData = req.body;
    const post = await Post.findByPk(req.params.postId)
    const role = await Role.findByPk(req.user.role);
    if (post == null) {
        res.status(HttpStatusCode.NO_CONTENT).send("No such post with given ID found")
        return;
    }
    if (post.author !== req.user.id && role.name !== "Admin") {
        res.status(HttpStatusCode.UUserNAUTHORIZED).send("Not the author. Only author can edit")
        return;
    }
    post.update({
        content: newPostData.content,
        title: newPostData.title,
        isAnnouncement: newPostData.isAnnouncement,
        isAnonymous: newPostData.isAnonymous,
        isHidden: newPostData.isHidden,
        isPinned: newPostData.isPinned,
        isEvent: newPostData.isEvent,
    })
    res.status(HttpStatusCode.CREATED).send();
})

router.delete("/deletePost/:postId", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not Logged In")
        return;
    }

    const post = await Post.findByPk(req.params.postId)
    if (post == null) {
        res.status(HttpStatusCode.NO_CONTENT).send("No post with given ID Found");
        return;
    }
    const role = await Role.findByPk(req.user.role);
    if (post.author !== req.user.id && role.name !== "Admin") {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not the author. Only author can edit")
        return;
    }
    await post.destroy();
    res.status(HttpStatusCode.OK).send();
})

export default router;