import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from './../middleware/config.js';
import DynamodbClient from '../client/dynamodb-client.js';
// import Utils from '../utils/utils';

const USERS_COLLECTION_NAME = 'users';

async function saveUserWithPassword(user) {
  bcrypt.genSalt(10, function(err, salt) {
    if (err) {
      throw new Error(`Problem creating password salt: ${String(err)}`);
    };

    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, async (err, hash) => {
      if (err) {
        throw new Error(`Problem creating password hash: ${String(err)}`);
      };

      // override the cleartext password with the hashed one
      user.password = hash;
      return await DynamodbClient.saveItem(USERS_COLLECTION_NAME, user);
    });
  });
}

class User {
  constructor(user = {}) {
    Object.keys(user).forEach((key) => {
      this[key] = user[key];
    });
  };

  static async saveNewUser(user) {
    var userToSave = user ? user : this;
    let result;
    if (userToSave.email && userToSave.password) {
      await saveUserWithPassword(user);
      result = userToSave;
    } else {
      throw new Error('Cannot save invalid user model.')
    }
    return result;
  };

  static async save(user) {
    var userToSave = user ? user : this;
    let result;
    if (userToSave.email) {
      await DynamodbClient.saveItem(USERS_COLLECTION_NAME, user);
      result = userToSave;
    } else {
      throw new Error('Cannot save invalid user model.')
    }
    return result;
  };

  static async verifyPassword(email, password) {
    return new Promise(async (resolve, reject) => {
      const users = await User.find({ email });
      const user = users[0];
      bcrypt.compare(password, user.password, function(err, isMatch) {
        if (err) {
          reject(`Error processing password: ${String(err)}`)
        }
        if (!isMatch) {
          reject('Incorrect password');
        }
        resolve(isMatch);
      });
    });
  };

  static async getAuthToken(email, id) {
    return jwt.sign({ email, id }, config.secret, { expiresIn: '24h' });
  }

  // TODO: This function fails. Fix
  static async getById(userId) {
    return DynamodbClient.getItemById(USERS_COLLECTION_NAME, userId);
  };

  static async getAll() {
    const users = await DynamodbClient.getAllItems(USERS_COLLECTION_NAME);
    return users;
  };

  static async find(query) {
    const users = await DynamodbClient.query(USERS_COLLECTION_NAME, query);
    return users;
  };
}

export default User;
