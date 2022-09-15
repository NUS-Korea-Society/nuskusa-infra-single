import dbService from "../db.js";
import Role from "./Role.js"
import Board from "./Board.js"
import { DataTypes, Model } from 'sequelize'

class Permission extends Model {
}

Permission.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    type: { //EDIT, VIEW, COMMENT
        type: DataTypes.STRING,
    }
}, {
    sequelize: dbService,
    modelName: "Permission"
})


Role.hasMany(Permission)
Permission.belongsTo(Role, {
    foreignKey: "role"
})

Board.hasMany(Permission)
Permission.belongsTo(Board, {
    foreignKey: "board"
})

export default Permission