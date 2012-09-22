  
  /* 
  input = "Hello! Atlassians! How you doing? :) /Alaska Nebraska /Canada"
  return = "Alaska"
  */
  function getPlace(text) {
    var str = "";
    
    if (text.match(/\/([A-z]+)/)) 
      str = text.match(/\/([A-z]+)/)[1];

    if (str)
      return str;
    else
      return "";
  }

  function getText(text) {
    var str = "";

    if (text.match(/(.*[^\/])\//)) {
      // Case: "text /place" 
      str = text.match(/(.*[^\/])\//)[1];
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
      var name = $('#nameInput').val();
      var message = $('#messageInput').val();
      var place = getPlace(message).toLowerCase();
      text = getText(message);

      messagesRef.push({name:name, text:text, place:place});
      $('#messageInput').val('');
    }
  });
  
  var count = 0;
  places = {};
  
  // Add a callback that is triggered for each chat message.
  messagesRef.on('child_added', function (snapshot) {
    var message = snapshot.val();
	  
    var placehtml = [];
    placehtml[0] = "";

  	count = count + 1;
  	
  	if (message.place != "") {
      mentionedBy = places[message.place];

      if (mentionedBy) {
        $('#consoleDiv').text(message.place + ' already mentioned by ' + mentionedBy);
        placehtml = $('<span id="place-invalid"/>').html(message.place);
      } else {
        places[message.place.toLowerCase()] = message.name.toLowerCase();

        //TODO: Make First and Last letter bold.
        placehtml = $('<span id="place-valid"/>').html(message.place);
      }

    } else {
      $('#consoleDiv').text('Empty Place provided by ' + message.name);
    }

    
  	//Attach html to 
    $('<div/>').text(message.text + ' ').prepend($('<em/>').text(count + ": " + message.name + ': ')).append(placehtml[0]).appendTo($('#messagesDiv'));
    $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
  });