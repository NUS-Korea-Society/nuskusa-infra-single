import dbService from "../db.js";
import Post from "./Post.js"
import { DataTypes, Model } from 'sequelize'
import User from "./User.js";

class PostUpvote extends Model {

}

PostUpvote.init({
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
}, {
    sequelize: dbService,
    modelName: "PostUpvote"
})


User.hasMany(PostUpvote)
PostUpvote.belongsTo(User, {
    foreignKey: "author"
})

export default PostUpvote