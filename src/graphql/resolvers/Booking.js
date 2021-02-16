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
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingResolvers = void 0;
const mongodb_1 = require("mongodb");
const api_1 = require("../../lib/api");
const utils_1 = require("../../lib/utils");
exports.bookingResolvers = {
    Mutation: {
        createBooking: (_root, { input }, { db, req }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { listingId, source, checkIn, checkOut } = input;
                // verify loggin user (viewer) is making the request
                let viewer = yield utils_1.authorize(db, req);
                if (!viewer)
                    throw new Error('Viewer could not be found.');
                // find the listing that is being booked
                const listing = yield db.listings.findOne({ _id: new mongodb_1.ObjectID(listingId) });
                if (!listing)
                    throw new Error('Listing could not be found.');
                // check that viwer is NOT booking their own listing
                if (listing.host === viewer._id)
                    throw new Error('Viewer cannot book own listing.');
                // checkIn bofore checkOut
                const cIn = new Date(checkIn);
                const cOut = new Date(checkOut);
                if (cIn >= cOut)
                    throw new Error('Check out must be after check in.');
                // create new bookingsIndex (time occupied) for lisitng being booked
                const bookingsIndex = resolveBookingsIndex(listing.bookingsIndex, checkIn, checkOut);
                // get total price to charge
                const days = (cOut.getTime() - cIn.getTime()) / 1000 / 60 / 60 / 24;
                const totalPrice = Math.round(listing.price * days);
                // get user document of host of listing
                const host = yield db.users.findOne({ _id: listing.host });
                if (!host)
                    throw new Error('Host cannot be found!');
                if (!host.walletId)
                    throw new Error('Host not connected with Stripe.');
                // create Stripe charge on behalf of the host
                yield api_1.Stripe.charge(totalPrice, source, host.walletId);
                // inset new booking document into bookings collection
                const insertRes = yield db.bookings.insertOne({
                    _id: new mongodb_1.ObjectID(),
                    listing: listing._id,
                    tenant: viewer._id,
                    checkIn,
                    checkOut
                });
                const insertedBooking = insertRes.ops[0];
                // update user document of host to increment income
                yield db.users.updateOne({ _id: host._id }, { $inc: { income: totalPrice } });
                // update bookings field of the tenant (rentee)
                yield db.users.updateOne({ _id: viewer._id }, { $push: { bookings: insertedBooking._id } });
                // update bookings field of listing document
                yield db.listings.updateOne({ _id: listing._id }, {
                    $set: { bookingsIndex },
                    $push: { bookings: insertedBooking._id }
                });
                // return newly inserted booking
                return insertedBooking;
            }
            catch (error) {
                throw new Error(`Failed to create new booking: ${error}`);
            }
        })
    },
    Booking: {
        id: (booking) => booking._id.toString(),
        listing: (booking, _args, { db }) => {
            return db.listings.findOne({ _id: booking.listing });
        },
        tenant: (booking, _args, { db }) => {
            return db.users.findOne({ _id: booking.tenant });
        }
    }
};
// functions
const resolveBookingsIndex = (bookingsIndex, checkinDate, checkouDate) => {
    const dateCursor = new Date(checkinDate);
    const checkout = new Date(checkouDate);
    const newBookingsIndex = Object.assign({}, bookingsIndex);
    while (dateCursor < checkout) {
        const y = dateCursor.getUTCFullYear(); // yyyy
        const m = dateCursor.getUTCMonth(); // 0 .. 11
        const d = dateCursor.getUTCDate(); // 1 .. 31
        if (!newBookingsIndex[y])
            newBookingsIndex[y] = {};
        if (!newBookingsIndex[y][m])
            newBookingsIndex[y][m] = {};
        if (!newBookingsIndex[y][m][d]) {
            newBookingsIndex[y][m][d] = true;
        }
        else {
            const date = `${dateCursor.getDate()}/${dateCursor.getMonth() + 1}/${dateCursor.getFullYear()}`;
            throw new Error(`Listing already booked for ${date}!`);
        }
        dateCursor.setDate(dateCursor.getDate() + 1);
    }
    return newBookingsIndex;
};
