const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;

const MONGO_HOST = process.env.MONGO_HOST || 'localhost'
const PORT = process.env.PORT || 3000
const url = `mongodb://admin:password@${MONGO_HOST}:27017`;

const dbName = 'app';

const client = new MongoClient(url);

client.connect(function (err, client) {
    if (err) {
        console.log(err)
    }
    console.log("Connected correctly to server");
    const db = client.db(dbName);

    app.get('/', (req, res) => {
        db.collection('data-products').find().toArray((err, data) => {
            if (err) {
                res.status(500).send(err)
            } else {
                res.status(200).json(data)
            }
        });
    })

    app.listen(PORT, () => console.log(`listening on ${PORT}`))
});
