import express from 'express';
import { Operations } from '../operations/operations';
import { CommonJs } from '../operations/common';
import media from './media';
import path from 'path';
import fs from 'fs';
import Stripe from 'stripe';
import { Auth } from './auth';

/** Route */
var routes = express.Router();
var CommonJsInstance = new CommonJs();
var stripe = new Stripe('');

/** Create customer */
routes.post('/createCustomer',
    (req, res, next) => Auth.userAuth(req, res, next, 'createCustomer'),
    (req, res, next) =>
        Operations.getUserViaId(req.body, (status, response) => {
            if (status === CommonJsInstance.SUCCESS) {
                req.body.userData = response;
                next();
            } else CommonJs.httpResponse(req, res, status, response);
        })
    ,
    (req, res, next) => {
        const { stripeCustomerId, email } = req.body.userData;

        if (!stripeCustomerId) {
            stripe.customers.create({
                description: 'Customer for ' + email,
                email
            }, function (err, customer) {
                // asynchronously called
                console.log("create customer ====> ", err, customer);
                if (err) CommonJs.httpResponse(req, res, CommonJsInstance.ERROR, err);
                else {
                    req.body.stripeCustomerId = customer && customer.id;
                    Operations.storeStripeCustomerIdOfUser(req.body, (status, response) => {
                        if (status === CommonJsInstance.SUCCESS) next();
                        else CommonJs.httpResponse(req, res, status, response);
                    });
                }
            })
        } else next();
    }, (req, res) => {
        const { userData, number, exp_month, exp_year, cvc, name } = req.body;
        const stripeCustomerId = userData && userData.stripeCustomerId ? userData.stripeCustomerId : req.body.stripeCustomerId ? req.body.stripeCustomerId : null;

        console.log("stripe customer id", stripeCustomerId);
        if (stripeCustomerId) {
            stripe.customers.retrieve(
                stripeCustomerId,
                function (err, customer) {
                    // asynchronously called
                    // console.log(err, customer);
                    if (err) CommonJs.httpResponse(req, res, CommonJsInstance.ERROR, err);
                    else {
                        stripe.tokens.create({
                            card: {
                                object: 'card',
                                number,
                                exp_month,
                                exp_year,
                                cvc,
                                currency: 'usd',
                                name
                            }
                        }, function (err, token) {
                            // asynchronously called
                            console.log('err', err, token)
                            if (err) CommonJs.httpResponse(req, res, CommonJsInstance.ERROR, err);
                            else {
                                stripe.customers.createSource(
                                    customer.id,
                                    {
                                        source: token.id,
                                    },
                                    function (err, card) {
                                        // asynchronously called
                                        console.log(err, card);
                                        if (err) CommonJs.httpResponse(req, res, CommonJsInstance.ERROR, err);
                                        else CommonJs.httpResponse(req, res, CommonJsInstance.SUCCESS, card);
                                    }
                                );
                            }
                        });
                    }
                });
        } else CommonJs.httpResponse(req, res, CommonJsInstance.NOVALUE, []);
    });

/** Retreive cards */
routes.post('/retrieveCard',
    (req, res, next) => Auth.userAuth(req, res, next, 'retrieveCard'),
    (req, res, next) =>
        Operations.getUserViaId(req.body, (status, response) => {
            if (status === CommonJsInstance.SUCCESS) {
                req.body.userData = response;
                next();
            } else CommonJs.httpResponse(req, res, status, response);
        })
    ,
    (req, res, next) => {
        const { stripeCustomerId, email } = req.body.userData;

        if (!stripeCustomerId) {
            stripe.customers.create({
                description: 'Customer for ' + email,
                email
            }, function (err, customer) {
                // asynchronously called
                console.log("create customer ====> ", err, customer);
                if (err) CommonJs.httpResponse(req, res, CommonJsInstance.ERROR, err);
                else {
                    req.body.stripeCustomerId = customer && customer.id;
                    Operations.storeStripeCustomerIdOfUser(req.body, (status, response) => {
                        if (status === CommonJsInstance.SUCCESS) next();
                        else CommonJs.httpResponse(req, res, status, response);
                    });
                }
            })
        } else next();
    },
    (req, res) => {
        const { userData, cardId } = req.body;
        const stripeCustomerId = userData && userData.stripeCustomerId ? userData.stripeCustomerId : req.body.stripeCustomerId ? req.body.stripeCustomerId : null;
        console.log("stripeCustomerId ===> ", stripeCustomerId);

        if (stripeCustomerId) {
            stripe.customers.retrieve(
                stripeCustomerId,
                function (err, customer) {
                    // asynchronously called
                    // console.log(err, customer);
                    if (err) CommonJs.httpResponse(req, res, CommonJsInstance.ERROR, err);
                    else {
                        stripe.customers.retrieveCard(
                            customer.id,
                            cardId,
                            function (err, card) {
                                // asynchronously called
                                console.log(err, card);
                                if (err) CommonJs.httpResponse(req, res, CommonJsInstance.ERROR, err);
                                else CommonJs.httpResponse(req, res, CommonJsInstance.SUCCESS, card);
                            }
                        );
                    }
                });
        } else CommonJs.httpResponse(req, res, CommonJsInstance.NOT_VALID, []);
    });

