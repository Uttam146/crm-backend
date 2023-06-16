const historyController = require("../Controllers/historyController");

module.exports = (app) => {
    app.post("/crm/api/v1/history" ,historyController.getHistory);
}