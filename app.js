const express = require("express");
const bodyParser = require("body-parser");
// Sample test API key from Stripe Docs
const stripe = require("stripe")("sk_test_4eC39HqLyjWDarjtT1zdp7dc");
const app = express();
const PORT = process.env.PORT || 4000;

let jsonParser = bodyParser.json();
let urlencodedParser = bodyParser.urlencoded({ extended: false });


app.use('/assets/', express.static("assets"));
app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
});



// Makeshift way of creating a Stripe Product and Price/Plan (required for Subscriptions)
let organizationProduct, subscriptionPrice, subscriptionPlan;
(async function () {
    organizationProduct = await stripe.products.create({
        name: 'TGF Organization',
    });
    subscriptionPrice = await stripe.prices.create({
        unit_amount: 2_00,
        currency: 'usd',
        recurring: {interval: 'month'},
        product: organizationProduct.id,
    });
    subscriptionPlan = await stripe.plans.create({
        amount: 2_00,
        currency: 'usd',
        interval: 'month',
        product: organizationProduct.id,
    });
})()

  
// http://localhost:4000/v3/
app.get("/v3/", (req, res) => res.render("v3/index.ejs"));
app.post("/v3/", jsonParser, async (req, res) => {
    console.log("💳 Processing...");

    try {
        // Create a PaymentMethod with received card info
        let paymentMethod = await stripe.paymentMethods.create({
            type: "card",
            card: req.body.card,
            billing_details: {
                address: {
                    postal_code: req.body.address_zip
                }
            }
        });

        // Charge using PaymentIntents (using a PaymentMethod)
        if (req.body.paytype === "one-time") {
            await stripe.paymentIntents.create({
                amount: 90_00,
                currency: "usd",
                payment_method: paymentMethod.id,
                confirm: true
            });
            
            console.log("✅ Payment successful!");
        }
        // Create a Subscription with a Price
        else {
            let customer = await stripe.customers.create({
                payment_method: paymentMethod.id
            });

            await stripe.subscriptions.create({
                customer: customer.id,
                default_payment_method: paymentMethod.id,
                items: [{ price: subscriptionPrice.id }]
            });

            console.log("🧑 Set subscription for a customer!");
        }

        // On success
        res.send(JSON.stringify({ success: true }));
    }
    // Send the error back
    catch (e) {
        console.log("❌ Failure: " + e.code);
        res.send(JSON.stringify({ error: e.code }));
    }
});


// http://localhost:4000/v2/
app.get("/v2/", (req, res) => res.render("v2/index.ejs", { error: undefined }));
app.post("/v2/", urlencodedParser, async (req, res) => {
    console.log("💳 Processing...");

    try {
        // Charge using given Token
        if (req.body.paytype === "one-time") {
            await stripe.charges.create({
                amount: 90_00,
                currency: 'usd',
                source: req.body.cc_token_id,
            });
            
            console.log("✅ Payment successful!");
        }
        // Create a Subscription with a Plan
        else {
            let customer = await stripe.customers.create({
                source: req.body.cc_token_id
            });

            await stripe.subscriptions.create({
                customer: customer.id,
                plan: subscriptionPlan.id
            });

            console.log("🧑 Set subscription for customer!");
        }

        // On success
        res.render("v2/success.ejs");
    }
    // 
    catch (e) {
        // Rerender page with error, not suggested (customer loses inputted card info on frontend)
        console.log("❌ Failure: " + e.code);
        res.render("v2/index.ejs", { error: e.code });
    }
});
