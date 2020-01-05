import UsersService from './../services/users-service.js';
import ToolsService from './../services/tools-service.js';

const UsersController = function(app) {
  /*
  * Find one user by id
  */
  app.get('/users/:userId', async (req, res) => {
    try {
      const result = await UsersService.getUserById(req.params.userId);
      res.send(result);
    } catch (err) {
      res.send({
        error: String(err),
        status: 400
      });
    }
  });

  /*
  * Query for users
  */
  app.get('/users', async (req, res) => {
    try {
      let result;
      if (Object.keys(req.query).length) {
        result = await UsersService.findUsers(req.query);
      } else {
        result = await UsersService.getAllUsers();
      }
      res.send(result);
    } catch (err) {
      res.send({
        error: String(err),
        status: 400
      });
    }
  });

  app.get('/users/:userId/tools', async (req, res) => {
    try {
      const result = await ToolsService.getToolsByUserId(req.params.userId);
      res.send(result);
    } catch (err) {
      res.send({
        error: String(err),
        status: 400
      });
    }
  });

  /**
  * Add a tool to user
  */
  app.get('/users/:userId/add-tool/:toolId', async (req, res) => {
    try {
      const result = await UsersService.addToolIdToUser(req.params.userId, req.params.toolId);
      res.send(result);
    } catch (err) {
      res.send({
        error: String(err),
        status: 400
      });
    }
  });

  app.get('/users/:userId/remove-tool/:toolId', async (req, res) => {
    try {
      const result = await UsersService.removeToolIdFromUser(req.params.userId, req.params.toolId);
      res.send(result);
    } catch (err) {
      res.send({
        error: String(err),
        status: 400
      });
    }
  });

  /*
  * Create or update user
  */
  app.post('/users', async (req, res) => {
    const user = req.body.user;
    console.log(req.body)
    console.log(req.body.user), 'mooop'
    try {
      const result = await UsersService.registerUser(user);
      console.log(result);
      res.send(result);
    } catch (err) {
      res.send({
        error: String(err),
        status: 400
      });
    }
  });

  app.post('/users/login', async (req, res) => {
    try {
      let { token, user } = await UsersService.login(req.body.email, req.body.password);
      res.send({
        status: 200,
        message: 'Authentication successful.',
        token,
        user
      });
    } catch (err) {
      res.send({
        error: String(err),
        status: 403
      });
    }
  })
}

export default UsersController;
