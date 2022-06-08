# a blogging website

- can have an account and write articles
- can search articles written by other people
- can follow people
- can like articles written by other people
- can chat with people

## build instructions

- clone the repo on your computer
- you should have npm, nodemon and nodejs installed on your computer
- navigate into the repo folder and run
  `npm i`
- create a file named .env inside the root folder of repo
- the app uses following env variables
  - **DBCONSTR** -> connection url to your mongodb database instance
  - **PORT** -> port to listen
  - **SESSION_SECRET** -> can be assigned to any unpredictable string
  - run `npm run watch`
