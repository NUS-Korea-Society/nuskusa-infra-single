import AWS from 'aws-sdk'

function checkBodyNull(request) {
    if (request.body == undefined) {
        return true;
    }
    else {
        return false;
    }
}

const REGION = 'ap-southeast-1'
const CREDENTIALS = AWS.SharedIniFileCredentials({
    profile: 'default',
    filename: '/root/.aws/credentials'
})

const s3Client = new AWS.S3({
    region: REGION,
    credentials: CREDENTIALS
})

export { checkBodyNull, s3Client } 