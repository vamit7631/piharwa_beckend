
const checkoutService = require('../services/checkout-service')

module.exports.createOrderDetails = async (req, res) => {
    try {
        const result = await checkoutService.createOrderDetails(req.body);
        res.json({"status": true , "message": result.message, "data": result.data });
    } catch (e) {
        res.json({"status": false , "message": e.errors});
    }
}

module.exports.paymentVerify = async (req, res) => {
    try {
        const result = await checkoutService.paymentVerify(req.body);
        res.json({"status": true , "message": result.message, "data": result.data });
    } catch (e) {
        res.json({"status": false , "message": e.errors});
    }
}