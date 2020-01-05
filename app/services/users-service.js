import User from './../model/user.js';

async function saveUser(user) {
  return User.save(user);
};

async function registerUser(user) {
  return User.saveNewUser(user);
};

async function getUserById(userId) {
  const users = await User.find({ id: userId });
  if (!users.length) {
    throw new Error('No user exists with this id');
  }
  return users[0];
};

async function getAllUsers() {
  return User.getAll();
};

async function findUsers(query) {
  return User.find(query);
};

async function addToolIdToUser(userId, toolId) {
  const users = await User.find({ id: userId });
  if (!users.length) {
    throw new Error('No user found with this id.  Can not add a tool.')
  }
  const user = users[0];
  let newToolIds = user.toolIds || [];
  if (newToolIds.indexOf(toolId) > -1) {
    throw new Error('This tool has already been added to the user\'s toolbox.');
  }
  newToolIds.push(toolId);
  user.toolIds = newToolIds;
  return User.save(user);
};

async function removeToolIdFromUser(userId, toolId) {
  const users = await User.find({ id: userId });
  if (!users.length) {
    throw new Error('No user found with this id.  Can not remove a tool.')
  }
  const user = users[0];
  if (!user.toolIds || !user.toolIds.length) {
    throw new Error('This user has no tools in their toolbox');
  }

  const toolIndex = user.toolIds.indexOf(toolId)
  if (toolIndex === -1) {
    throw new Error('This tool is not in this user\'s toolbox.');
  }
  user.toolIds.splice(toolIndex, 1);
  return User.save(user);
};

async function login(email, password) {
  if (!email || !password) {
    throw new Error('Missing email or password.')
  }
  const valid = await User.verifyPassword(email, password);
  if (valid) {
    const users = await User.find({ email: email });
    const user = users[0];
    const token = await User.getAuthToken(email, user.id);
    return {
      token,
      user
    }
  } else {
    throw new Error('Invalid email and password.')
  }
}

export default {
  saveUser,
  getUserById,
  getAllUsers,
  findUsers,
  login,
  registerUser,
  addToolIdToUser,
  removeToolIdFromUser
};
