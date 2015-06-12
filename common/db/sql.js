var sqlSet = {
	insertLogTime : {
		creater : '서시원',
		sql : "insert test_time values ( ':log_time' );"
	},
	insertLogData : {
		creater : '서시원',
		sql : "insert into page_log values ( ':log_time', :page_no, :test_no, :test_tp, :code, ':msg');"
	}
}

function get ( name ) {
	if ( sqlSet[ name ] )
		return sqlSet[ name ];
	else
		return false;
}

exports.sqlSet = sqlSet;
exports.get = get;