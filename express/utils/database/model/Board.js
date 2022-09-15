import dbService from "../db.js";
import { DataTypes, Model } from 'sequelize'

class Board extends Model {
}

Board.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    boardId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    boardColor: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    boardTextColor: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize: dbService,
    modelName: "Board"
})

export default Board