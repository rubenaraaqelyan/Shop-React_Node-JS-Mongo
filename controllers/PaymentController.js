const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const {STRIPE_API_KEY, STRIPE_SECRET_KEY} = process.env;
const stripe = require('stripe')(STRIPE_SECRET_KEY);

class PaymentController {
    static  processPayment = catchAsyncErrors(async (req, res, next) => {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: req.body.amount,
                currency: 'usd',

                metadata: {integration_check: 'accept_a_payment'}
            });

            res.status(200).json({
                success: true,
                client_secret: paymentIntent.client_secret
            })
        } catch (err) {
            next(err)
        }
    })

    static sendStripApi = catchAsyncErrors(async (req, res, next) => {
        res.status(200).json({
            stripeApiKey: STRIPE_API_KEY
        })
    })
}

module.exports = PaymentController;



