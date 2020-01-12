import ToolsService from './../services/tools-service.js';
const ToolsController = function(app) {
  /*
  * Find one tool by id
  */
  app.get('/tools/:toolId', async (req, res) => {
    try {
      const result = await ToolsService.getToolById(req.params.toolId);
      res.send(result);
    } catch (err) {
      res.send({
        error: String(err),
        status: 400
      });
    }
  });

  /*
  * Query for tools
  */
  app.get('/tools', async (req, res) => {
    try {
      let result;
      if (Object.keys(req.query).length) {
        result = await ToolsService.findTools(req.query);
      } else {
        result = await ToolsService.getAllTools();
      }
      res.send(result);
    } catch (err) {
      res.send({
        error: String(err),
        status: 400
      });
    }
  });

  /*
  * Create or update tool
  */
  app.post('/tools', async (req, res) => {
    const tool = req.body.tool;
    try {
      const result = await ToolsService.saveTool(tool);
      res.send(result);
    } catch (err) {
      res.send({
        error: String(err),
        status: 400
      });
    }
  });

  /*
  * Search Elasticsearch for tools
  */
  app.post('/tools/search', async (req, res) => {
    try {
      let result = {};
      if (Object.keys(req.body).length) {
        result = await ToolsService.search(req.body);
      }
      res.send(result);
    } catch (err) {
      res.send({
        error: String(err),
        status: 400
      });
    }
  });
}

export default ToolsController;
