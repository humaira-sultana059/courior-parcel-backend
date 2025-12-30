// backend/api/index.js
const app = require("../server"); // or whatever your main file is called

module.exports = (req, res) => {
  return app(req, res);
};
