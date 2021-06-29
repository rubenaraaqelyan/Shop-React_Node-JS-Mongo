const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController')


const {isAuthenticatedUser, authorizeRoles} = require('../middlewares/auth')

router.route('/register').post(AuthController.registerUser);
router.route('/login').post(AuthController.loginUser);
router.route('/password/forgot').post(AuthController.forgotPassword)
router.route('/password/reset/:token').put(AuthController.resetPassword)
router.route('/logout').get(AuthController.logout);
router.route('/me').get(isAuthenticatedUser, AuthController.getUserProfile)
router.route('/password/update').put(isAuthenticatedUser, AuthController.updatePassword)
router.route('/me/update').put(isAuthenticatedUser, AuthController.updateProfile)
router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles('admin'), AuthController.allUsers)
router.route('/admin/user/:id')
    .get(isAuthenticatedUser, authorizeRoles('admin'), AuthController.getUserDetails)
    .put(isAuthenticatedUser, authorizeRoles('admin'), AuthController.updateUser)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), AuthController.deleteUser)


module.exports = router;
