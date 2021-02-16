"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stripe = void 0;
const stripe_1 = __importDefault(require("stripe"));
const client = new stripe_1.default(`${process.env.STRIPE_SECRET_KEY}`, {
    apiVersion: '2020-08-27' // '2019-12-03' 
});
exports.Stripe = {
    connect: (code) => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield client.oauth.token({
            grant_type: 'authorization_code',
            code
        });
        return response;
    }),
    charge: (amount, // in smallest currency unit like cent/penny
    source, // rentee's payment insormation
    stripeAccount // host's walletId
    ) => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield client.charges.create({
            amount,
            currency: 'gbp',
            source,
            application_fee_amount: Math.round(amount * 0.05) // 5% 
        }, { stripe_account: stripeAccount });
        // succeded | pending | failed
        // since function abave awaits for completion this excludes pending
        if (res.status !== 'succeeded') {
            console.log(res);
            throw new Error('Failed to create charge with Stripe.');
        }
    })
};