/** Update card */
routes.post('/updateCard',
    (req, res, next) => Auth.userAuth(req, res, next, 'updateCard'),
    (req, res, next) =>
        Operations.getUserViaId(req.body, (status, response) => {
            if (status === CommonJsInstance.SUCCESS) {
                req.body.userData = response;
                next();
            } else CommonJs.httpResponse(req, res, status, response);
        })
    ,
    (req, res, next) => {
        const { stripeCustomerId, email } = req.body.userData;

        if (!stripeCustomerId) {
            stripe.customers.create({
                description: 'Customer for ' + email,
                email
            }, function (err, customer) {
                // asynchronously called
                console.log("create customer ====> ", err, customer);
                if (err) CommonJs.httpResponse(req, res, CommonJsInstance.ERROR, err);
                else {
                    req.body.stripeCustomerId = customer && customer.id;
                    Operations.storeStripeCustomerIdOfUser(req.body, (status, response) => {
                        if (status === CommonJsInstance.SUCCESS) next();
                        else CommonJs.httpResponse(req, res, status, response);
                    });
                }
            })
        } else next();
    },
    (req, res) => {
        const { userData, cardId, exp_month, exp_year, name } = req.body;
        const stripeCustomerId = userData && userData.stripeCustomerId ? userData.stripeCustomerId : req.body.stripeCustomerId ? req.body.stripeCustomerId : null;
        console.log("stripeCustomerId ===> ", stripeCustomerId);

        if (stripeCustomerId) {
            stripe.customers.retrieve(
                stripeCustomerId,
                function (err, customer) {
                    // asynchronously called
                    // console.log(err, customer);
                    if (err) CommonJs.httpResponse(req, res, CommonJsInstance.ERROR, err);
                    else {
                        stripe.customers.updateCard(
                            customer.id,
                            cardId,
                            {
                                exp_month,
                                exp_year,
                                name
                            },
                            function (err, card) {
                                // asynchronously called
                                console.log(err, card);
                                if (err) CommonJs.httpResponse(req, res, CommonJsInstance.ERROR, err);
                                else CommonJs.httpResponse(req, res, CommonJsInstance.SUCCESS, card);
                            }
                        );
                    }
                });
        } else CommonJs.httpResponse(req, res, CommonJsInstance.SUCCESS, card);
    });

/** Retreive all cards */
routes.post('/allCards',
    (req, res, next) => Auth.userAuth(req, res, next, 'allCards'),
    (req, res, next) =>
        Operations.getUserViaId(req.body, (status, response) => {
            if (status === CommonJsInstance.SUCCESS) {
                req.body.userData = response;
                next();
            } else CommonJs.httpResponse(req, res, status, response);
        })
    ,
    (req, res, next) => {
        const { stripeCustomerId, email } = req.body.userData;

        if (!stripeCustomerId) {
            stripe.customers.create({
                description: 'Customer for ' + email,
                email
            }, function (err, customer) {
                // asynchronously called
                console.log("create customer ====> ", err, customer);
                if (err) CommonJs.httpResponse(req, res, CommonJsInstance.ERROR, err);
                else {
                    req.body.stripeCustomerId = customer && customer.id;
                    Operations.storeStripeCustomerIdOfUser(req.body, (status, response) => {
                        if (status === CommonJsInstance.SUCCESS) next();
                        else CommonJs.httpResponse(req, res, status, response);
                    });
                }
            })
        } else next();
    },
    (req, res) => {
        const { userData } = req.body;
        const stripeCustomerId = userData && userData.stripeCustomerId ? userData.stripeCustomerId : req.body.stripeCustomerId ? req.body.stripeCustomerId : null;
        console.log("stripeCustomerId ===> ", stripeCustomerId);

        if (stripeCustomerId) {
            stripe.customers.listCards(
                stripeCustomerId,
                function (err, cards) {
                    // asynchronously called
                    // console.log(err, customer);
                    if (err) CommonJs.httpResponse(req, res, CommonJsInstance.ERROR, err);
                    else CommonJs.httpResponse(req, res, CommonJsInstance.SUCCESS, cards);
                });
        } else CommonJs.httpResponse(req, res, CommonJsInstance.SUCCESS, card);
    });

/** Delete card */
routes.post('/deleteCard',
    (req, res, next) => Auth.userAuth(req, res, next, 'deleteCard'),
    (req, res, next) =>
        Operations.getUserViaId(req.body, (status, response) => {
            if (status === CommonJsInstance.SUCCESS) {
                req.body.userData = response;
                next();
            } else CommonJs.httpResponse(req, res, status, response);
        })
    ,
    (req, res, next) => {
        const { stripeCustomerId, email } = req.body.userData;

        if (!stripeCustomerId) {
            stripe.customers.create({
                description: 'Customer for ' + email,
                email
            }, function (err, customer) {
                // asynchronously called
                console.log("create customer ====> ", err, customer);
                if (err) CommonJs.httpResponse(req, res, CommonJsInstance.ERROR, err);
                else {
                    req.body.stripeCustomerId = customer && customer.id;
                    Operations.storeStripeCustomerIdOfUser(req.body, (status, response) => {
                        if (status === CommonJsInstance.SUCCESS) next();
                        else CommonJs.httpResponse(req, res, status, response);
                    });
                }
            })
        } else next();
    },
    (req, res) => {
        const { userData, cardId } = req.body;
        const stripeCustomerId = userData && userData.stripeCustomerId ? userData.stripeCustomerId : req.body.stripeCustomerId ? req.body.stripeCustomerId : null;
        console.log("stripeCustomerId ===> ", stripeCustomerId);

        if (stripeCustomerId) {
            stripe.customers.deleteCard(
                stripeCustomerId,
                cardId,
                function (err, card) {
                    // asynchronously called
                    // console.log(err, customer);
                    if (err) CommonJs.httpResponse(req, res, CommonJsInstance.ERROR, err);
                    else CommonJs.httpResponse(req, res, CommonJsInstance.SUCCESS, card);
                });
        } else CommonJs.httpResponse(req, res, CommonJsInstance.SUCCESS, card);
    });

module.exports = routes;
