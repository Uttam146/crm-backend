
const authController = require("../Controllers/authController");
const verifySignUp = require("../Middlewares/verifySignup");

module.exports = (app)=>{
    app.post("/crm/api/v1/auth/signup" ,[verifySignUp.verifySignUpRequest],authController.signUp);
    app.get("/crm/confirmation/:token" ,authController.confirmation);
    app.post("/crm/api/v1/auth/signin",authController.signIn);
}