require('dotenv').config({ path: './config/.env' });
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const { jwtVerify } = require('./helpers/jwt');

app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

app.use(cors());
app.use('/posts', jwtVerify);
app.use('/community', jwtVerify);

app.use('/posts', require('./routers/post'));
app.use('/auth', require('./routers/auth'));
app.use('/community', require('./routers/community'));

const PORT = process.env.PORT;

mongoose
	.connect(process.env.CONNECTION_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	})
	.then(() =>
		app.listen(PORT, () =>
			console.log(`Server Running on Port: http://localhost:${PORT}`)
		)
	)
	.catch((error) => console.log(error));
