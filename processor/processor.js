var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const MongoClient = require('mongodb').MongoClient;
const ENDPOINT = process.env.ENDPOINT || 'http://localhost:9324'
const queueUrl = `${ENDPOINT}/queue/default`
var sqs = new AWS.SQS({ apiVersion: '2012-11-05', endpoint: ENDPOINT });

const MONGO_HOST = process.env.MONGO_HOST || 'localhost'
const url = `mongodb://admin:password@${MONGO_HOST}:27017`;
const dbName = 'app';
const client = new MongoClient(url);

const params = {
    QueueUrl: queueUrl,
    VisibilityTimeout: 20,
    WaitTimeSeconds: 0
}

function poll() {
    return new Promise((res, rej) => {
        sqs.receiveMessage(params, (err, data) => {
            if (err) {
                console.log("Received error", err);
                rej(err)
            } else {
                res(data.Messages)
            }
        })
    })
}

function wait() {
    return new Promise(res => setTimeout(res, 1000))
}

client.connect(function(err, client) {
    if (err) {
        console.log(err)
    }
    async function main() {
        const db = client.db(dbName);
        while (true) {
            console.log('polling');
            const messages = await poll()
            if (!messages) {
                await wait()
                continue;
            }

            await Promise.all(messages.map(async (message) => {
                const item = JSON.parse(JSON.parse(message.Body))
                console.log(item)
                db.collection('data-products').insertOne(item, function (err, r) {
                    if (err) {
                        console.err(err)
                    } else {
                        console.log("inserted item", item)
                    }
                })

                sqs.deleteMessage({
                    QueueUrl: queueUrl,
                    ReceiptHandle: message.ReceiptHandle
                }, (err, data) => {
                    if (err) {
                        console.log("Delete Error", err);
                    } else {
                        console.log("Message Deleted", data);
                    }
                })


            }))
        }
    }

    main()
});