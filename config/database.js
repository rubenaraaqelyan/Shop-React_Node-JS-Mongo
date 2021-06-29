const mongoose = require('mongoose');

const {DB_LOCAL_URI} = process.env;

const connectDataBase = () => {

    mongoose.connect(DB_LOCAL_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
        .then(con => {
            console.log(`MongoDB Database Connected with host: ${con.connection.host}`)
        })
}


module.exports = connectDataBase;
