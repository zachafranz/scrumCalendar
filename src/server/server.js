let { sequelize, OVERRIDE_CURRENT_TABLES, User, Event } = require('./../db/configurations.js');
// const User = require('./../db/userModel.js');
// const Event = require('./../db/eventModel.js');
const http = require('http');


const server = http.createServer((request, response) => {

  const { method, url, headers } = request;
   
    // ************** ERROR HANDLERS **************  
  request.on('error', (error) => {
    response.setHeader(400, { 'Content-Type': 'text/plain'});
    console.error('error durring request', error);
  });
  
  response.on('error', (error) => {
    response.setHeader(400, { 'Content-Type': 'text/plain'});
    console.error('error from response');
  });

  // ************** GET **************
  // 1) we need to launch the HTML file -> figure out how we can use .static or something, because we need to server all client side files
  // 2) get /event grab all events
  //    we will need to add a middleware to grab all events 

  if(method === 'GET' && url === '/event') {
    Event.findAll({ where: { userId: request.headers.userId }})
    .then((json) => {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.send(json);
      response.end();
    })
    .catch((error) => {
      console.error('error in GET /event', error);
      response.status(400);
      response.end();  
    })
  }

  // ************** POST **************
  if(method === 'POST' && url === '/signup') {
    let body = [];
    let parsedData = null;
    request.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      parsedData = JSON.parse(body);
      User.create({
        username: parsedData.username,
        userPassword: parsedData.userPassword
      })
      .then((savedObj) => {
        console.log('successfully saved a user', savedObj.dataValues);
        let cookie = { 'userId': savedObj.dataValues.id };
        response.writeHead(200, { 'Set-Cookie': cookie, 'Content-Type': 'text/plain' });
        response.send('the new user has been saved to the database');
        response.end();
      })
      .catch((error) => {
        console.error('error in POST /signup', error);
        response.status(400);
        response.end();  
      })
    })
  }

  if(method === 'POST' && url === '/login') {
    let body = [];
    let parsedData = null;
    request.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      parsedData = JSON.parse(body);
      User.findOne({ where: { username: parsedData.username }})
      .then((result) => {
        console.log('the result from the database', result);
        if(result === null) {
          response.writeHead(400, {'Content-Type': 'text/plain'})
          response.send('username cannot be found in the database');
          ressponse.end();
        } else if(parsedData.userPassword !== result.dataValues.userPassword) {
          response.writeHead(401, {'Content-Type': 'text/plain'})
          response.send('invalid password, please try again');
          response.end();
        } else {
          // Ex: Set-Cookie: name1=value1,name2=value2; Expires=Wed, 09 Jun 2021 10:18:14 GMT
          let cookie = { 'userId': result.dataValues.id };
          response.writeHead(200, { 'Set-Cookie': cookie, 'Content-Type': 'text/plain' }); // formatting may be off
          response.writeHead(301, { Location : '/placeholderUrl' })
          response.send('valid credentials, access granted');
          response.end();
        }
      })
      .catch((error) => {
         console.error('error in POST /login', error);
         response.writeHead(400, { 'Content-Type': 'text/plain '});
         response.end();  
      })
    })
  }

  // POST: EVENT CREATION -------------- 
  if(method === 'POST' && url === '/event') {
    let body = [];
    let parsedData = null;
    request.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      parsedData = JSON.parse(body);
      Event.create({
        eventDate: new Date(parsedData.eventDate),
        eventName: parsedData.eventName,
        eventDesc: parsedData.eventDesc,
        userId: parsedData.userId 
      })
      .then((savedObj) => {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.send('an event has been saved to the database');
        response.end();
      })
      .catch((error) => {
        console.error('error in POST /event', error);
        response.status(400);
        response.end();
      });
    })
  }

  // ************** PUT **************

  if(method === 'PUT' && url === '/event') {
    let body = [];
    let parsedData = null;
    request.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      parsedData = JSON.parse(body);
      let updatedDataRequest = {
        eventDate: new Date(parsedData.eventDate),
        eventName: parsedData.eventName,
        eventDesc: parsedData.eventDesc
      };
      let existingDataLocation = {
        where: { id: parsedData.eventId },
        returning: true
      };
      Event.update(updatedDataRequest, existingDataLocation)
      .then((updatedObject) => { 
        console.log('successfuly updated/saved an event',updatedObject);
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.send('event in database has been updated');
        response.end();
      })
      .catch((error) => {
        console.error('error in POST /event', error);
        response.status(400);
        response.end();
      })
    })
  }

  // ************** DELETE **************
  if(method === 'DELETE' && url === '/event') {
    let body = [];
    let parsedData = null;
    request.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      parsedData = JSON.parse(body);
      Event.destroy({ where: { id: parsedData.eventId }})
      .then((numberDeleted) => {
        console.log(`successfully deleted ${numberDeleted} events`);
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.send('the event has been deleted'); 
        response.end();
      })
      .catch((error) => {
        console.error('error in DELETE /event', error);
        response.status(400);
        response.end();
      });
    })
  }
});

server.listen(3000, (error) => {
  if(error) console.error('error in connection to port 3000');
  else {
    console.log('Listening on port 3000');
  }   
});