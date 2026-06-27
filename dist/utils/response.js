"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
function sendSuccess(res, message, data, status = 200) {
    return res.status(status).json({
        success: true,
        message,
        data,
    });
}
function sendError(res, status, message) {
    return res.status(status).json({
        success: false,
        message,
    });
}
