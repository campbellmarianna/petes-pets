const Upload = require('s3-uploader');

const client = new Upload(process.env.S3_BUCKET, {
    aws: {
        path: 'pets/avatar',
        region: process.env.S3_REGION,
        acl: 'public-read',
        acessKEYId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    cleanup: {
        versions: true,
        original: true
    },
    versions: [{
        maxWidth: 400,
        aspect: '16:10',
        suffix: '-standard'
    },{
        maxWidth: 300,
        aspect: '1:1',
        suffix: '-square'
    }]
});

module.exports = client;
