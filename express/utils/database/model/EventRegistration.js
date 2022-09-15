import dbService from "../db.js";
import { DataTypes, Model } from 'sequelize'
import Event from "./Event.js";
import User from "./User.js";

class EventRegistration extends Model {
}

EventRegistration.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    response: {
        type: DataTypes.TEXT,
    }
}, {
    sequelize: dbService,
    modelName: "EventRegistration"
})

Event.hasMany(EventRegistration)
EventRegistration.belongsTo(Event, {
    foreignKey: 'event'
})

User.hasMany(EventRegistration)
EventRegistration.belongsTo(User, {
    foreignKey: "user"
})

export default EventRegistration