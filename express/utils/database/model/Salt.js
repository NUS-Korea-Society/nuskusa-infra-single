import dbService from "../db.js";
import { DataTypes, Model } from 'sequelize'
import User from "./User.js";

class Salt extends Model {
    
}

Salt.init({
    salt: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
}, {
    sequelize: dbService,
    modelName: "Salt"
})

User.hasOne(Salt);
Salt.belongsTo(User, {
    foreignKey: "user"
});

export default Salt