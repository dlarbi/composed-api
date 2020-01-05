import SelfService from './../services/self-service.js';
const SelfController = function (app) {
  /*
  * Find self user
  */
  app.get('/self/user', async (req, res) => {
    const authToken = '123'; // TODO: Get authToken from request header
    try {
      // TODO: Get by logged in user ID
      const result = await SelfService.getUser(authToken);
      res.send(result);
    } catch (err) {
      res.send({
        error: String(err),
        status: 400
      });
    }
  });
}

export default SelfController;
