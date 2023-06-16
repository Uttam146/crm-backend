
const {createUser, getAllUsers, getAllUsersv2,getUserById, updateUser,updateUsersv2,deleteUsersv2} = require("../Controllers/userController");
const {verifyToken, isAdmin, isAdminOrOwnUser} = require("../Middlewares/authJWT");

module.exports = function(app){

    app.post("/crm/api/v1/users",createUser);
    app.get("/crm/api/v1/users",[verifyToken],getAllUsers);
    app.get("/crm/api/v1/users/:id",[verifyToken,isAdminOrOwnUser],getUserById);
    app.put("/crm/api/v1/users/:id",[verifyToken, isAdmin],updateUser);

    app.get("/crm/api/v1/getusers/:usertype",getAllUsersv2);
    app.post("/crm/api/v1/updateusers",updateUsersv2);
    app.post("/crm/api/v1/deleteusers",deleteUsersv2);
    

}