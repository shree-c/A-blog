# a blogging website:computer

![front-page](/public/assets/frontpage.png)

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
- Create a file called .env inside the root and put these env variables
  - **DBCONSTR** -> connection url to your mongodb database instance
  - **PORT** -> port to listen
  - **SESSION_SECRET** -> can be assigned to any unpredictable string
  - **APP_NAME** -> any string for app name
  - run `npm run start`
