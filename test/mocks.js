module.exports.mockStore = {
	findByUsername : function()	{
		var user = {
			username: 'falha404'
			, salt: 'salt'
			, auth: 'ae73218f48ae039148ba5a64072e90114d5039c4953bf43e7a4294794c6a222b'
		};
		return {
			done : function(arg){
				arg(user);
				return this;
			},
			fail : function(arg) {
				arg(user);
				return this;
			}
		};
	}
};
