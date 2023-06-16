const History = require("../Models/history");


exports.getHistory = async (req, res) => {
    const ticketId = req.body.ticketId;
    try {
        const history = await History.find({ticketId}).sort('createdAt');
        res.status(201).send(history);

    }
    catch (err) {
        res.status(500).send(err);
    }
}

