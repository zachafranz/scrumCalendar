let { sequelize, OVERRIDE_CURRENT_TABLES, User, Event } = require('./../db/configurations.js');
// const User = require('./../db/userModel.js');
// const Event = require('./../db/eventModel.js');
const http = require('http');

// Cookie Parser stolen from stack Overflow
// https://stackoverflow.com/questions/3393854/get-and-set-a-single-cookie-with-node-js-http-server
function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}


const server = http.createServer((request, response) => {
  
  // ZF Comments: 
  // 1. is "request.headers" necessary anywhere or can we just do headers since we assigned that on the line below
  // 2. Fix user login so that error message is the same regardless of failure to prevent attacks
  // 3. Confused about the response to successfuly login

  // To Test Thoroughly, using postman:
  // 0. Clear cookies
  // 1. Add user (user is in db and we have a cookie)
  // 2. Clear cookies, and login as created user
  // 3. Create events x3
  // 4. Read Events
  // 5. Modify one event
  // 6. Delete one event
  // 7. Read events again
  // 8. Clear cookies
  // 9. Test bad username
  // 10. Test bad password

  const { method, url, headers } = request;
  const cookies = parseCookies(request);
   
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
  // 1) we need to launch the HTML file -> figure out how we can use .static or something,
  //    because we need to server all client side files
  // 2) get /event grab all events
  //    we will need to add a middleware to grab all events 

  if(method === 'GET' && url === '/event') {
  	console.log('In Get Event with headers', request.headers, 'also headers are', headers);
  	console.log('cookies are', cookies);

    Event.findAll({ where: { userId: cookies.userId }})
    .then((json) => {
      // console.log('got data', json);
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.write(JSON.stringify(json));
      response.end();
    })
    .catch((error) => {
      console.error('error in GET /event', error);
      response.writeHead(400, { 'Content-Type': 'text/plain' });
      response.write('Failed to get calender');
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

      console.log('In Post signup with body', parsedData);

      User.create({
        userName: parsedData.userName,
        userPass: parsedData.userPass
      })
      .then((savedObj) => {
        console.log('successfully saved a user', savedObj.dataValues);
        // let cookie = { 'userId': savedObj.dataValues.id };
        response.writeHead(200, { 'Set-Cookie': `userId=${savedObj.dataValues.id}`, 'Content-Type': 'text/plain' });
        response.write('The new user has been saved to the database');
        response.end();
      })
      .catch((error) => {
        console.error('error in POST /signup', error);
        response.writeHead(400);
        response.write('Could not save new user to the database');
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

      console.log('In Post login with body', parsedData);

      User.findOne({ where: { userName: parsedData.userName }})
      .then((result) => {
        console.log('the result from the database', result);
        if(result === null) {
          response.writeHead(400, {'Content-Type': 'text/plain'})
          response.write('username cannot be found in the database');
          response.end();
        } else if(parsedData.userPass !== result.dataValues.userPass) {
          response.writeHead(401, {'Content-Type': 'text/plain'})
          response.write('invalid password, please try again');
          response.end();
        } else {
          // Ex: Set-Cookie: name1=value1,name2=value2; Expires=Wed, 09 Jun 2021 10:18:14 GMT
          // let cookie = { 'userId': result.dataValues.id };
          response.writeHead(200, { 'Set-Cookie': `userId=${result.dataValues.id}`, 'Content-Type': 'text/plain' });
          // response.writeHead(301, { Location : '/placeholderUrl' })
          response.write('valid credentials, access granted');
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

      console.log('In Post event with body', parsedData, 'with parsed cookies', cookies);

      Event.create({
        eventDate: new Date(parsedData.eventDate),
        eventName: parsedData.eventName,
        eventDesc: parsedData.eventDesc,
        userId: cookies.userId 							// this should be a cookie i think
      })
      .then((savedObj) => {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.write('an event has been saved to the database');
        response.end();
      })
      .catch((error) => {
        console.error('error in POST /event', error);
        response.writeHead(400);
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

      console.log('In Put event with body', parsedData);

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
        response.write('event in database has been updated');
        response.end();
      })
      .catch((error) => {
        console.error('error in POST /event', error);
        response.writeHead(400);
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

      console.log('In Delete event with body', parsedData);

      Event.destroy({ where: { id: parsedData.eventId }})
      .then((numberDeleted) => {
        console.log(`successfully deleted ${numberDeleted} events`);
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.write('the event has been deleted'); 
        response.end();
      })
      .catch((error) => {
        console.error('error in DELETE /event', error);
        response.writeHead(400);
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