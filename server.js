const app = require('./app')
const connectDatabase = require('./config/database')
const cloudinary = require('cloudinary')


process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.stack}`);
    console.log('Shutting down due to uncaught exception');
    process.exit(1)
})
const {NODE_ENV, CLOUDINARY_CLOUD_NAME, PORT, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET} = process.env;

if (NODE_ENV !== 'PRODUCTION') require('dotenv').config({path: 'backend/config/config.env'})


connectDatabase();


cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
})

const server = app.listen(PORT, () => {
    console.log(`Server started on PORT: ${PORT} in ${NODE_ENV} mode.`)
})

process.on('unhandledRejection', err => {
    console.log(`ERROR: ${err.stack}`);
    console.log('Shutting down the server due to Unhandled Promise rejection');
    server.close(() => {
        process.exit(1)
    })
})
