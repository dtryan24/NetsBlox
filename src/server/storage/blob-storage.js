// blob storage used for the raw project storage and media storage
// Set the location using NETSBLOX_BLOB_DIR (default is /<netsblox-root>/blob-storage)

// Functionality:
//  - CRD (create/store, get, remove/delete)
//    - they should all be "promisified"
//  - create should return id (hash - probably sha256)

const Logger = require('../logger'),
    logger = new Logger('netsblox:blob-storage'),
    Q = require('q'),
    AWS = require('aws-sdk');

var BlobStorage = function() {
    // create the given directory, if needed
    this._client = new AWS.S3({
        endPoint: process.env.S3_ENDPOINT || 'http://127.0.0.1:9000',
        //port: process.env.S3_PORT || 9000,
        //secure: process.env.S3_SECURE !== undefined ? process.env.S3_SECURE : true,
        accessKeyId: process.env.S3_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_KEY,
        s3ForcePathStyle: 'true',
        signatureVersion: 'v4'
    });
};

// TODO: Update the following methods
BlobStorage.prototype.store = function(owner, project, role, type, data) {
    var bucket = owner,
        key = `${type}@${role}@${project}`;

    logger.info(`storing data in the blob: ${owner}/${key}`);
    return Q.ninvoke(this._client, 'putObject', {Bucket: bucket, Key: key, Body: data})
        .then(() => {
            return {
                Bucket: bucket,
                Key: key
            };
        })
        .fail(err => {
            logger.error(`Could not write to ${owner}/${key}: ${err}`);
            throw err;
        });
};

BlobStorage.prototype.get = function(id) {
    var data = '';
    var deferred = Q.defer();

    this._client.getObject(id)
        .on('httpData', chunk => data += chunk)
        .on('httpDone', () => deferred.resolve(data))
        .on('error', err => {
            logger.error(`Could not read from ${JSON.stringify(id)}: ${err}`);
            throw err;
        });
};

BlobStorage.prototype.delete = function(id) {
    // TODO: delete the blob data on project deletion!
    logger.trace(`deleting blob data: ${JSON.stringify(id)}`);
    return Q.ninvoke(this._client, 'deleteObject', id);
};

// TODO: copy object?
module.exports = new BlobStorage();
