var model = require('../models/model');
var moment = require('moment');

/*-------------------------------------------------------*/

exports.projectedIncome = projectedIncome;
/*-------------------------------------------------------*/

function projectedIncome(req, res, next) {
    var userInfo = req.decoded._doc;
    var roleName = userInfo.roleName || '';

    var startDate = req.body.startDate;
    var query = model.bookings.find().where('bookingDate').gte(startDate);

    if (roleName.toLowerCase() != 'admin') {
        // Todo: restrict the query
        console.warn('// Todo: restrict the query')
    }

    query.exec().then(result => {
        return res.send(_groupByAndNetPrice(result, 'bookingDate'));
    })
}

function _groupByAndNetPrice(data = [], grpKey) {
    const grpByData = { 
        totalPackagePrice: 0, 
        totalCommisionEarned: 0, 
        totalCommissionReceived: 0, 
        record: {} 
    };

    data.forEach(e => {
        key = moment(e[grpKey], 'YYYY-MM-DD').format('MMM YYYY')
        if (!grpByData[key]) {
            grpByData.record[key] = {
                monthlyCommisionEarned: 0,
                monthlyPackagePrice: 0,
                monthlyCommissionReceived:0,
                data: []
            }
        }

        grpByData.record[key].data.push(e);
        grpByData.record[key].monthlyPackagePrice += +e.packagePrice || 0
        grpByData.record[key].monthlyCommisionEarned += +e.commisionEarned || 0
        grpByData.record[key].monthlyCommissionReceived += +e.commisionReceived || 0

        grpByData.totalPackagePrice += +e.packagePrice || 0
        grpByData.totalCommisionEarned += +e.commisionEarned || 0
        grpByData.totalCommissionReceived += +e.commisionReceived || 0
    });

    return grpByData;
}
