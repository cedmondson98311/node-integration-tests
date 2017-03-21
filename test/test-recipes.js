const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

// this lets us use *should* style syntax in our tests
// so we can do things like `(1 + 1).should.equal(2);`
// http://chaijs.com/api/bdd/
const should = chai.should();

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);


describe('Recipes', function() {
  
  before(function() {
    return runServer();
  });

   after(function() {
    return closeServer();
  });

   it('should show items from GET request', function() {
   	return chai.request(app)
   		.get('/recipes')
   		.then(function(res) {
   			res.should.have.status(200);
   			res.should.be.json;
   			res.body.should.be.a('array');
   			res.body.length.should.be.at.least(1);

   			const requiredKeys = ['id', 'name', 'ingredients'];
   			res.body.forEach(function(item) {
   				item.should.be.a('object');
   				item.should.include.keys(requiredKeys);
   			});
   		});
   });

   it('should add an item via POST request', function() {
   	const newItem = {name:'beer can chicken', ingredients:['beer','chicken']};
   	return chai.request(app)
   		.post('/recipes')
   		.send(newItem)
   		.then(function(res) {
   			res.should.have.status(201);
   			res.should.be.json;
   			res.body.should.be.a('object');
   			res.body.should.include.keys('id','name','ingredients');
   			res.body.id.should.not.be.null;
   		});
   });

   it('should update items via PUT request', function() {
   	const updateData = {
   		name:'boiled cabbage',
   		ingredients:['cabbage','water']
   	};

   	return chai.request(app)
   	//first make a GET request in order to have something to update
   	.get('/recipes')
   	.then(function(res) {
   		updateData.id = res.body[0].id;
   		return chai.request(app)
   			.put(`/recipes/${updateData.id}`)
   			.send(updateData);
   	})

   	.then(function(res) {
   		res.should.have.status(200);
   		res.should.be.json;
   		res.body.should.be.a('object');
   	});
   });

   it('should delete items via DELETE request', function() {
   	return chai.request(app)
   		.get('/recipes')
   		.then(function(res) {
   			return chai.request(app)
   				.delete(`/recipes/${res.body[0].id}`)
   		})
   		.then(function(res) {
   			res.should.have.status(204);
   		});
   });
});