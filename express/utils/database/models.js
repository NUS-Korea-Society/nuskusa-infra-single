import User from "./model/User.js"
import Board from "./model/Board.js"
import Comment from "./model/Comment.js"
import CommentUpvote from "./model/CommentUpvote.js"
import Post from "./model/Post.js"
import Permission from "./model/Permission.js"
import PostUpvote from "./model/PostUpvote.js"
import Role from "./model/Role.js"
import Salt from "./model/Salt.js"
import Verification from "./model/Verification.js"
import Event from "./model/Event.js"
import EventRegistration from "./model/EventRegistration.js"
import Notification from "./model/Notification.js"
import dbService from "./db.js"
import initializeDB from "./initialization.js"

async function synchronize() {
    try {
        console.log("synchronizing...")
        await dbService.sync({
            force: false
        });
        await initializeDB();
        console.log("All models were synchronized successfully.");
    }
    catch (err) {
        console.log(err)
    }
}

await synchronize()

export { User, Board, Comment, CommentUpvote, Post, Permission, PostUpvote, Role, Notification, Salt, Verification, Event, EventRegistration }