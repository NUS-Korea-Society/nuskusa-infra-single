import dbService from "../db.js";
import Comment from "./Comment.js"
import { DataTypes, Model } from 'sequelize'
import User from "./User.js";

class CommentUpvote extends Model {

}

CommentUpvote.init({
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    }
}, {
    sequelize: dbService,
    modelName: "CommentUpvote"
})

User.hasMany(CommentUpvote)
CommentUpvote.belongsTo(User, {
    foreignKey: 'author'
})

Comment.hasMany(CommentUpvote)
CommentUpvote.belongsTo(Comment, {
    foreignKey: "comment"
})

export default CommentUpvote;