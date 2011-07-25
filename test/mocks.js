var jdefer = require('jdefer');

module.exports.mockStore = {
	findByUsername : function(username)	{

		var d = jdefer();

		var users = {
			'falha404' : {
				username: 'falha404'
				, salt: 'salt'
				, auth: 'ae73218f48ae039148ba5a64072e90114d5039c4953bf43e7a4294794c6a222b'
			}
		};

		var user = users[username];

		user ? d.resolve(user) : d.reject(new Error('user not exists'));

		return d.promise();

	}
	
};
