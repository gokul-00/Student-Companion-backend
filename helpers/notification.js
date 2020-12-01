const admin = require("../setup/firebaseAdmin");
/*
message={
    title:"title of message",
    body:"body of message"
}(this is the message sample)
*/
const notification = (message, registrationToken) => {
    const payload = {
        notification: message,
    };
    const options = {
        priority: "high",
        timeToLive: 60 * 60 * 24, // expiration time if phone is dead or app is not there(set to one day)
    };
    try {
        admin.messaging().sendToDevice(registrationToken, payload, options);
    } catch (err) {
        console.log(err.message);
    }
};
module.exports = notification;
