import dbService from "../db.js";
import User from './User.js'
import Board from "./Board.js"
import Comment from "./Comment.js"
import PostUpvote from "./PostUpvote.js";
import { DataTypes, Model } from 'sequelize'

class Post extends Model {
    async getComments() {
        const postId = this.id;
        const comments = await Comment.findAll({
            where: {
                post: postId,
            }
        })
        return comments;
    }
    async getUpvoteCount() {
        const count = await PostUpvote.count({
            where: {
                post: req.params.id,
            }
        })
        return count;
    }
}

Post.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isAnnouncement: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    isAnonymous: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    isHidden: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    isPinned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    isEvent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    isInstaPost: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    instaPostId: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    sequelize: dbService,
    modelName: "Post"
})

Post.hasMany(Comment)
Comment.belongsTo(Post, {
    foreignKey: "post"
})

User.hasMany(Post)
Post.belongsTo(User, {
    foreignKey: "author"
})

Board.hasMany(Post)
Post.belongsTo(Board, {
    foreignKey: "board"
})

Post.hasMany(PostUpvote)
PostUpvote.belongsTo(Post, {
    foreignKey: "post"
})

export default Post