const Product = require('../models/product')
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures')
const cloudinary = require('cloudinary')

class ProductController {
    static newProduct = catchAsyncErrors(async (req, res, next) => {
        try {
            let images = []
            if (typeof req.body.images === 'string') {
                images.push(req.body.images)
            } else {
                images = req.body.images
            }

            let imagesLinks = [];
            for (let i = 0; i < images.length; i++) {
                const result = await cloudinary.v2.uploader.upload(images[i], {
                    folder: 'products'
                });

                imagesLinks.push({
                    public_id: result.public_id,
                    url: result.secure_url
                })
            }

            req.body.images = imagesLinks
            req.body.user = req.user.id;

            const product = await Product.create(req.body);

            res.status(201).json({
                success: true,
                product
            })
        } catch (err) {
            next(err)
        }
    })


    static getProducts = catchAsyncErrors(async (req, res, next) => {
        try {
            const resPerPage = 12;
            const productsCount = await Product.countDocuments();
            const apiFeatures = new APIFeatures(Product.find(), req.query)
                .search()
                .filter()

            let products = await apiFeatures.query;
            let filteredProductsCount = products.length;
            apiFeatures.pagination(resPerPage)
            products = await apiFeatures.query;

            res.status(200).json({
                success: true,
                productsCount,
                resPerPage,
                filteredProductsCount,
                products
            })
        } catch (err) {
            next(err)
        }
    })


    static getAdminProducts = catchAsyncErrors(async (req, res, next) => {
        const products = await Product.find();
        res.status(200).json({
            success: true,
            products
        })
    })

    static  getSingleProduct = catchAsyncErrors(async (req, res, next) => {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return next(new ErrorHandler('Product not found', 404));
        }
        res.status(200).json({
            success: true,
            product
        })

    })


    static updateProduct = catchAsyncErrors(async (req, res, next) => {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return next(new ErrorHandler('Product not found', 404));
        }

        let images = []
        if (typeof req.body.images === 'string') {
            images.push(req.body.images)
        } else {
            images = req.body.images
        }

        if (images !== undefined) {
            for (let i = 0; i < product.images.length; i++) {
                const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id)
            }

            let imagesLinks = [];
            for (let i = 0; i < images.length; i++) {
                const result = await cloudinary.v2.uploader.upload(images[i], {
                    folder: 'products'
                });

                imagesLinks.push({
                    public_id: result.public_id,
                    url: result.secure_url
                })
            }
            req.body.images = imagesLinks
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        res.status(200).json({
            success: true,
            product
        })

    })


    static deleteProduct = catchAsyncErrors(async (req, res, next) => {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return next(new ErrorHandler('Product not found', 404));
        }
        for (let i = 0; i < product.images.length; i++) {
            const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id)
        }

        await product.remove();
        res.status(200).json({
            success: true,
            message: 'Product is deleted.'
        })

    })

    static createProductReview = catchAsyncErrors(async (req, res, next) => {
        try {
            const {rating, comment, productId} = req.body;
            const review = {
                user: req.user._id,
                name: req.user.name,
                rating: Number(rating),
                comment
            }

            const product = await Product.findById(productId);
            const isReviewed = product.reviews.find(
                r => r.user.toString() === req.user._id.toString()
            )

            if (isReviewed) {
                product.reviews.forEach(review => {
                    if (review.user.toString() === req.user._id.toString()) {
                        review.comment = comment;
                        review.rating = rating;
                    }
                })

            } else {
                product.reviews.push(review);
                product.numOfReviews = product.reviews.length
            }

            product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length
            await product.save({validateBeforeSave: false});
            res.status(200).json({
                success: true
            })
        } catch (err) {
            next(err)
        }
    })

    static getProductReviews = catchAsyncErrors(async (req, res, next) => {
        const product = await Product.findById(req.query.id);
        res.status(200).json({
            success: true,
            reviews: product.reviews
        })
    })

    static deleteReview = catchAsyncErrors(async (req, res, next) => {
        const {productId, id} = req.query;
        const product = await Product.findById(productId);
        const reviews = product.reviews.filter(review => review._id.toString() !== id.toString());
        const numOfReviews = reviews.length;
        const ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
        await Product.findByIdAndUpdate(productId, {
            reviews,
            ratings,
            numOfReviews
        }, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        })

        res.status(200).json({
            success: true
        })
    })
}

module.exports = ProductController;


