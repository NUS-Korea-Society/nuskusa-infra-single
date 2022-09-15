import { DataTypes, Model } from 'sequelize'
import User from "./User.js";
import dbService from '../db.js';

class Notification extends Model {

}

Notification.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    type: { //0: CommentOnPost, 1: CommentOnComment, 2: UpvoteOnPost, 3: UpvoteOnComment
        type: DataTypes.SMALLINT,
        allowNull: false,
    },
    from: {
        type: DataTypes.BIGINT,
    },
    to: {
        type: DataTypes.BIGINT,
    },
}, {
    modelName: "Notification",
    sequelize: dbService,
})

Notification.belongsTo(User, {
    foreignKey: "notificationTo"
});
User.hasMany(Notification);

export default Notification;