import express from 'express';
import { Operations } from '../operations/operations';
import { CommonJs } from '../operations/common';
import media from './media';
import path from 'path';
import fs from 'fs';
import { Auth } from './auth';
import payments from './payments';

/** Route */
var router = express.Router();

var CommonJsInstance = new CommonJs();

/** Get all reports */
router.get('/getAllReports/:limit?/:skip?', (req, res) => {
    Operations.getAllReports(req.params, (status, response) => {
        CommonJs.httpResponse(req, res, status, response);
    });
});

/** Media files api */
router.use('/', media);

module.exports = router;
