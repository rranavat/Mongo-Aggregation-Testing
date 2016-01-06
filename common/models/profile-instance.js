module.exports = function(data) {
	data.table=function(query,cb){
		console.log("in data.table " +JSON.stringify(query))
		var profileCollections=data.getDataSource().connector.collection('profileInstance');
		var profileId=query.profileId
		console.log(query)
		var aggregatePasser=[]
		var q={
			profileId:1,
			ops:[
				{
					opType:'group',
					groupQs:['center','category'],
					cols:[{label:'total',func:'count(obc)'},{label:'avg_age',func:'avg(age)'}],
					sort:null,
					limit:null,
					filters:null

				},
				// {
				// 	opType:'group',
				// 	groupQs:['gender'],
				// 	cols:[{label:'total',func:'avg(total)'}],
				// 	sort:null,
				// 	limit:null,
				// 	filters:null

				// },
			]
		}
var count=0;
			for(var i=0;i<q.ops.length;i++){
				if(q.ops[i].opType=='group'){
					aggregatePasser.push(myGroupBy(q.ops[i],count))
					count++
				}
				else if(q.ops[i].opType=='match')
					myMatch(q.ops[i])
				else if(q.ops[i].opType=='project')
					aggregatePasser.push(myProject(q.ops[i]))
			}
		console.log("aggregate passer " +JSON.stringify(aggregatePasser))
		profileCollections.aggregate(
			//{ '$group': { _id: '$data.gender', Total: { '$sum': 1 } } },
			aggregatePasser,
			function(err,data){
				if(err)
					cb(err)
				else{
					var output={}
					data.forEach(function(doc,index){
						if(output.hasOwnProperty(doc._id.center)){
							output[doc._id.center][doc._id.category]=doc.total
							console.log(index + " key: " + JSON.stringify(doc._id))
						}
						else{
							output[doc._id.center]={}
							output[doc._id.center][doc._id.category]=doc.total
							console.log(index + " key: " + JSON.stringify(doc._id)) 
						}
					})
					console.log(JSON.stringify(output))
					cb(null,data)
					//console.log(data);
				}
			}
		);
	};

	function myMatch(operation){
		console.log("in match")
	}
	function myProject(operation){
		console.log("in project")
	}
	function myGroupBy(operation,count){
		console.log("in group")
		var x={
			$group:{
				'_id':{}
			}
		}
		for(var i=0;i<operation.groupQs.length;i++){
			if(count==0)
				x.$group['_id'][operation.groupQs[i]]='$data.'+operation.groupQs[i]
			else
				x.$group['_id'][operation.groupQs[i]]='$_id.'+operation.groupQs[i]
		}
		if(i==0)
			x.$group['_id']=null

		for(var i=0;i<operation.cols.length;i++){
			var expressions=operation.cols[i].func.split('+')
			for(var j=0;j<expressions.length;j++){
				var individualFunction=expressions[j].split('(')
					if(individualFunction[0].trim()=='count'){
						x.$group[operation.cols[i].label]={$sum:1}
					}
					if(individualFunction[0].trim()=='sum'){
						var col=individualFunction[1].slice(0,- 1)
						x.$group[operation.cols[i].label]={$sum:(count==0?'$data.':'$')+col}
					}
					if(individualFunction[0].trim()=='avg'){
						var col=individualFunction[1].slice(0,- 1)
						x.$group[operation.cols[i].label]={$avg:(count==0?'$data.':'$')+col}
					}
					if(individualFunction[0].trim()=='max'){
						var col=individualFunction[1].slice(0,- 1)
						x.$group[operation.cols[i].label]={$max:(count==0?'$data.':'$')+col}
					}
			}
			
		}
		console.log(x)
		return x

	}

	data.remoteMethod(
		'table',
		{
			accepts: {arg: 'query', type: 'object'},
			returns: {arg: 'table', type: 'array'}
		}
	);


};
