"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealth = getHealth;
const response_1 = require("../utils/response");
function getHealth(req, res) {
    return (0, response_1.sendSuccess)(res, "Service is healthy", {
        status: "ok",
        timestamp: new Date().toISOString(),
    });
}
