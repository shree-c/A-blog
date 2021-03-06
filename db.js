const dotenv = require('dotenv');
dotenv.config();
// we are using the new mongodb syntax here
const { MongoClient } = require('mongodb');
const connectionString = global.process.env.DBCONSTR;
const client = new MongoClient(connectionString);



async function run() {
    try {
        //connecting and exporting the database client
        await client.connect();
        // only exporting client here
        module.exports = client;
        const app = require('./app');
        app.listen(global.process.env.PORT, () => {
            console.log(`connected to db\nlistining at port ${process.env.PORT}`);
        });
    } catch (err) {
        console.log(err);
    }
}

run();