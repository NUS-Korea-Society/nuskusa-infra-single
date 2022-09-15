import { User, Board, Comment, CommentUpvote, Post, Permission, PostUpvote, Role } from './models.js'

async function initializeDB() {
    const announcementBoard = await Board.create({
        title: "공지사항",
        description: "공지는 여기에서!",
        boardId: "announcement",
        boardColor: "#FC6565",
        boardTextColor: "#845858",
    })

    const freshmenBoard = await Board.create({
        title: "신입생 게시판",
        description: "재학생이 되기 전 궁금한 것은 여기로!",
        boardId: "freshmen",
        boardColor: "#FFDE00",
        boardTextColor: "#1A1919",
    })

    const generalBoard = await Board.create({
        title: "자유게시판",
        description: "자유게시판입니다!",
        boardId: "general",
        boardColor: "#C4F2EF",
        boardTextColor: "#3B8A85",
    })

    const graduatedBoard = await Board.create({
        title: "졸업생 게시판",
        description: "졸업생들의 공간!",
        boardId: "graduated",
        boardColor: "#4CC76C",
        boardTextColor: "#1A1919",
    })

    const marketBoard = await Board.create({
        title: "벼룩시장",
        description: "중고물품을 사고팔고 공동구매를 모집해요!",
        boardId: "market",
        boardColor: "#FCAC65",
        boardTextColor: "#1A1919",
    })

    const jobBoard = await Board.create({
        title: "취업/인턴",
        description: "취업/인턴 관련 정보를 올리는 게시판!",
        boardId: "jobs",
        boardColor: "#F2CEFF",
        boardTextColor: "#1A1919",
    })

    const current = await Role.create({
        "name": "Current",
        "description": "NUS에 등록하여 학부생으로 재학 중인 학생"
    })

    const freshmen = await Role.create({
        "name": "Freshmen",
        "description": "아직 NUS에 등록하지는 않았지만 합격 통지를 받아 등록을 고려하고 있는 학생"
    })

    const graduated = await Role.create({
        "name": "Graduated",
        "description": "NUS에서 학부를 졸업한 졸업생"
    })

    const registered = await Role.create({
        "name": "Registered",
        "description": "NUS에 재학 중이거나 재학을 고려하지 않지만 NUS 또는 NUS 한인회에 이해관계가 있어 가입을 완료한 회원"
    })

    const admin = await Role.create({
        "name": "Admin",
        "description": "웹사이트 관리자"
    })

    //재학생 Permission 생성
    Permission.create({
        role: current.id,
        board: announcementBoard.id,
        type: "VIEW"
    })

    Permission.create({
        role: current.id,
        board: announcementBoard.id,
        type: "COMMENT"
    })

    Permission.create({
        role: current.id,
        board: freshmenBoard.id,
        type: "VIEW"
    })

    Permission.create({
        role: current.id,
        board: freshmenBoard.id,
        type: "EDIT",
    })

    Permission.create({
        role: current.id,
        board: freshmenBoard.id,
        type: "COMMENT",
    })

    Permission.create({
        role: current.id,
        board: generalBoard.id,
        type: "VIEW"
    })

    Permission.create({
        role: current.id,
        board: generalBoard.id,
        type: "EDIT"
    })

    Permission.create({
        role: current.id,
        board: generalBoard.id,
        type: "COMMENT"
    })

    Permission.create({
        role: current.id,
        board: jobBoard.id,
        type: "VIEW"
    })

    Permission.create({
        role: current.id,
        board: jobBoard.id,
        type: "EDIT"
    })

    Permission.create({
        role: current.id,
        board: jobBoard.id,
        type: "EDIT"
    })

    Permission.create({
        role: current.id,
        board: marketBoard.id,
        type: "VIEW"
    })

    Permission.create({
        role: current.id,
        board: marketBoard.id,
        type: "EDIT"
    })

    Permission.create({
        role: current.id,
        board: marketBoard.id,
        type: "COMMENT"
    })

    Permission.create({
        role: current.id,
        board: graduatedBoard.id,
        type: "VIEW"
    })

    //졸업생 Permission 생성
    Permission.create({
        role: graduated.id,
        board: announcementBoard.id,
        type: "VIEW"
    })

    Permission.create({
        role: graduated.id,
        board: announcementBoard.id,
        type: "COMMENT"
    })

    Permission.create({
        role: graduated.id,
        board: graduatedBoard.id,
        type: "VIEW"
    })

    Permission.create({
        role: graduated.id,
        board: graduatedBoard.id,
        type: "COMMENT"
    })

    Permission.create({
        role: graduated.id,
        board: generalBoard.id,
        type: "VIEW"
    })

    Permission.create({
        role: graduated.id,
        board: generalBoard.id,
        type: "EDIT"
    })

    Permission.create({
        role: graduated.id,
        board: generalBoard.id,
        type: "COMMENT"
    })

    Permission.create({
        role: graduated.id,
        board: jobBoard.id,
        type: "VIEW"
    })

    Permission.create({
        role: graduated.id,
        board: jobBoard.id,
        type: "EDIT"
    })

    Permission.create({
        role: graduated.id,
        board: jobBoard.id,
        type: "COMMENT"
    })

    Permission.create({
        role: graduated.id,
        board: marketBoard.id,
        type: "VIEW",
    })

    Permission.create({
        role: graduated.id,
        board: marketBoard.id,
        type: "EDIT"
    })

    Permission.create({
        role: graduated.id,
        board: marketBoard.id,
        type: "COMMENT"
    })

    //신입생 Permission 생성
    Permission.create({
        role: freshmen.id,
        board: freshmenBoard.id,
        type: "VIEW"
    })

    Permission.create({
        role: freshmen.id,
        board: freshmenBoard.id,
        type: "EDIT"
    })

    Permission.create({
        role: freshmen.id,
        board: freshmenBoard.id,
        type: "COMMENT"
    })

    Permission.create({
        role: freshmen.id,
        board: announcementBoard.id,
        type: "VIEW"
    })

    Permission.create({
        role: freshmen.id,
        board: announcementBoard.id,
        type: "COMMENT"
    })

    //일반회원 Permission 생성
    Permission.create({
        role: registered.id,
        board: announcementBoard.id,
        type: "VIEW"
    })
}

export default initializeDB;