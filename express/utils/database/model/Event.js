import dbService from "../db.js";
import { DataTypes, Model } from 'sequelize'
import Post from "./Post.js";

class Event extends Model {
}

Event.init({
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
    },
    canApplyMultiple: {
        type: DataTypes.BOOLEAN,
    },
}, {
    sequelize: dbService,
    modelName: "Event"
})

Event.belongsTo(Post, {
    foreignKey: "post",
})

export default Event