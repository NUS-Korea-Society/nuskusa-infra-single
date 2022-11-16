import { Board, Post, Role, User } from './database/models.js'
import { Op, Sequelize } from 'sequelize'
import cron from 'node-cron'

class instagramPost {
    constructor(postId, type, imgURL, title, content) {
        this.postId = postId;
        this.type = type;
        this.imgURL = imgURL;
        this.title = title;
        this.content = content;
    }
}

const access_token = process.env.INSTA_ACCESS_TOKEN
    //"IGQVJWRzdMNmtaZA2gtencyZAkh5MHJEU1J0UTlGYkNfM1ZATMVV0ODR3YVBhRjJzOWFFbFhNRDk5R295Vm1LRllpVEo5SzFYeDFzdV90YldhUkE2ZAWtHNXlKc2hlZAnZA4NElNendZAcHRXUzRLUjhaN0E0LQZDZD";


async function setTimer() {
    const cronString = "0 0 * * *"

    const admin = await Role.findOne({
        where: {
            name: "Admin"
        }
    })
    const adminUser = await User.findOne({
        where: {
            role: admin.id
        }
    })
    const announcementBoard = await Board.findOne({
        where: {
            boardId: "announcement" 
        }
    })
    if (! admin || ! adminUser || ! announcementBoard) {
        console.log("Could not find necessary elements: either admin role/admin user/announcementBoard")
        return false
    }

    cron.schedule(cronString, async () => {
        const recentPostIds = await getRecentPostId()
        const alreadyInPosts = await Post.findAll({
            where: {
                isInstaPost: true,
                instaPostId: {
                    [Op.in]: recentPostIds
                }
            },
            attributes: ['id'],
            raw: true
        })
        const newPostIds = []
        for (let i = 0; i < recentPostIds.length; i++) {
            const index = alreadyInPosts.indexOf(recentPostIds[i])
            if (index < 0) {
                newPostIds.push(recentPostIds[index])
            }
        }
        const postDatas = []
        for (let i = 0; i < newPostIds.length; i++) {
            const postData = await getPost(newPostIds[i])
            postDatas.push(postData)
        }
        for (let i = 0; i < postDatas.length; i++) {
            const post = postDatas[i]
            await Post.create({
                title: post.title,
                content: post.imgURL + post.content,
                isAnnouncement: true,
                isAnonymous: false,
                isHidden: false,
                isPinned: false,
                isEvent: false,
                author: adminUser.id,
                board: announcementBoard.id,
            })
        }
    })
}

async function getRecentPostId() {
    try {
        const url =
            "https://graph.instagram.com/me/media?fields=id&access_token=" +
            access_token;
        const temp = await fetch(url);
        let postList = [];
        if (temp.status == 200) {
            const jsonFile = await temp.json();
            const data = jsonFile.data.slice(0, 20)
            for (let i = 0; i < jsonFile.data.length; i++) {
                const postId = jsonFile.data[i].id;
                postList.push(postId);
            }
        }
        return postList;
    }
    catch(err) {
        console.log(err)
        return []
    }
    
}
/*
async function getUserId() {
    const url =
        "https://graph.instagram.com/me?fields=id&access_token=" + access_token;
    let temp = await fetch(url);
    let userId;
    if (temp.status == 200) {
        const jsonFile = await temp.json();
        userId = jsonFile.id;
    }
    return userId;
}

async function getImgId(userId) {
    const url = "graph.facebook.com/" + userId + "/media";
    let temp = await fetch(url);
    let imgId = [];
    if (temp.status == 200) {
        const jsonFile = await temp.json();
        for (let i = 0; i < jsonFile.data.length; i++) {
            imgId.push(jsonFile.data[i].id);
        }
    }
    return imgId;
}
*/
async function getPost(postId) {
    try {
        const postUrl =
            "https://graph.instagram.com/" +
            postId +
            "?fields=media_type,media_url,caption&access_token=" +
            access_token;
        let temp = await fetch(postUrl);
        let post;
        if (temp.status == 200) {
            const jsonFile = await temp.json();
            const type = jsonFile.media_type;
            let imgURL;
            if (type == "CAROUSEL_ALBUM") {
                imgURL = await getMultipleImg(postId);
            } else {
                imgURL = [jsonFile.media_url];
            }
            imgURL = processImages(imgURL)
            const caption = jsonFile.caption;
            const result = caption.split(/\r?\n/);
            const title = result[0];
            let content = "";
            for (let j = 1; j < result.length; j++) {
                content = content.concat("<p>");
                content = content.concat(result[j]);
                content = content.concat("</p><p>&nbsp</p>");
            }
            post = new instagramPost(postId, imgURL, title, content);
        }

        return post;
    }
    catch(err) {
        console.log(err)
        return new instagramPost(-1, "", "", "", "")
    }
    
}

async function getMultipleImg(postId) {
    try {
        const postUrl =
            "https://graph.instagram.com/" +
            postId +
            "?fields=children&access_token=" +
            access_token;
        let temp = await fetch(postUrl);
        let imgList = [];
        if (temp.status == 200) {
            const mediaJson = await temp.json();
            imgList = mediaJson.children.data;
        }
        let result = [];
        for (let i = 0; i < imgList.length; i++) {
            let media_id = imgList[i].id;
            let url =
                "https://graph.instagram.com/" +
                media_id +
                "?fields=id,media_url&access_token=" +
                access_token;
            let temp2 = await fetch(url);
            if (temp2.status == 200) {
                const jsonFile = await temp2.json();
                const imgURL = jsonFile.media_url;
                result.push(imgURL);
            }
        }
        return result;
    }
    catch(err) {
        console.log(err)
        return []
    }
    
}
//<img src="https://nuskusa-storage.s3.ap-southeast-1.amazonaws.com/images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202022-11-11%2002-01-26.png"></figure>
function processImages(images) {
    const finalString = ""
    const figureStart = `<figure class="image"></figure>`
    const figureEnd = "</figure>"
    for (let i = 0; i < images.length; i++) {
        finalString += figureStart + createImageTag(images[i]) + figureEnd
    }
    return finalString;
}

function createImageTag(src) {
    return `<img src="` + src + `">`
}

export { setTimer }