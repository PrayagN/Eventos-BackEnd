const jwt = require("jsonwebtoken");

module.exports.adminProtect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res
        .status(401)
        .json({ auth: false, status: "failed", message: "You need a token" });
    } else {
      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
          res.status(401).json({
            auth: false,
            status: "failed",
            message: "Failed to authenticate",
          });
        } else if (
          decoded.exp * 1000 > Date.now() &&
          decoded.role === "admin"
        ) {
          req.adminId = decoded.id;
          next();
        }else{
          res.status(401).json({
            auth: false,
            status: "failed",
            message: "Failed to authenticate",
          });
        }
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ auth: false, status: "failed", message: error.message });
  }
};

module.exports.organizerProtect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res
        .status(401)
        .json({ auth: false, status: "failed", message: "You need a token" });
    } else {
      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
          res.status(401).json({
            auth: false,
            status: "failed",
            message: "Failed to authenticate",
          });
        } else if (decoded.exp * 1000 > Date.now() && decoded.role === "organizer") {
            req.organizer_Id = decoded.id;
            next();
          } else {
            res.status(401).json({
              auth: false,
              status: "failed",
              message: "Failed to authenticate",
            });
          }
        
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ auth: false, status: "failed", message: error.message });
  }
};

module.exports.userProtect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({
        auth: false,
        status: "failed",
        message: "You need your token",
      });
    } else {
      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
          res.status(401).json({
            auth: false,
            status: "failed",
            message: "Failed to authenticate",
          });
        } else if (decoded.exp * 1000 > Date.now() && decoded.role === "user") {
            req.decoded = decoded;
            next();
          } else {
            res.status(401).json({
              auth: false,
              status: "failed",
              message: "Failed to authenticate",
            });
          }
        
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ auth: false, status: "failed", message: error.message });
  }
};
