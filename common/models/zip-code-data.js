module.exports = function(data) {
	data.table=function(query,cb){
		console.log("in data.table " +JSON.stringify(query))
		var zipCollections=data.getDataSource().connector.collection('zipCodeData');
		console.log(query)
		zipCollections.aggregate(
			[
				{$match:{state:"IL"}},
				{$group:{_id:"$state",totalpop:{$sum:"$pop"}}}
			],
			function(err,data){
				if(err)
					cb(err)
				else{
					cb(null,data)
					//console.log(data);
				}
			}
		);
	};

	data.remoteMethod(
		'table',
		{
			accepts: {arg: 'query', type: 'object'},
			returns: {arg: 'table', type: 'array'}
		}
	);


};
