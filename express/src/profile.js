import express, { raw } from 'express'
import HttpStatusCode from '../utils/httpStatusCode.js';
import { User, Salt, Notification, Role } from '../utils/database/models.js'
import { Op } from 'sequelize'
import { isNotLoggedIn, createSalt, sendVerificationEmail } from './authentication.js';
import {
    collectCommentNotifications,
    collectUpvoteNotifications
} from "./notification.js"
import crypto from 'crypto';

const router = express.Router()

router.get("/getProfile", async (req, res) => {
    if (! req.user) {
        res.status(HttpStatusCode.BAD_REQUEST).send();
        return;
    }
    const user = await User.findOne({
        where: {
            email: req.user.email,
        },
        attributes: { exclude: ["createdAt", "updatedAt", "id", "password"] },
        raw: true,
    })
    const role = await Role.findOne({
        where: {
            id: user.role
        }
    })
    user.role = role;
    if (!user) {
        res.status(HttpStatusCode.BAD_REQUEST).send();
        return;
    }
    else {
        res.status(HttpStatusCode.OK).send(user);
        return;
    }
})

router.post("/editProfile/:prevEmail", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED)
        res.send("Not Logged In");
        return;
    }
    if (req.params.prevEmail !== req.user.email) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not the user trying to modify profile")
        return;
    }
    
    const newProfile = req.body;
    let user = await User.findByPk(req.user.id)
    const updates = {};
    if (newProfile.password) {
        //GET SALT AND HASHEDPASSWORD
        const pwDetail = await handleNewPassword(newProfile.password);
        if (pwDetail === undefined) {
            res.status(HttpStatusCode.BAD_REQUEST).send("Failed to reset password");
            return;
        }

        //RETRIEVE PREVIOUS SALT FOR THIS USER
        const prevSalt = await Salt.findOne({
            where: {
                user: user.id,
            }
        })
        //UPDATE SALT
        await prevSalt.update({
            salt: pwDetail.salt,
        })

        //MARK NEW PASSWORD FOR CHANGE
        updates.password = pwDetail.hashPassword
    }
    if (newProfile.email) {
        if (user.email !== newProfile.email) {
            if (await sendVerificationEmail(newProfile.email, user.id)) {
                updates.email = newProfile.email
            }
            else {
                res.status(HttpStatusCode.BAD_REQUEST).send()
            }
        }
    }
    if (newProfile.major) {
        if (user.major !== newProfile.major) {
            updates.major = newProfile.major
        }
    }
    if (newProfile.profileImageUrl) {
        if (user.profileImageUrl !== newProfile.profileImageUrl) {
            updates.profileImageUrl = newProfile.profileImageUrl
        }
    }
    else if (newProfile.profileImageUrl === "undefined") {
        if (user.profileImageUrl !== newProfile.profileImageUrl) {
            updates.profileImageUrl = null;
        }
    }
    const updatedUser = await user.update(updates)
    res.status(HttpStatusCode.OK).send();
})

router.delete("/dismissNotification/:notificationId", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not Logged In")
        return;
    }

    const notification = await Notification.findByPk(req.params.notificationId);
    if (notification.notificationTo != req.user.id) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Notification does not belongs to the requested user")
        return;
    }

    await notification.destroy()
    res.status(HttpStatusCode.OK).send();
})

router.delete("/dismissAllNotification", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not Logged In")
        return;
    }

    Notification.destroy({
        where: {
            notificationTo: req.user.id
        }
    })
})

router.get("/getNotifications", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not Logged In")
        return;
    }

    const commentNotifications = await collectCommentNotifications(req.user.id);
    const upvoteNotifications = await collectUpvoteNotifications(req.user.id);
    const notifications = upvoteNotifications.concat(commentNotifications);

    res.status(HttpStatusCode.OK).send(notifications);
    return;
})

router.get("/searchProfile", async (req, res) => {
    if (isNotLoggedIn(req)) {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not Logged In")
        return;
    }
    const currentUser = await User.findByPk(req.user.id);
    const currentRole = await Role.findByPk(currentUser.role);
    if (currentRole.name != "Admin") {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Not Admin")
    }

    const name = req.query.name ? req.query.name : undefined;
    const yearOfBirth = req.query.yearOfBirth ? req.query.yearOfBirth : undefined
    const role = req.query.role ? req.query.role : undefined;
    const enrolledYear = req.query.enrolledYear ? req.query.enrolledYear : undefined;
    const major = req.query.major ? req.query.major : undefined;

    let users = null;
    if (name) {
        users = await User.findAll({
            where: {
                name: {
                    [Op.like]: `%${name}%`
                },
            }
        })
    }
    else if (yearOfBirth) {
        users = await User.findAll({
            where: {
                yearOfBirth: {
                    [Op.like]: `%${yearOfBirth}%`
                }
            }
        })
        
    }
    else if (enrolledYear) {
        users = await User.findAll({
            where: {
                enrolledYear: {
                    [Op.like]: `%${enrolledYear}%`
                }
            }
        })
    } 
    else if (role) {
        const roleObject = await Role.findOne({
            where: {
                name: {
                    [Op.like]: `%${role}%`
                }
            }
        })
        if (! roleObject) {
            res.status(502).send();
            return;
        }
        users = await User.findAll({
            where: {
                role: roleObject.id,
            }
        })
        users.map(user => {
            user.role = roleObject.name;
            return user
        })
    }
    else if (major) {
        users = await User.findAll({
            where: {
                major: {
                    [Op.like]: `%${major}%`,
                }
            }
        })
    }
    if (!role && users) {
        for (let i = 0; i < users.length; i++) {
            const role = await Role.findOne({
                where: {
                    id: users[i].role
                },
                attributes: ["name"]
            })
            users[i].role = role.name
        }
    }
    res.status(HttpStatusCode.OK).send(users);
    return;
})

const handleNewPassword = async (rawPassword) => {
    return new Promise((resolve, reject) => {
        const salt = createSalt();
        crypto.pbkdf2(rawPassword, salt, 1250, 64, 'sha512', (err, hashedPassword) => {
            if (err) {
                console.log(err);
                resolve(undefined);
            }
            resolve({
                hashPassword: hashedPassword.toString("base64"),
                salt: salt,
            })
        })
    })
}

export default router;