import dbService from "../db.js";
import User from "./User.js"
import Board from "./Board.js"
import Permission from "./Permission.js";
import { DataTypes, Model, Op } from 'sequelize'

class Role extends Model {
}

Role.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    }
}, {
    sequelize: dbService,
    modelName: "Role"
})

User.belongsTo(Role, {
    foreignKey: "role",
    allowNull: false,
})
Role.hasMany(User)

export default Role