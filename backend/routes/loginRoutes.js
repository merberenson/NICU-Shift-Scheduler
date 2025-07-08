const {addNewNurse, loginNurse} = require('../controllers/loginController')

const routes = (app) => {
    app.route('/nurses').post(addNewNurse);
    app.route('/login').post(loginNurse);
}

module.exports = routes;