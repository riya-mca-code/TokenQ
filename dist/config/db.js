"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
let cached = false;
async function connectDatabase() {
    if (cached || mongoose_1.default.connection.readyState === 1)
        return mongoose_1.default.connection;
    await mongoose_1.default.connect(env_1.env.mongoUri);
    cached = true;
    return mongoose_1.default.connection;
}
