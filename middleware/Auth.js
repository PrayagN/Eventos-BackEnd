const jwt = require('jsonwebtoken');

module.exports.adminProtect = async (req, res, next) => {
  try {
    console.log('this');
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ auth: false, status: 'failed', message: 'You need a token' });
    } else {
      jwt.verify(token, 'secretCodeforAdmin', (err, decoded) => {
        if (err) {
          console.log(err);
          res.status(401).json({ auth: false, status: 'failed', message: 'Failed to authenticate' });
        } else {
          console.log('sdf');
          req.adminId = decoded.id;
          next();
        }
      });
    }
  } catch (error) {
    res.status(500).json({ auth: false, status: 'failed', message: error.message });
  }
};
