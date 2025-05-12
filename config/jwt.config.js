const jwt = require("jsonwebtoken");
const secret = "this is secret";

module.exports.secret = secret;

module.exports.authenticate = (req, res, next) => {
  const token =
    req.headers.authorization?.split(' ')[1] || req.cookies.jwt; // ✅ fallback to cookie

  if (!token) {
    return res.status(401).json({ verified: false, message: "No token provided" });
  }

  jwt.verify(token, secret, (err, payload) => {
    if (err) {
      return res.status(401).json({ verified: false, message: "Invalid token" });
    }
    req.user = payload;
    next();
  });
};