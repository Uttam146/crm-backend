const { verifyToken, isAdmin } = require("../Middlewares/authJWT");
const { createTicket, geAllTickets, getTicketById, updateTicketById, fetchAllTicketStatus,deleteTicket } = require("../Controllers/ticketController")
const { validateTicketRequestBody, validateTicketRequestStatus } = require("../Middlewares/verifyTicketReqBody");





module.exports = (app) => {

    app.post("/crm/api/v1/tickets", createTicket);
    app.get("/crm/api/v1/tickets", [verifyToken], geAllTickets);
    app.get("/crm/api/v1/tickets/:id", [verifyToken], getTicketById);
    app.put("/crm/api/v1/updateticket",[verifyToken], updateTicketById);
    app.get("/crm/api/v1/allTicketStatus", [verifyToken], fetchAllTicketStatus);
    app.delete("/crm/api/v1/deleteTicket/:ticketid",[verifyToken], deleteTicket);
}