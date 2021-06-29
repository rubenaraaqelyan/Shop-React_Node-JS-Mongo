const User = require('../models/user');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require("crypto");
const cloudinary = require('cloudinary');
const Joi = require('joi');

class AuthController {
 static registerUser = catchAsyncErrors(async (req, res, next) => {
        try {
            const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
                folder: 'avatars',
                width: 150,
                crop: "scale"
            })
            const {name, email, password} = req.body;
            const schema = Joi.object({
                name: Joi.string().alphanum()
                    .min(3)
                    .max(30)
                    .required(),
                email: Joi.string().email(),
                password: Joi.string()
                    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
            })
            schema.validate({})
            const user = await User.create({
                name,
                email,
                password,
                avatar: {
                    public_id: result.public_id,
                    url: result.secure_url
                }
            })
            sendToken(user, 200, res)
        } catch (err) {
            next(err)
        }
    })


    static  loginUser = catchAsyncErrors(async (req, res, next) => {
        const {email, password} = req.body;
        if (!email || !password) {
            return next(new ErrorHandler('Please enter email & password', 400))
        }

        const user = await User.findOne({email}).select('+password')
        if (!user) {
            return next(new ErrorHandler('Invalid Email or Password', 401));
        }
        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return next(new ErrorHandler('Invalid Email or Password', 401));
        }
        sendToken(user, 200, res)
    })

    static forgotPassword = catchAsyncErrors(async (req, res, next) => {
        const user = await User.findOne({email: req.body.email});

        if (!user) {
            return next(new ErrorHandler('User not found with this email', 404));
        }
        const resetToken = user.getResetPasswordToken();
        await user.save({validateBeforeSave: false});
        const resetUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`;
        const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`
        try {
            await sendEmail({
                email: user.email,
                subject: 'Shop Password Recovery',
                message
            })
            res.status(200).json({
                success: true,
                message: `Email sent to: ${user.email}`
            })

        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({validateBeforeSave: false});
            return next(new ErrorHandler(error.message, 500))
        }

    })

    static  resetPassword = catchAsyncErrors(async (req, res, next) => {

        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: {$gt: Date.now()}
        })
        if (!user) {
            return next(new ErrorHandler('Password reset token is invalid or has been expired', 400))
        }

        if (req.body.password !== req.body.confirmPassword) {
            return next(new ErrorHandler('Password does not match', 400))
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        sendToken(user, 200, res)
    })


    static  getUserProfile = catchAsyncErrors(async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id);
            res.status(200).json({
                success: true,
                user
            })
        } catch (err) {
            next(err)
        }
    })

    static updatePassword = catchAsyncErrors(async (req, res, next) => {
        const user = await User.findById(req.user.id).select('+password');
        const isMatched = await user.comparePassword(req.body.oldPassword)
        if (!isMatched) {
            return next(new ErrorHandler('Old password is incorrect'));
        }
        user.password = req.body.password;
        await user.save();
        sendToken(user, 200, res)
    })

    static updateProfile = catchAsyncErrors(async (req, res, next) => {
        try {
            const newUserData = {
                name: req.body.name,
                email: req.body.email
            }

            if (req.body.avatar !== '') {
                const user = await User.findById(req.user.id)
                const image_id = user.avatar.public_id;
                const res = await cloudinary.v2.uploader.destroy(image_id);

                const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
                    folder: 'avatars',
                    width: 150,
                    crop: "scale"
                })
                newUserData.avatar = {
                    public_id: result.public_id,
                    url: result.secure_url
                }
            }

            const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
                new: true,
                runValidators: true,
                useFindAndModify: false
            })

            res.status(200).json({
                success: true
            })
        } catch (err) {
            next(err)
        }
    })


    static  logout = catchAsyncErrors(async (req, res, next) => {
        try {
            res.cookie('token', null, {
                expires: new Date(Date.now()),
                httpOnly: true
            })

            res.status(200).json({
                success: true,
                message: 'Logged out'
            })
        } catch (err) {
            next(err)
        }
    })


    static allUsers = catchAsyncErrors(async (req, res, next) => {
        try {
            const users = await User.find();

            res.status(200).json({
                success: true,
                users
            })
        } catch (err) {
            next(err)
        }
    })


    static getUserDetails = catchAsyncErrors(async (req, res, next) => {
        const user = await User.findById(req.params.id);

        if (!user) {
            return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
        }

        res.status(200).json({
            success: true,
            user
        })
    })


    static  updateUser = catchAsyncErrors(async (req, res, next) => {
        try {
            const newUserData = {
                name: req.body.name,
                email: req.body.email,
                role: req.body.role
            }

            const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
                new: true,
                runValidators: true,
                useFindAndModify: false
            })

            res.status(200).json({
                success: true
            })
        } catch (err) {
            next(err)
        }
    })

    static deleteUser = catchAsyncErrors(async (req, res, next) => {
        const user = await User.findById(req.params.id);

        if (!user) {
            return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
        }
        const image_id = user.avatar.public_id;
        await cloudinary.v2.uploader.destroy(image_id);
        await user.remove();
        res.status(200).json({
            success: true,
        })
    })
}

module.exports = AuthController;



