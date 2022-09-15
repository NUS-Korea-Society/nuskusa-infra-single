import { User, Board, Comment, CommentUpvote, Post, Notification, PostUpvote, Role } from '../utils/database/models.js'
import { Op, Sequelize } from 'sequelize'

const collectUpvoteNotifications = async (userId) => {
    const notifications = await Notification.findAll({
        where: {
            notificationTo: userId,
            type: {
                [Op.or]: [2, 3]
            }
        },
        order: [
            ["updatedAt", "DESC"]
        ]
    })

    const postCounts = {}
    const commentCounts = {}

    for (let i = 0; i < notifications.length; i++) {
        if (notifications[i].type == 2) {
            if (Object.keys(postCounts).includes(notifications[i].from)) {
                postCounts[notifications[i].from.toString()].count++;
            }
            else {
                postCounts[notifications[i].from.toString()] = {
                    count: 1,
                    data: notifications[i]
                }
            }
        }
        else {
            if (Object.keys(commentCounts).includes(notifications[i].from)) {
                commentCounts[notifications[i].from.toString()].count++;
            }
            else {
                commentCounts[notifications[i].from.toString()] = {
                    count: 1,
                    data: notifications[i]
                }
            }
        }
    }

    const result = []

    const postKeys = Object.keys(postCounts)
    for (let i = 0; i < postKeys.length; i++) {
        const temp = postCounts[postKeys[i]];
        const post = await Post.findOne({
            where: {
                id: temp.data.from,
            },
            attributes: ["title", "board", "id"],
        })
        const board = await Board.findOne({
            where: {
                id: post.board,
            },
            attributes: ["boardId", "title", "boardColor", "boardTextColor"]
        })
        const represent = await User.findOne({
            where: {
                id: temp.data.to,
            },
            attributes: ["name"],
            raw: true,
        })
        post.board = board
        if (temp.count > 1) {
            represent.count = temp.count
            result.push({
                type: "MultipleUpvoteOnPost",
                from: post,
                to: represent,
                post: post,
                id: temp.data.id
            })
        }
        else {
            represent.count = 1;
            result.push({
                type: "UpvoteOnPost",
                from: post,
                to: represent,
                post: post,
                id: temp.data.id
            })
        }
    }

    const commentKeys = Object.keys(commentCounts);
    for (let i = 0; i < commentKeys.length; i++) {
        const temp = commentCounts[commentKeys[i]];
        const comment = await Comment.findOne({
            where: {
                id: temp.data.from
            }
        })
        const post = await Post.findOne({
            where: {
                id: comment.post,
            },
            attributes: ["title", "board", "id"],
        })
        const board = await Board.findOne({
            where: {
                id: post.board,
            },
            attributes: ["boardId", "title", "boardColor", "boardTextColor"]
        })
        const represent = await User.findOne({
            where: {
                id: temp.data.to,
            },
            attributes: ["name"]
        })
        post.board = board
        if (temp.count > 1) {
            represent.count = temp.count
            result.push({
                type: "MultipleUpvoteOnComment",
                from: post,
                to: represent,
                post: post,
                id: temp.data.id
            })
        }
        else {
            represent.count = 1;
            result.push({
                type: "UpvoteOnComment",
                from: post,
                to: represent,
                post: post,
                id: temp.data.id
            })
        }
    }
    return result
}

const collectCommentNotifications = async (userId) => {
    const notifications = await Notification.findAll({
        where: {
            notificationTo: userId,
            type: {
                [Op.or]: [0, 1]
            }
        },
        order: [
            ["updatedAt", "DESC"]
        ]
    })

    const result = []

    for (let i = 0; i < notifications.length; i++) {
        const current = notifications[i];
        if (current.type == 0) {
            const post = await Post.findOne({
                where: {
                    id: current.from,
                },
                attributes: ["title", "board", "id"]
            })
            const board = await Board.findOne({
                where: {
                    id: post.board,
                },
                attributes: ["title", "boardColor", "boardTextColor", "boardId"]
            });
            post.board = board;
            const comment = await Comment.findOne({
                where: {
                    id: current.to,
                },
                attributes: ["content", "author"]
            })
            const data = {
                type: "CommentOnPost",
                from: post,
                to: comment,
                post: post,
                id: current.id
            }
            result.push(data)
        }
        else {
            const origComment = await Comment.findOne({
                where: {
                    id: current.from
                }
            })
            const newComment = await Comment.findOne({
                where: {
                    id: current.to
                }
            })
            const post = await Post.findOne({
                where: {
                    id: origComment.post
                }
            })
            const board = await Board.findOne({
                where: {
                    id: post.board,
                },
                attributes: ["title", "boardColor", "boardTextColor", "boardId"]
            })
            post.board = board
            const data = {
                type: "CommentOnComment",
                from: origComment,
                to: newComment,
                post: post,
                id: current.id
            }
            result.push(data)
        }
    }
    return result
}

const notifyCommentOnPost = async (postId, commentId) => {
    const post = await Post.findByPk(postId);
    const comment = await Comment.findByPk(commentId);

    if (post.author != comment.author) {
        const add = await Notification.create({
            type: 0,
            from: postId,
            to: commentId,
            notificationTo: post.author,
        })
    }

    return;
}

const notifyCommentonComment = async (commentId, newCommentId) => {
    const comment = await Comment.findByPk(commentId);
    const newComment = await Comment.findByPk(newCommentId);

    if (comment.author != newComment.author) {
        const add = await Notification.create({
            type: 1,
            from: commentId,
            to: newCommentId,
            notificationTo: comment.author,
        })
    }

    return;
}

const notifyUpvoteOnPost = async (postId, upvoteAuthor) => {
    const post = await Post.findByPk(postId);

    if (post.author != upvoteAuthor) {
        const add = await Notification.create({
            type: 2,
            from: postId,
            to: upvoteAuthor,
            notificationTo: post.author,
        })
    }

    return;
}

const notifyUpvoteOnComment = async (commentId, upvoteAuthor) => {
    const comment = await Comment.findByPk(commentId);

    if (comment.author != upvoteAuthor) {
        const add = await Notification.create({
            type: 3,
            from: commentId,
            to: upvoteAuthor,
            notificationTo: comment.author,
        })
    }

    return;
}

export { 
    notifyCommentOnPost, 
    notifyCommentonComment, 
    notifyUpvoteOnComment, 
    notifyUpvoteOnPost, 
    collectCommentNotifications, 
    collectUpvoteNotifications
}