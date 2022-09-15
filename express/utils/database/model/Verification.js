import dbService from "../db.js";
import { DataTypes, Model } from 'sequelize'
import User from "./User.js";
import Role from "./Role.js";

class Verification extends Model {

}

Verification.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    fileUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    sequelize: dbService,
    modelName: "Verification"
})

User.hasOne(Verification)
Verification.belongsTo(User, {
    foreignKey: "user",
})

export default Verification