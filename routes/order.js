const express = require('express')
const router = express.Router();

const OrderController = require('../controllers/OrderController')

const {isAuthenticatedUser, authorizeRoles} = require('../middlewares/auth')

router.route('/order/new').post(isAuthenticatedUser, OrderController.newOrder);
router.route('/order/:id').get(isAuthenticatedUser, OrderController.getSingleOrder);
router.route('/orders/me').get(isAuthenticatedUser, OrderController.myOrders);
router.route('/admin/orders/').get(isAuthenticatedUser, authorizeRoles('admin'), OrderController.allOrders);
router.route('/admin/order/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), OrderController.updateOrder)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), OrderController.deleteOrder);


module.exports = router;
