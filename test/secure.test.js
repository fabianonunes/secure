
var vows	= require('vows')
, should	= require('should')
, secure	= require('secure')
, store		= require('./mocks')

var t = secure('secret', store.mockStore);

vows.describe('secure').addBatch({
	'A successful login' : {
		topic : function(){
			t.login('falha404', 'senha123').always(this.callback.bind(this, null));
		},
		'must return a valid cookie' : function(cookie){
			cookie.should.have.keys('c', 'u', 'x', 's');
		},
		'must enable subsequent logins' : {
			topic : function(cookie){
				t.authenticate(cookie).always(this.callback.bind(this, null));
			},
			'returning a User instance' : function(user){
				user.should.have.keys('username', 'salt', 'auth');
			}
		}
	},
	'A denied login' : {
		topic : function(){
			t.login('falha404', 'batman').always(this.callback.bind(this, null))
		},
		'must return a "invalid password" error instance' : function(error){
			error.should.be.an.instanceof(Error);
			error.message.should.equal('invalid password');
		}
	}
}).export(module);

