function checkBodyNull(request) {
    if (request.body == undefined) {
        return true;
    }
    else {
        return false;
    }
}

export { checkBodyNull } 