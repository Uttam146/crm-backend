
const authController = require("../Controllers/authController");
const verifySignUp = require("../Middlewares/verifySignup");
const { verifyToken } = require("../Middlewares/authJWT");

module.exports = (app) => {
    app.post("/crm/api/v1/auth/signup", [verifySignUp.verifySignUpRequest], authController.signUp);
    app.get("/crm/confirmation/:token", authController.confirmation);
    app.get("/crm/resetpassword/:token", authController.resetpassword);
    app.post("/crm/api/v1/auth/signin", authController.signIn);

    app.post("/crm/api/v1/auth/:token", authController.signInByToken);
    app.post("/crm/api/v1/auth/newsignup", [verifySignUp.verifySignUpRequest], authController.newsignUp);
    app.post("/crm/api/v1/forgotpassword", authController.forgotPassword);
    app.post("/crm/api/v1/resetpassword", [verifyToken], authController.changePassword);
}

