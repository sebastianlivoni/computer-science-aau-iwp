// This is server-side JavaScript, intended to be run with NodeJS.
// It implements a very simple, completely anonymous chat room.
// POST new messages to /chat, or GET a text/event-stream of messages
// from the same URL. Making a GET request to / returns a simple HTML file
// that contains the client-side chat UI.
const http = require("http");
const fs = require("fs");
const url = require("url");
// The HTML file for the chat client. Used below.
const clientHTML = fs.readFileSync("./PublicResources/index.html");
// An array of ServerResponse objects that we're going to send events to
let clients = [];
// Create a new server, and listen on port 3000.
// Connect to http://localhost:3000/ to use it.
let server = new http.Server();
server.listen(3000, "localhost", () => {
  console.log("To connect to the chat, go to http://localhost:3000/");
});

const questions = [
  {
    "question": "4 + 4 ?",
    "answer": "8"
  },
  {
    "question": "hvem er jeg?",
    "answer": "seb"
  },
  {
    "question": "er du god til programming",
    "answer": "ja"
  },
  {
    "question": "er apple det bedste?",
    "answer": "nah"
  }
]

let currentQuestion = randomQuestion()

// When the server gets a new request, run this function
server.on("request", (request, response) => {
    // Parse the requested URL
    let pathname = url.parse(request.url).pathname;
    // If the request was for "/", send the client-side chat UI.
    if (pathname === "/") { // A request for the chat UI
        response.writeHead(200, {
            "Content-Type": "text/html"
        }).end(clientHTML);
    }
    // Otherwise send a 404 error for any path other than "/chat" or for
    // any method other than "GET" and "POST"
    else if (pathname !== "/chat" ||
        (request.method !== "GET" && request.method !== "POST")) {
          response.writeHead(404).end();
    }
    // If the /chat request was a GET, then a client is connecting.
    else if (request.method === "GET") {
        acceptNewClient(request, response);
    }
    // Otherwise the /chat request is a POST of a new message
    else {
        
        doStuff(request, response)
          
    }
});

async function doStuff(request, response) {
    request.setEncoding("utf8");

    let body = "";
    for await (let chunk of request) {
        body += chunk;
    }
    
    const [user, answer] = body.split(": ")

    if (answer === currentQuestion.answer) {
      clients.forEach(client => client.write(`event: chat\ndata: ${user} got it right\ncolor: red\n\n`));
      return
    }
    else {
      // do stuff
    }

    // First, read the body of the request to get the user's message
  // Once we've read the body send an empty response and close the connection
  response.writeHead(200).end();//
  // Format the message in text/event-stream format, prefixing each
  // line with "data: "
  let message = "data: " + body.replace("\n", "\ndata: ");
  // Give the message data a prefix that defines it as a "chat" event
  // and give it a double newline suffix that marks the end of the event.
  let event = `event: chat\n${message}\n\n`;
  // Now send this event to all listening clients
  clients.forEach(client => client.write(event));
      
}
// This handles GET requests for the /chat endpoint which are generated when
// the client creates a new EventSource object (or when the EventSource
// reconnects automatically).
function acceptNewClient(request, response) {
    // Remember the response object so we can send future messages to it
    clients.push(response);
    // If the client closes the connection, remove the corresponding
    // response object from the array of active clients
    request.connection.on("end", () => {
        clients.splice(clients.indexOf(response), 1);
        response.end();
    });
    // Set headers and send an initial chat event to just this one client
    response.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Connection": "keep-alive",
        "Cache-Control": "no-cache"
    });
    response.write("event: chat\ndata: Connected\n\n");
    // Note that we intentionally do not call response.end() here.
    // Keeping the connection open is what makes Server-Sent Events work.
}

async function broadcastNewMessage(request, response) {
    // First, read the body of the request to get the user's message

    // Once we've read the body send an empty response and close the connection
    response.writeHead(200).end();//
    // Format the message in text/event-stream format, prefixing each
    // line with "data: "
    let message = "data: " + body.replace("\n", "\ndata: ");
    // Give the message data a prefix that defines it as a "chat" event
    // and give it a double newline suffix that marks the end of the event.
    let event = `event: chat\n${message}\n\n`;
    // Now send this event to all listening clients
    clients.forEach(client => client.write(event));
}


// This function is called in response to POST requests to the /chat endpoint
// which clients send when users type a new message.
async function broadcastQuestion() {
    currentQuestion = randomQuestion()
    let question = `data: ${currentQuestion.question}`;

    let event = `\nevent: question\n${question}\n\n`;

    clients.forEach(client => client.write(event));
}

function randomQuestion() {
  const randomNum = Math.floor(Math.random() * questions.length)

  return questions[randomNum]
}

async function checkAnswer(request, response) {
  request.setEncoding("utf8");
  let body = "";
  for await (let chunk of request) {
      body += chunk;
  }

  const answer = body.split(": ")[1]
  
  if (answer === questions.answer) {
    //broadcastNewMessage()
  }

}

setInterval(broadcastQuestion, 3000)