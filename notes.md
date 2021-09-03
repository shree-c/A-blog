## I am going to write notes related to the development of this app here.
### Table of contents
- [database](#database)
- [usermodelling](#user-model)
- [dotenv](#environment-variables)

#### database
1. we created a seperate database file and made at as a main file which starts first and imported express app object after connecting to database.
2. we export database object from db.js file.


#### user model


#### environment variables
1. we made a file called .env and we store key value data in it.
2. we can import those sotred key values in to whichever file we need using a package called dotenv.
3. we need to call dotenv.config