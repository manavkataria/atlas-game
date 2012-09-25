  /* Global Variables */
  var name = "";
  var count = 0;
  var setid = 1;  //buttonset id
  places = {};
  
  function getPlace(text) {
    var str = "";
    
    if (text.match(/\/([A-z ]+)/)) 
      str = text.match(/\/([A-z ]+)/)[1];

    if (str)
      return str;
    else
      return "";
  }

  function getText(text) {
    var str = "";

    if (text.match(/([^\/]*)[\/].*/)) {
      // Case: "text /place" 
      str = text.match(/([^\/]*)[\/].*/)[1];
    } else if (text.indexOf("/") >= 0){
      // Case: "/place" 
      str = "";
    } else {
      // Case: "text" 
      str = text;
    }

    return str;
  }

  // Get a reference to the root of the chat data.
  var messagesRef = new Firebase('http://gamma.firebase.com/ManavKataria/SandBox/AtlasGame/Chat/');
  
  // When the user presses enter on the message input, write the message to firebase.
  $('#messageInput').keypress(function (e) {
    if (e.keyCode == 13) {
      name = $('#nameInput').val();
      var message = $('#messageInput').val();
      var place = getPlace(message).toLowerCase();
      text = getText(message);

      messagesRef.push({name:name, text:text, place:place});
      $('#messageInput').val('');
    }
  });
  

  // Add a callback that is triggered for each chat message.
  messagesRef.on('child_added', function (snapshot) {
    var message = snapshot.val();
	  
    var placeNode = [];
    var buttonNode = [""];

    placeNode[0] = "";
    buttonNode[0] = "";
    
  	count = count + 1;
  	
  	if (message.place != "") {
      mentionedBy = places[message.place];
      
      if (mentionedBy) {
        $('#statusDiv').text(message.place + ' already mentioned by ' + mentionedBy);
        placeNode = $('<span class="place-invalid"/>').html(message.place);
      } else {
        places[message.place.toLowerCase()] = message.name.toLowerCase();

        //TODO: Make First and Last letter bold.
        placeNode = $('<span class="place-valid"/>').html(message.place);

        //create button set
        buttonNode = $('<span class="button-set" id="buttonSet'+setid+'"></span>').html(
          '<input type="radio" class="accept-btn" id="acceptBtn'+setid+'" name="buttonSet'+setid+'" /><label for="acceptBtn'+setid+'">Accept</label>' +
          '<input type="radio" class="reject-btn" id="rejectBtn'+setid+'" name="buttonSet'+setid+'" /><label for="rejectBtn'+setid+'">Reject</label>').buttonset();
        setid++;
      }

    } else {
      $('#statusDiv').text('Empty place provided by ' + message.name);
    }

  	//Attach html to 
    $('<div/>').text(message.text + ' ').prepend($('<em/>').text(count + ": " + message.name + ': ')).append(placeNode[0]).append(buttonNode[0]).appendTo($('#messagesDiv'));
    $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;

    $( ".accept-btn").button({
      icons: { primary: "ui-icon-check" }, 
      text: false
    }); 
    $( ".reject-btn").button({
      icons: { primary: "ui-icon-closethick" }, 
      text: false
    });

  }); //Child Added Callback
