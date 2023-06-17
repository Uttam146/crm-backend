const User = require("../Models/user");
const { userTypes, userStatus } = require("../utils/constants");
const Ticket = require("../Models/ticket");
const History = require("../Models/history");


exports.geAllTickets = async (req, res) => {

    const userId = req.userId;
    const savedUser = await User.findOne({ userId: userId });
    const userType = savedUser.userTypes;

    var queryObject = {};

    if (userType == userTypes.customer) {
        queryObject = { requestor: userId };
    } 

    const tickets = await Ticket.find(queryObject);
    const ticketData = tickets.map(({ _id, title, description, requestor, ticketPriority, assignee, status, ...rest }) => {
        return { ticketId: _id, title, description, requestedBy: requestor, priority: ticketPriority, assignedTo: assignee, status }
    })
    return res.status(200).send(ticketData);
}

exports.getTicketById = async (req, res) => {
    const userId = req.userId;

    const savedUser = await User.findOne({ userId: userId });
    const userType = savedUser.userTypes;

    var queryObject = { id: req.params.id };
    const savedTicket = await Ticket.findOne(queryObject);

    if (userType == userTypes.admin) {
        return res.status(200).send(savedTicket);
    }

    if (savedTicket.requestor === userId || savedTicket.assignee === userId) {
        return res.status(200).send(savedTicket);
    }

    return res.status(403).send({ message: "The user has insufiicient permissions to access this ticket" });
}

// exports.updateTicketById = async (req, res) => {

//     const ticketId = req.params.id;
//     const userId = req.userId;

//     const savedTicket = await Ticket.findOne({ id: ticketId });
//     const savedUser = await Ticket.findOne({ userId: userId });

//     if (savedUser.userTypes == userTypes.admin || savedTicket.requestor == userId || savedTicket.assignee == userId) {

//         savedTicket.title = req.body.title ? req.body.title : savedTicket.title;
//         savedTicket.description = req.body.description ? req.body.description : savedTicket.description;
//         savedTicket.ticketPriority = req.body.ticketPriority ? req.body.ticketPriority : savedTicket.ticketPriority;
//         savedTicket.status = req.body.status ? req.body.status : savedTicket.status;
//         savedTicket.assignee = req.body.assignee ? req.body.assignee : savedTicket.assignee;

//         var updatedTicket = await savedTicket.save();

//         return res.status(200).send(updatedTicket);

//     }

//     return res.status(403).send({ message: "The user has insufiicient permissions to update this ticket" });
// }

exports.allTickets = async (req, res) => {

    // const userId = req.userId;

    // const savedUser = await User.findOne({userId:userId});
    // const userType = savedUser.userTypes;

    // var queryObject={};

    // if(userType==userTypes.customer){
    //     queryObject={requestor:userId};
    // }else if(userType==userTypes.engineer){
    //     queryObject={ $or:[{assignee:userId},{requestor:userId}]};
    // }

    const tickets = await Ticket.find();
    const ticketData = tickets.map(({ _id, title, description, requestor, ticketPriority, assignee, status, ...rest }) => {
        return { ticketId: _id, title, description, requestedBy: requestor, priority: ticketPriority, assignedTo: assignee, status }
    })

    return res.status(200).send(ticketData);
}

exports.createTicket = async (req, res) => {

    const ticketObj = {
        title: req.body.title,
        ticketPriority: req.body.ticketPriority,
        description: req.body.description,
        status: 'Proposed',
        requestor: req.body.userId,
        assignee: ''
    };

    try {
        const ticket = await Ticket.create(ticketObj);
        const history = await History.create({ remarks: ticket.title, userId: ticket.requestor, ticketId: ticket._id, status: 'proposed' });
        return res.status(201).send(ticket);
    } catch (e) {
        return res.status(500).send({ message: "Internal Server Error!" });
    }

}

exports.updateTicketById = async (req, res) => {
    const ticketObj = {
        status: req.body.status,
        assignee: req.body.userId,
    };
    const historyObj = {
        remarks: req.body.remark,
        userId: req.body.userId,
        ticketId: req.body.ticketId,
        status: req.body.status
    }
    try {
        const ticket = await Ticket.findOneAndUpdate({ _id: req.body.ticketId }, ticketObj);
        const history = await History.create(historyObj);
        return res.status(201).send(ticket);
    } catch (e) {
        return res.status(500).send({ message: "Internal Server Error!" });
    }
}

exports.fetchAllTicketStatus = async (req, res) => {
    const user = await User.findOne({ userId: req.userId });
    let data = [["Tickets", "Tickets Data"],
    ["Proposed", 0],
    ["Active", 0],
    ["Resolved", 0],
    ["Closed", 0]]
    let queryObject = {}
    if (user.userTypes == 'CUSTOMER') {
        queryObject = { requestor: user.userId };
    }
    const ticket = await Ticket.find(queryObject);
    for (let key in ticket) {
        if (ticket[key].status == 'Proposed') {
            data[1][1]++;
        } else if (ticket[key].status == 'ACTIVE') {
            data[2][1]++;
        } else if (ticket[key].status == 'RESOLVED') {
            data[3][1]++;
        } else {
            data[4][1]++;
        }
    }


    return res.status(200).send(data)
}

exports.deleteTicket = async(req,res)=>{
    const ticketId = req.params.ticketid;
    try{
        await Ticket.deleteOne({ _id: ticketId });
        return res.status(200).send({ message: "Deleted Successfully" });
    } catch (e) {
        return res.status(500).send({ message: "Internal Server Error!" });
    }

}