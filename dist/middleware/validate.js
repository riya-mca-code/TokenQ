"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const response_1 = require("../utils/response");
function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        if (!result.success) {
            return (0, response_1.sendError)(res, 422, result.error.issues[0]?.message || "Validation error");
        }
        const data = result.data;
        req.body = data.body;
        req.query = data.query;
        req.params = data.params;
        return next();
    };
}
