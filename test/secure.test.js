
var vows	= require('vows')
, should	= require('should')
, secure	= require('../')
, store		= require('./mocks')

var t = secure('secret', store.mockStore);

vows.describe('secure').addBatch({

	'A successful login' : {

		topic : function(){
			t.login('falha404', 'senha123').always(this.callback.bind(this, null));
		},

		'should return a valid cookie' : function(cookie){
			cookie.should.have.keys('c', 'u', 'x', 's');
		},

		'should enable subsequent logins' : {
			topic : function(cookie){
				t.authenticate(cookie).always(this.callback.bind(this, null));
			},
			'returning a User instance' : function(user){
				user.should.have.keys('username', 'salt', 'auth');
			}
		}

	},

	'A denied login' : {

		'with a invalid password' : {
			topic : function(){
				t.login('falha404', 'batman').always(this.callback.bind(this, null))
			},
			'should return a "invalid password" error' : respondWithError('invalid password')
		},

		'with a inexistent user' : {
			topic : function(){
				t.login('falha405', 'senha123').always(this.callback.bind(this, null))
			},
			'should return a "user not exists" error' : respondWithError('user not exists')
		}

	},
	
	'A valid cookie' : {
	
		topic : {
			c: '1a7fe2396821b6105e7792c4bfe3d86f48e0efce723d5c14e575f75a3a9a6709',
			u: 'falha404',
			x: 1311572321088,
			s: 'b01814d69f14b0a2e61f99570c532ff0ce955c2fd8d54c3a70093750443452eb'
		},
	
		'when expired' : {
			topic : function(cookie){
				t.limit = cookie.x+1;
				t.authenticate(cookie).always(this.callback.bind(this, null));
			},
			'should return a "cookie expired" error' : respondWithError('cookie expired')
		},
	
		'when modified' : {
			topic : function(cookie){
				cookie.x += 200;
				t.authenticate(cookie).always(this.callback.bind(this, null));
			},
			'should return a "cookie corruted" error'  : respondWithError('cookie corruted')
		}

	}

}).export(module);

function respondWithError(message){
	return function(error){
		error.should.be.an.instanceof(Error);
		error.message.should.equal(message);
	}
}