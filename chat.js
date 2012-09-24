/* Global Variables */
  var name = "";
  
  /* 
  input = "Hello! Atlassians! How you doing? :) /Alaska Nebraska /Canada"
  return = "Alaska"
  */
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
  
  var count = 0;
  var setid = 1;  //buttonset id
  places = {};

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
        buttonNode = $('<span id="radioA'+setid+'"></span>').html(
          '<input type="radio" class="acceptbtn" id="radioA1'+setid+'" name="radioA'+setid+'" /><label for="radioA1'+setid+'">Accept</label>' +
          '<input type="radio" class="rejectbtn" id="radioA2'+setid+'" name="radioA'+setid+'" /><label for="radioA2'+setid+'">Reject</label>').buttonset();
        setid++;

      }

    } else {
      $('#statusDiv').text('Empty Place provided by ' + message.name);
    }

  	//Attach html to 
    $('<div/>').text(message.text + ' ').prepend($('<em/>').text(count + ": " + message.name + ': ')).append(placeNode[0]).append(buttonNode[0]).appendTo($('#messagesDiv'));
    $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;

    $( ".acceptbtn").button({
      icons: { primary: "ui-icon-check" }, 
      text: false
    }); 
    $( ".rejectbtn").button({
      icons: { primary: "ui-icon-closethick" }, 
      text: false
    });

  });
