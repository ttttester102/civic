import { Connection } from './connection';
import { CommonJs } from './common';
import { ObjectId, ObjectID } from 'mongodb';
import SendMail from './sendMail';
import path from 'path';
import fs from 'fs';

const CommonJSInstance = new CommonJs();

export class Operations {

    /**
     * Post report
     * @param {*object} obj 
     * @param {*function} cb 
     */
    static postReport(obj, cb) {
        Connection.connect((err, db, client) => {
            if (err) CommonJs.close(client, CommonJSInstance.ERROR, err, cb);
            else {
                var collection = db.collection('reports');
                const { category, categoryType, comment, location } = obj;
                collection.insertOne({
                    category,
                    categoryType,
                    location,
                    comment,
                    images: obj.images,
                    createdTime: new Date().getTime(),
                    updatedTime: new Date().getTime()
                }, (err, data) => {
                    if (err) CommonJs.close(client, CommonJSInstance.ERROR, err, cb);
                    else CommonJs.close(client, CommonJSInstance.SUCCESS, data.ops[0], cb);
                });
            }
        })
    }

    /**
     * Get post reports
     * @param {*object} obj 
     * @param {*function} cb 
     */
    static getAllReports(obj, cb) {
        Connection.connect((err, db, client) => {
            if (err) CommonJs.close(client, CommonJSInstance.ERROR, err, cb);
            else {
                var collection = db.collection('reports');
                const { skip, limit } = obj;
                collection.find({}, { skip: skip ? parseInt(skip) : 0, limit: limit ? parseInt(limit) : 0, sort: { '$natural': -1 } }).toArray((err, data) => {
                    if (err) CommonJs.close(client, CommonJSInstance.ERROR, err, cb);
                    else CommonJs.close(client, CommonJSInstance.SUCCESS, data, cb);
                });
            }
        })
    }
}

