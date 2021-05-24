var mongoose = require('mongoose');

var sensorSchema = new mongoose.Schema({
    nhietdo: {
        type: String
    },
    doamdat:
    {
        type: String
    },
    tinhtrangdat:
    {
        type: String
    },
    apsuattrong: {
        type: String
    },
    docaomucnuoc: {
        type: String
    }
}, {timestamps: true});

const dbsensor = mongoose.model('dbsensor', sensorSchema);
module.exports = dbsensor;
