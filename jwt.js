const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, resp, next) => {
    //check if token exist 
    const authorization = req.headers.authorization;
    console.log(authorization, "authorization");

    if (!authorization) {
        return resp.status(404).json({ error: "Token Invalid" })
    }

    //extract token from header ;
    const token = req.headers.authorization.split(' ')[1];

    if (!token)
        return resp.status(401).json({ error: "Unauthorized" });
    try {

        const decoded = jwt.verify(token, "1234");
        req.user = decoded; //created and return user informatiom
        next();

    } catch (error) {
        console.log(error);
        resp.status(401).json({ error: 'Invalid token' });
    }

}
const genrateToken = (userData) => {
    return jwt.sign(userData, "1234", { expiresIn: 3000 }); //jwt.sign()functiom take userdata and secret key as a input for genrating a jwt token

}
module.exports = { jwtAuthMiddleware, genrateToken };

