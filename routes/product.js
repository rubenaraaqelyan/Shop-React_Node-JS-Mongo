const express = require('express')
const router = express.Router();

const ProductController = require('../controllers/ProductController')

const {isAuthenticatedUser, authorizeRoles} = require('../middlewares/auth');


router.route('/products').get(ProductController.getProducts);
router.route('/admin/products').get(ProductController.getAdminProducts);
router.route('/product/:id').get(ProductController.getSingleProduct);
router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles('admin'), ProductController.newProduct);
router.route('/admin/product/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), ProductController.updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), ProductController.deleteProduct);
router.route('/review').put(isAuthenticatedUser, ProductController.createProductReview)
router.route('/reviews').get(isAuthenticatedUser, ProductController.getProductReviews)
router.route('/reviews').delete(isAuthenticatedUser, ProductController.deleteReview)


module.exports = router;
