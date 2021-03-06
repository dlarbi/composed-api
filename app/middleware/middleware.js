import jwt from 'jsonwebtoken';
import config from './config.js';

let checkToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
  if (token) {
    if (token.startsWith('Bearer ')) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.json({
          status: 401,
          error: 'Token is not valid.'
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.json({
      status: 401,
      error: 'Auth token is not supplied.'
    });
  }
};

export default {
  checkToken
};
