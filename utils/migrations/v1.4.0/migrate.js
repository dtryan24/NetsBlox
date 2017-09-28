// TODO: pull the data from the old blob and move them to the new (s3) blob

// Now, go through each project role and move it to s3 as:
//   - <username>/src-<role>@<project>
//   - <username>/media-<role>@<project>
// TODO
var fsBlob = require('./fs-blob'),
    s3Blob = require('../../../src/server/storage/blob-storage'),
    Logger = require('../src/server/logger'),
    logger = new Logger('netsblox:migrate:v1.4.0'),
    Storage = require('../../../src/server/storage/blob-storage'),
    storage = new Storage(logger);

// First, make sure that no roles or projects have '@' in the name
// TODO
storage.connect()
    .then(() => {
