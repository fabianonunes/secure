
var  crypto		= require('crypto')
, jdefer		= require('jdefer')
, hashlib		= require('hashlib')
, _				= require('underscore')
, qs			= require('querystring');

var secure = function(serverKey, model){
	this.limit = Date.now();
	this.H = hashlib.sha256;
	this.K = serverKey;
	this.model = model;
}

secure.prototype.login = function(username, password){

	var d = jdefer()
	, createSession = this.createSession.bind(this, password);

	this.model.findByUsername(username)
	.done(_.compose(d.resolve, createSession))
	.fail(d.reject);

	return d.promise();

};

secure.prototype.createSession = function(password, user){

	var c_auth = this.aN(user.salt, password);

	if(user.auth === this.H(c_auth)) {

		var cookie = {
			c: c_auth,
			u: user.username,
			x: Date.now() + 2*36e5
		};

		cookie.s = this.hmac(
			this.stringify(cookie),
			this.hmac(cookie.u + cookie.x, this.K)
		);

		return cookie;

	} else return new Error('invalid password');

};

secure.prototype.hmac = function(message, k){
	var hmac = crypto.createHmac('sha256', k);
	hmac.update(message);
	return hmac.digest('hex');
};

secure.prototype.authenticate = function(cookie){

	var d		= jdefer()
	, self		= this;

	if(cookie.x > this.limit){

		var key			= this.hmac([cookie.u, cookie.x].join(''), this.K)
		, signature		= cookie.s
		, message		= this.stringify(cookie);

		if(this.hmac(message, key) === signature){

			this.model.findByUsername(cookie.u)
			.done(function(user){
				if(self.H(cookie.c) === user.auth){
					d.resolve(user);
				} else {
					d.reject(new Error('cookie invalid'));
				}
			})
			.fail(d.reject.bind(d));

		} else d.reject(new Error('cookie corruted'));

	} else d.reject(new Error('cookie expired'));

	return d.promise();

};

secure.prototype.aN = function(salt, pass){
	for(i=0;i<1024;i++){ salt = this.H(salt+pass); }
	return salt;
};

secure.prototype.stringify = function(cookie){
	delete cookie.s;
	return Object.keys(cookie).sort().map(function(k){
		return k+"."+cookie[k];
	}).join('-');
};

secure.prototype.middleware = function(req, res, next){

	if(~["/login", "/user"].indexOf(req.url) && req.method == "POST"){
		return next();
	}

	// TODO: criar uma função que além de parsear,
	// tb valida oo parametros do cookie
	var cookie = qs.parse(req.cookies.v, '-', '.');

	this.authenticate(cookie)
	.done(next.bind(res, null))
	.fail(res.send.bind(res, null, 403));

}

module.exports = function(serverKey, model){
	return new secure(serverKey, model);
};