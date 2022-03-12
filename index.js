const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const redis = require('redis');
const {
    REDIS_URL,
    REDIS_PORT,
    SESSION_SECRET,
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_IP,
    MONGO_PORT,
} = require('./config/config');
const postRouter = require('./routes/postRoutes');
const userRouter = require('./routes/userRoutes');
const cors = require("cors");

const kickOff = async () => {
    let RedisStore = require('connect-redis')(session);
    let redisClient = await redis.createClient({
        host: REDIS_URL,
        port: REDIS_PORT,
    });

    const app = express();

    const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

    const connectWithRetry = () => {
        mongoose.connect(mongoURL)
            .then(() => console.log('Successfully connected to the database'))
            .catch((e) => {
                console.log(e);
                setTimeout(connectWithRetry, 5000)
            });
    };

    connectWithRetry();

    app.enable('trust proxy');
    app.use(cors());

    app.use(session({
            store: new RedisStore({
                client: redisClient,
            }),
            secret: SESSION_SECRET,
            cookie: {
                secure: false,
                resave: true,
                saveUninitialized: true,
                httpOnly: true,
                maxAge: 300000000
            }
        })
    );

    app.use(express.json());

    app.get("/", (req, res) => res.send("<h2>Oh hi Mark!!</h2>"));
    app.use("/api/v1/posts", postRouter);
    app.use("/api/v1/users", userRouter);

    const port = process.env.PORT || 3000;

    app.listen(port, () => console.log(`listening on port ${port}`));
}

(async () => {
    await kickOff();
})();
