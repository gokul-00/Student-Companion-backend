# Amigos-backend
Amigo backend is the api for the project which helps students and make their work easier
This API is developed using Node-JS and mongoose with MongoDB as database
## Content
1. config
    i. .env.example
2. helpers
    i.  jwt.js
    ii. notification.js
    iii.otp.js
3. models
    i.  Community.js
    ii. Post.js
    iii.User.js
4. routers
    i.  auth.js
    ii. post.js
5. setup
    i.  firebaseAdmin.js
6. server.js

## Installation
This project requires node js and mongodb to run
Initially clone the repository
```bash
npm i
```
The above command installs all the required packages

## Usage
Create .env file with contents in .env.example file
Create a database manually using command line `use student_companion`

```bash
npm run dev
```
starts development server.

## License
[MIT](https://choosealicense.com/licenses/mit/)
