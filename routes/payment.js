const express = require('express')
const router = express.Router();

// const {processPayment, sendStripApi} = require('../controllers/PaymentController')
const PaymentController = require('../controllers/PaymentController')

const {isAuthenticatedUser} = require('../middlewares/auth')

router.route('/payment/process').post(isAuthenticatedUser, PaymentController.processPayment);
router.route('/stripeapi').get(isAuthenticatedUser, PaymentController.sendStripApi);

module.exports = router;
