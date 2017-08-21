var redisClient = require('../modules/redisClient');
const TIMEOUT_IN_SECONDS = 3600;

module.exports = function(io) {
  // collaboration sessions
  var collaborations = [];
  // map from socketId to sessionId
  var socketIdToSessionId = [];

  var sessionPath = "/temp_sessions";

  io.on('connection', socket => {
    let sessionId = socket.handshake.query['sessionId'];

    socketIdToSessionId[socket.id] = sessionId;

    // add socket.id to corresponding collaboration session participants
    // if the sessionId already exists
    if (sessionId in collaborations) {
      collaborations[sessionId]['participants'].push(socket.id);
    } else {
      // if redis has the sessionId
      redisClient.get(sessionPath + '/' + sessionId, function(data) {
        if (data) {
          console.log("session terminiated previsouly; pulling back from Redis.");
          collaborations[sessionId] = {
            // list of change events
            'cachedChangeEvents': JSON.parse(data),
            'participants': []
          };
        } else {
          // if redis doesn't has the sessionId
          console.log("creating new session");
          collaborations[sessionId] = {
            'cachedChangeEvents': [],
            'participants': []
          };
        }
        collaborations[sessionId]['participants'].push(socket.id);
      });
    }


    // socket event listeners
    // handle 'change' event
    // receive a request from a client and transmit it to other clients which in the same session
    socket.on('change', delta => {
      console.log( "change " + socketIdToSessionId[socket.id] + " " + delta ) ;
      let sessionId = socketIdToSessionId[socket.id];

      // record changes
      if (sessionId in collaborations) {
        collaborations[sessionId]['cachedChangeEvents'].push(["change", delta, Date.now()]);
      }

      forwardEvents(socket.id, 'change', delta);
    });

    // handle 'cursorMove' events
    socket.on('cursorMove', cursor => {
      console.log( "cursorMove " + socketIdToSessionId[socket.id] + " " + cursor ) ;
      cursor = JSON.parse(cursor);
      cursor['socketId'] = socket.id;

      forwardEvents(socket.id, 'cursorMove', JSON.stringify(cursor));
    });

    socket.on('restoreBuffer', () => {
      let sessionId = socketIdToSessionId[socket.id];
      console.log('restoring buffer for session: ' + sessionId + ', socket: ' + socket.id);
      if (sessionId in collaborations) {
        let changeEvents = collaborations[sessionId]['cachedChangeEvents'];
        for (let i = 0; i < changeEvents.length; i++) {
          // emit: change, delta
          socket.emit(changeEvents[i][0], changeEvents[i][1]);
        }
      }
    });

    socket.on('disconnect', function() {
      let sessionId = socketIdToSessionId[socket.id];
      console.log('socket ' + socket.id + 'disconnected.');

      if (sessionId in collaborations) {
        let participants = collaborations[sessionId]['participants'];
        let index = participants.indexOf(socket.id);
        if (index >= 0) {
          // delete the one just exited
          participants.splice(index, 1);
          // if there is no one left
          if (participants.length == 0) {
            console.log("last participant left. Storing in Redis.");
            let key = sessionPath + "/" + sessionId;
            let value = JSON.stringify(collaborations[sessionId]['cachedChangeEvents']);
            redisClient.set(key, value, redisClient.redisPrint);
            redisClient.expire(key, TIMEOUT_IN_SECONDS);
            delete collaborations[sessionId];
          }
        }
      }
    });

    function forwardEvents(socketId, eventName, dataString) {
      let sessionId = socketIdToSessionId[socketId];

      if (sessionId in collaborations) {
        let participants = collaborations[sessionId]['participants'];
        for (let i = 0; i < participants.length; i++) {
          // if not itself
          if (socket.id != participants[i]) {
            io.to(participants[i]).emit(eventName, dataString);
          }
        }
      } else {
        console.log("WARNING: could not tie socket_id to any collaboration");
      }
    }
  });
}
