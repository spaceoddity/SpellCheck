var S = {
	defaults : {},
	
	storage_get : function(key) {
		var value = window.localStorage.getItem(key);
		return JSON.parse(value);
	},
	
	storage_set : function(key,value) {
		value = JSON.stringify(value);
		window.localStorage.setItem(key, value);
	},

	set_defaults : function(args){
		self = this;
		for (i in args) {
			this.defaults[i] = args[i];
			(function(i){
				Object.defineProperty(self, i, {
					configurable : true,
					get: function () {
						return self.storage_get(i);
					},
					set: function (value) {
						self.storage_set(i,value);
					},
				});
			})(i);
		}
		this.validate_storage();
	},
	
	validate_storage : function(){
		for (i in this.defaults) {
			if (typeof(window.localStorage[i]) === 'undefined' || window.localStorage[i] === null) {
			window.localStorage.clear();		
				for (i in this.defaults) {
					this.storage_set(i,this.defaults[i]);
				}
				return;
			}
		}
	},
};