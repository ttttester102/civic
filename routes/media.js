import express from 'express';
import multer from 'multer';
var router = express.Router();
import fs from 'fs';
import path from 'path';
import { Operations } from '../operations/operations';
import { CommonJs } from '../operations/common';
import { Auth } from './auth';

var router = express.Router();
const CommonJsInstance = new CommonJs();

/** Media files storage */
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), '/public/uploadFiles'))
    },
    filename: (req, file, cb) => {
        if (req.body && !req.body.images) req.body.images = [];
        var randomNumber = Math.floor(Math.random() * 10000);
        var time = new Date().getTime();
        let fileName = time + '' + randomNumber + 'civic.' + file.mimetype.split('/')[1];
        let imagePath = path.join('/uploadFiles', fileName);

        req.body.images.push(path.join(CommonJsInstance.BASE_URL, imagePath));
        cb(null, fileName);
    }
});

var upload = multer({ storage: storage }).any();

router.post('/postReport', (req, res, next) =>
    upload(req, res, (err, data) => {
        if (err) CommonJs.httpResponse(req, res, CommonJsInstance.ERROR, err);
        else next();
    }),
    (req, res) => CommonJs.validate("postReport", req.body, (status, emptyKeys) => {
        if (status) {
            Operations.postReport(req.body, (status, response) => {
                CommonJs.httpResponse(req, res, status, response);
            });
        } else CommonJs.httpResponse(req, res, CommonJsInstance.VALIDATE_ERROR, emptyKeys);
    }));

module.exports = router;