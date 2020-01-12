import Tool from './../model/tool.js';
import UsersService from './users-service.js';

async function saveTool(tool) {
  const existingTool = await findTools({ name: tool.name });
  if (existingTool.length) {
    throw new Error('A tool with this name already exists.');
  }
  return Tool.save(tool);
};

async function getToolById(toolId) {
  const tools = await Tool.find({ id: toolId });
  if (!tools.length) {
    throw new Error('No tool exists with this id');
  }
  return tools[0];
};

async function getAllTools() {
  return Tool.getAll();
};

async function findTools(query) {
  return Tool.find(query);
};

async function getToolsByUserId(userId) {
  const user = await UsersService.getUserById(userId);
  const getToolPromises = user.toolIds.map(async toolId => {
    const tools = await Tool.find({ id: toolId });
    return tools[0];
  });
  const tools = await Promise.all(getToolPromises);
  return tools;
};

async function search(query) {
  if (query.fields && query.query) {
    return Tool.searchMultipleFields(query);
  } else {
    return Tool.search(query);
  }
}

export default {
  saveTool,
  getToolById,
  getAllTools,
  findTools,
  getToolsByUserId,
  search
};
