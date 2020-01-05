import UsersService from './users-service.js';

/*
* Get the currently logged in user
*/
async function getUser(authToken) {
  // TODO: get userId from authToken
  const userId = authToken; // Decode this
  return UsersService.getUserById(userId);
};

async function updateUser(authToken, user) {
  // get userId from authToken
  return UsersService.saveUser(user);
};

export default {
  getUser,
  updateUser
};
