var AWS = require('aws-sdk');
const express = require('express');
const app = express();

AWS.config.update({region: 'us-east-1'});
const ENDPOINT = process.env.ENDPOINT || 'http://localhost:9324'
const PORT = process.env.PORT || 3000
var sqs = new AWS.SQS({ apiVersion: '2012-11-05', endpoint: ENDPOINT });

const queueUrl = `${ENDPOINT}/queue/default`


app.use('/', (req, res) => {
    var params = {
        MessageBody: JSON.stringify(req.query.dataProduct),
        QueueUrl: queueUrl
    }

    sqs.sendMessage(params, function (err, data) {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).json({
                success: true
            })
        }
    });
})

app.listen(PORT, () => console.log(`listening on ${PORT}`))