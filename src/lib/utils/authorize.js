"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (db, req) => {
    const token = req.get('X-CSRF-TOKEN');
    const viewer = db.users.findOne({
        _id: req.signedCookies.viewer,
        token,
    });
    return viewer;
};
exports.authorize = authorize;
