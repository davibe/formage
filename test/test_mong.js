'use strict';
var nodestrum = require("nodestrum");
nodestrum.register_process_catcher();
process.env.FORMAGE_DB_LAYER = 'mongoose';

var _ = require('lodash');
var express = require('express');
var sinon = require('sinon');
var domain = require('domain');
var chai = require('chai');
var should = chai.should();
chai.Assertion.includeStack = true;

var formage = require('../index');
var mongoose = require("mongoose");

describe("high level REST requests", function () {
    before(function (done) {
        mongoose.connect('mongodb://localhost/formage-test', function () {
            var AppliesTo = mongoose.model('AppliesTo', new mongoose.Schema({
                Title: {type: String, limit: 100},
                Identifier: {type: String, limit: 100},
                Editable: {type: Number}
            }));

            var app = express();
            formage.init(app, express, {AppliesTo: AppliesTo}, {
                title: 'Formage Example',
                default_section: 'Main',
                admin_users_gui: true
            });
            //noinspection JSUnresolvedVariable
            mock_req_proto.app = module.admin_app = app.admin_app;
            done()
        });
    });

    describe("pages", function () {
        it("Mock test document page", function (done) {
            //noinspection JSUnresolvedVariable
            var mock_req = _.defaults({
                url: "/model/AppliesTo/document/new",
                method: "GET"
            }, mock_req_proto);
            var mock_res = _.defaults({ req: mock_req }, mock_res_proto);

            mock_res.render = function (view, options) {
                view.should.equal("document.jade");
                should.exist(options);
                d.exit();
                done()
            };

            var d = domain.createDomain();
            d.on('error', function (err) {
                d.exit();
                done(err);
            });
            d.enter();

            module.admin_app.handle(mock_req, mock_res);
        });


        it("Mock test document post", function (done) {
            //noinspection JSUnresolvedVariable
            var mock_req = _.defaults({
                url: "/model/AppliesTo/document/new",
                method: "POST",
                body: {
                    Title: "gaga5",
                    Identifier: "asdf",
                    Editable: "1"
                },
                path: ""
            }, mock_req_proto);
            var mock_res = _.defaults({ req: mock_req }, mock_res_proto);

            mock_res.redirect = function (path) {
                Number(1).should.equal(arguments.length);
                d.exit();
                done();
            };

            var d = domain.createDomain();
            d.on('error', function (err) {
                d.exit();
                done(err);
            });
            d.enter();

            module.admin_app.handle(mock_req, mock_res);
        });


        it("Mock test model page", function (done) {
            //noinspection JSUnresolvedVariable
            var mock_req = _.defaults({
                url: "/model/AppliesTo/",
                query: {start: "2"},
                method: "GET"
            }, mock_req_proto);
            var mock_res = _.defaults({ req: mock_req }, mock_res_proto);

            mock_res.render = function (view, options) {
                view.should.equal("model.jade");
                should.exist(options);
                this.req.app.render(view, options, function (err, doc) {
                    should.exist(doc);
                    d.exit();
                    done(err);
                });
            };

            var d = domain.createDomain();
            d.on('error', function (err) {
                d.exit();
                done(err);
            });
            d.enter();

            module.admin_app.handle(mock_req, mock_res);
        });


        it("Mock test models page", function (done) {
            //noinspection JSUnresolvedVariable
            var mock_req = _.defaults({
                url: "/",
                method: "GET"
            }, mock_req_proto);
            var mock_res = _.defaults({ req: mock_req }, mock_res_proto);

            mock_res.render = function (view, options) {
                view.should.equal("models.jade");
                should.exist(options);
                this.req.app.render(view, options, function (err, doc) {
                    should.exist(doc);
                    d.exit();
                    done(err);
                });
            };

            var d = domain.createDomain();
            d.on('error', function (err) {
                d.exit();
                done(err);
            });
            d.enter();

            module.admin_app.handle(mock_req, mock_res);
        });

        it("Mock test admin user page post", function (done) {
            var mock_req = _.defaults({
                url: "/model/Admin_Users/document/new",
                body: {username: "admin" + Math.random()},
                method: "POST",
                path: ""
            }, mock_req_proto);

            var mock_res = _.defaults({
                req: mock_req
            }, mock_res_proto);

            var d = domain.createDomain();
            d.on('error', function (err) {
                d.exit();
                done(err);
            });
            d.enter();

            mock_res.redirect = function (p) {
                should.exist(p);
                d.exit();
                done();
            };

            module.admin_app.handle(mock_req, mock_res);
        });
    });

    after(function (done) {
        mongoose.disconnect();
        done();
    });
});


var mock_req_proto = {
    params: {},
    session: {_mongooseAdminUser: {}},
    query: {},
    admin_user: {hasPermissions: function () {return true}}
};


var mock_res_proto = {
    setHeader: function () {},
    render: function (view, options) {
        options = options || {};
        var self = this
            , req = this.req
            , app = req.app;

        // merge res.locals
        options._locals = self.locals;

        // render
        app.render(view, options, this.end);
    }
};