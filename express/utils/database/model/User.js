import dbService from "../db.js";
import { DataTypes, Model } from 'sequelize'

class User extends Model {

}

User.init({
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    yearOfBirth: {
        type: DataTypes.INTEGER,
    },
    gender: {
        type: DataTypes.STRING,
    },
    enrolledYear: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    major: {
        type: DataTypes.STRING,
    },
    kakaoTalkId: {
        type: DataTypes.STRING,
    },
    verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    emailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    profileImageUrl: {
        type: DataTypes.STRING,
    },
    password: {
        type: DataTypes.STRING,
    }
}, {
    modelName: "User",
    sequelize: dbService,
})

export default User