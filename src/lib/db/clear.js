"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const readline = __importStar(require("readline"));
const database_1 = require("../../database");
const clear = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[clear] running ....');
    const db = yield database_1.connectDatabase();
    const bookings = yield db.bookings.find({}).toArray();
    if (bookings.length > 0) {
        yield db.bookings.drop();
    }
    const listings = yield db.listings.find({}).toArray();
    if (listings.length > 0) {
        yield db.listings.drop();
    }
    const users = yield db.users.find({}).toArray();
    if (users.length > 0) {
        yield db.users.drop();
    }
    console.log('[clear] ... finished');
    process.exit();
});
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.question('[clear] Delete all your data? [y/n] ', (answer) => {
    if (answer === 'y') {
        clear();
    }
    else {
        console.log('[clear] No data touched!');
        process.exit();
    }
});
