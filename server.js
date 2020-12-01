require("dotenv").config({ path: "./config/.env" });
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use(cors());

app.use("/posts", require("./router/post"));

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
