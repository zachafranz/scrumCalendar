let { sequelize, OVERRIDE_CURRENT_TABLES } = require('./../db/configurations.js');
const User = require('./../db/userModel.js');
const Event = require('./../db/eventModel.js');
const http = require('http');


const server = http.createServer((request, response) => {

  const { method, url, headers } = request;
   
  
    // ************** ERROR HANDLERS **************  
  request.on('error', (error) => {
    response.status(400);
    console.error('error durring request', error);
  });
  
  response.on('error', (error) => {
    response.status(400);
    console.error('error from response');
  });

  // ************** GET **************
  // 1) we need to launch the HTML file -> figure out how we can use .static or something, because we need to server all client side files
  // 2) get /event grab all events
  //    we will need to add a middleware to grab all events 

  if(method === 'GET' && url === '/event') {
    console.log('request within get event', request)
    Event.findAll({
      where: { userId: request.headers.useruserid }
    })
    .then((json) => {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.send(json);
    })
    .catch((error) => {
      console.error('error in GET /event', error);
      response.status(400);
      res.end();  
    })
  }

  // ************** POST **************

  // POST: USER AUTHENTICATION -------------- 
  if(method === 'POST' && url === '/signup') {
    // create user
    User.create({
      username: request.body.username,
      userPassword: request.body.userPassword
    })
    // user creation successful, set cookie
    .then((savedObj) => {
      console.log('successfully saved a user', savedObj.dataValues);
      let cookie = { 'userId': result.dataValues.id };
      response.writeHead(200, { 'Set-Cookie': cookie, 'Content-Type': 'text/plain' });
      response.end('the new user has been saved to the database');
    })
    // error, throw error
    .catch((error) => {
      console.error('error in POST /signup', error);
      response.status(400);
      res.end();  
    })
  }

  if(method === 'POST' && url === '/login') {
    // NEED TO COMPLETE
    let body = [];
    request.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      console.log('entered POST /login, here is the event model', Event.event);
      body = Buffer.concat(body).toString();
      User.findOne({ where: { username: body.username }})
      .then((result) => {
        if(result === null) {
          response.writeHead(400, {'Content-Type': 'text/plain'})
          response.end('username cannot be found in the database');
        } else if(request.body.userPassword !== result.dataValues.userPassword) {
          response.writeHead(401, {'Content-Type': 'text/plain'})
          response.end('invalid password, please try again');
        } else {
          // Ex: Set-Cookie: name1=value1,name2=value2; Expires=Wed, 09 Jun 2021 10:18:14 GMT
          let cookie = { 'userId': result.dataValues.id };
          response.writeHead(200, { 'Set-Cookie': cookie, 'Content-Type': 'text/plain' }); // formatting may be off
          response.writeHead(301, { Location : '/placeholderUrl' })
          response.end('valid credentials, access granted');
        }
      })
      .catch((error) => {
         console.error('error in POST /login', error);
         response.status(400);
         res.end();  
      })
    })
  }

  // POST: EVENT CREATION -------------- 
  if(method === 'POST' && url === '/event') {
    // NEED TO COMPLETE WITH BODY PARSER
    // NEED TO COMPLETE WITH COOKIE PARSER
    console.log('in post event with', request.body, 'and', request.cookies)
    Event.create({
      eventDate: new Date(request.body.eventDate),
      eventName: request.body.eventName,
      eventDesc: request.body.eventDesc,
      userId: request.cookies.userId 
    })
    .then((savedObj) => {
      console.log('successfully saved an event, savedObj');
      response.writeHead(200, { 'Content-Type': 'text/plain' });
      response.end('an event has been saved to the database');
    })
    .catch((error) => {
      console.error('error in POST /event', error);
      response.status(400);
      response.end();
    });
  }

  // ************** PUT **************

  if(method === 'PUT' && url === '/event') {
     // NEED TO COMPLETE WITH BODY PARSER 
    let updatedDataRequest = {
      eventDate: new Date(request.body.eventDate),
      eventName: request.body.eventName,
      eventDesc: request.body.eventDesc
    };
    let existingDataLocation = {
      where: { id: request.body.eventId },
      returning: true
    };
    Event.update(updatedDataRequest, existingDataLocation)
    .then((updatedObject) => { 
      console.log('successfuly updated/saved an event',updatedObject);
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end('event in database has been updated');
    })
    .catch((error) => {
      console.error('error in POST /event', error);
      response.status(400);
      response.end();
    })
  }

  // ************** DELETE **************
  if(method === 'DELETE' && url === '/event') {
    // NEED TO COMPLETE WITH BODY PARSER 
    Event.destroy({ where: { id: request.body.eventId }})
    .then((numberDeleted) => {
      console.log(`successfully deleted ${numberDeleted} events`);
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end('the event has been deleted'); 
    })
    .catch((error) => {
      console.error('error in DELETE /event', error);
      response.status(400);
      response.end();
    });
  }
});


server.listen(3000, (error) => {
  if(error) console.error('error in connection to port 3000');
  else {
    console.log('Listening on port 3000');
  }   
});