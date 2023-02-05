	import {
		get,
		set,
		del
	  } from 'https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm';

	  const db = {

		myKey: "songs",

		readDB:function(){
					return get(this.myKey);
				},

		writeDB:function(data){
					return set(this.myKey, data);
				},

		updateDB: async function(sample){
					let tempData = await  this.readDB();
					// Prüfung: ist etwas in der db
					if(!tempData){
						// wenn leer, dann geben wir ein leeres Array zurück
						tempData = [];
					};
			
					 tempData.push(sample);
					this.writeDB(tempData);
				},

		deleteDB:function(){
					del(this.myKey);
				}
	};


	export { 
		db
	};
	
	
      