// backend/lib/stripe.js
const Stripe = require("stripe");

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  throw new Error("STRIPE_SECRET_KEY is not set. Add it to backend/.env");
}

const stripe = new Stripe(key, { apiVersion: "2024-06-20" });
module.exports = stripe;
