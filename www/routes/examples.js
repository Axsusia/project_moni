var express = require('express');
var router = express.Router();
var DB = require('../../common/db/connection.js');
var Last = require('../../common/utils/last.js').Last;

/* GET home page. */
router.get('/db/select', function(req, res, next) {

	var dataSet = {};

	var actionTrigger = new Last(0, 2, function() {
		console.log( 'multi db call success...' );
		res.render('ex/select', dataSet);	
	});

	DB.work({
		action : 'select',
		sqlName : 'testSelect',
		callback : function ( data ) {
			dataSet['db1'] = data.rows;
			actionTrigger.trigger();
		}
	})
	DB.work({
		action : 'select',
		sqlName : 'testSelect',
		callback : function ( data ) {
			dataSet['db2'] = data.rows;
			actionTrigger.trigger();
		}
	})
});

module.exports = router;
