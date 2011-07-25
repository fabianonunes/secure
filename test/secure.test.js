
var vows	= require('vows')
, should	= require('should')
, secure	= require('../')
, store		= require('./mocks')

var t = secure('secret', store.mockStore);

vows.describe('secure').addBatch({

	'A successful login' : {

		topic : function(){
			t.login('falha404', 'senha123')
			.always(this.callback.bind(this, null));
		},

		'should return a valid cookie' : function(cookie){
			cookie.should.have.keys('c', 'u', 'x', 's');
		},

		'should enable subsequent logins' : {

			topic : function(cookie){
				t.authenticate(cookie)
				.always(this.callback.bind(this, null));
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

		'should return a "invalid password" error instance' : function(error){
			error.should.be.an.instanceof(Error);
			error.message.should.equal('invalid password');
		}
		
	},

	'A invalid cookie' : {
		
		topic : {
			c: '1a7fe2396821b6105e7792c4bfe3d86f48e0efce723d5c14e575f75a3a9a6709',
			u: 'falha404',
			x: 1311572321088,
			s: 'b01814d69f14b0a2e61f99570c532ff0ce955c2fd8d54c3a70093750443452eb'
		},

		'with a modified attribute' : {
			
			topic : function(cookie){
				cookie.x += 200;
				t.authenticate(cookie)
				.always(this.callback.bind(this, null));
			},

			'should return a "cookie corruted" error instance'  : function(error){
				error.should.be.an.instanceof(Error);
				error.message.should.equal('cookie corruted');
			}

		},

  	

	}

}).export(module);

