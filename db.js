const dotenv = require('dotenv');
dotenv.config();
// we are using the new mongodb syntax here
const { MongoClient } = require('mongodb');
const connectionString = global.process.env.DBCONSTR;
const client = new MongoClient(connectionString);

const PORT = process.env.PORT || 90;

async function run() {
    try {
        //connecting and exporting the database client
        await client.connect();
        // only exporting client here
        module.exports = client;
        const app = require('./app');
        app.listen(global.process.env.PORT, () => {
            console.log(`listining at ${PORT}`);
        });
    } catch (err) {
        console.log(err);
    }
}

run();
