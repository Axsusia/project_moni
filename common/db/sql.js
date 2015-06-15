var sqlSet = {

	insertLogTime : {
		creater : '서시원',
		sql : "insert test_time values ( ':log_time' );"
	},

	insertLogData : {
		creater : '서시원',
		sql : "insert into page_log values ( ':log_time', :page_no, :test_no, :test_tp, :code, ':msg');"
	},

	insertLogSummary : {
		creater : '서시원',
		sql : "\
			insert into test_log_summary \
			select\
				log_time,\
			    page_no,\
			    max(code_cnt1) + max(code_cnt2) as total_cnt,\
			    max(code_cnt1) as success,\
			    max(code_cnt2) as error\
			from\
				(\
				select \
					log_time,\
					page_no,\
					case when code = 200 then 200 else 0 end code1,\
					case when code = 200 then count(code) else 0 end code_cnt1,\
					case when code = 400 then 400 else 0 end code2,\
					case when code = 400 then count(code) else 0 end code_cnt2,\
					test_no\
				from page_log \
				where log_time = (select max(log_time) from test_time)\
				group by \
					log_time, page_no, code\
				) a\
			group by\
				log_time, page_no ;\
		"
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