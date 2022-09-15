import dbService from "../db.js";
import User from "./User.js"
import { DataTypes, Model } from 'sequelize'

class Comment extends Model {

}

Comment.init({
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    replyTo: {
        type: DataTypes.BIGINT,
    }
}, {
    sequelize: dbService,
    modelName: "Comment"
})


Comment.belongsTo(User, {
    foreignKey: "author"
})
User.hasMany(Comment)

export default Comment