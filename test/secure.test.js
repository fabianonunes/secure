var sinon = require('sinon')
, vows = require('vows')
, should = require('should')
, assert = require('assert')
, secure = require('secure');

var mockStore = {
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

var t = secure('secret', mockStore);

vows.describe('secure').addBatch({
	'A successful login' : {
		topic : function(){
			t.login('falha404', 'senha123').always(this.callback.bind(this, null));
		},
		'must return a valid cookie' : function(cookie){
			cookie.should.have.keys('c', 'u', 'x', 's');
		}
	}
}).export(module);

