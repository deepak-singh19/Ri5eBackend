const jwt = require('jsonwebtoken');
const Mentor = require("../database/models/mentor-model");

function MentorMiddleware(req, res, next) {
    // Tokens are generally passed in header of request
    // Due to security reasons.

    let jwtSecretKey = process.env.JWT_SECRET;

    try {
        const token = req.headers.token;

        const verified = jwt.verify(token, jwtSecretKey);
        console.log(verified);
        if (!verified) {
          // Access Denied
          console.log(error);
          return res.status(402).send(error); 
        } 
        const mentor= Mentor.findById(verified.email);
        if(!mentor){
            console.log(error);
            return res.status(402).send("Mentor does not exist. Please Sign Up"); 
        }
        req.email=verified.email;
        next();
    } catch (error) {
        // Access Denied
        console.log(error);
        return res.status(401).send(error);
    }
};
module.exports=MentorMiddleware;
