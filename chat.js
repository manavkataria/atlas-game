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

  function acceptBtnClickCB(event) {
    alert("Accept button clicked!");
    //get button id
    //lookup correspondig place in LUT
    //update firebase 
    //update LUT
  }

  function renderButtonIcons() {
    $( ".accept-btn").button({
      icons: { primary: "ui-icon-check" }, 
      text: false
    }); 
    $( ".reject-btn").button({
      icons: { primary: "ui-icon-closethick" }, 
      text: false
    });
  }

  function createButtonSet(setid, place) {
    return $('<span class="button-set" id="buttonSet'+setid+'"></span>').html(
          '<input type="radio" class="accept-btn" id="acceptBtn' + setid + '" value="' + place + '" name="buttonSet'+setid+'" />' + 
          '<label for="acceptBtn' + setid + '">Accept</label>' +
          '<input type="radio" class="reject-btn" id="rejectBtn' + setid + '" value="' + place + '" name="buttonSet'+setid+'" />' + 
          '<label for="rejectBtn' + setid + '">Reject</label>'
          ).buttonset();
  }

  // Get a reference to the root of the chat data.
  var messagesRef = new Firebase('http://gamma.firebase.com/ManavKataria/SandBox/AtlasGame/Chat/');
  
  // Write message to firebase.
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
  messagesRef.on('child_added', addMessage);

  //Anytime an online status is added, removed, or changed, we want to update the GUI
  //TODO: These need to update UI for the other clients when they observe a firebase data change.
  /*myRef.on('child_added', addStatus);
  myRef.on('child_removed', removeStatus);
  myRef.on('child_changed', setStatus);
  */

  function addMessage(snapshot) {
    var message = snapshot.val();	  
    var placeNode = [];
    var buttonNode = [""];
    var mentionedBy = null;

    placeNode[0] = "";
    buttonNode[0] = "";
    mentionedBy 
    
  	count = count + 1;
  	
    if (message.place != "") {
      mentionedBy = places[message.place];
      
      //Unique place. Did not find a prior mention
      if (!mentionedBy) {
        //push to Data Structure  
        places[message.place.toLowerCase()] = message.name.toLowerCase();
        
        //highlight as valid
        placeNode = $('<span class="place-valid"/>').html(message.place);

        //create button set for the current statement
        buttonNode = createButtonSet(setid, message.place);
        
      //Duplicate. Mention found.
      } else {
        //update status message
        $('#statusDiv').text(message.place + ' already mentioned by ' + mentionedBy);
        
        //highlight as invalid
        placeNode = $('<span class="place-invalid"/>').html(message.place);     
      } 

    //Empty variable. No place provided. 
    } else {
      //Set status message      
      $('#statusDiv').text('Empty place provided by ' + message.name);
    }

  	//Attach html to messageDiv 
    $('<div/>').text(message.text + ' ').prepend($('<em/>').text(count + ": " + message.name + ': ')).append(placeNode[0]).append(buttonNode[0]).appendTo($('#messagesDiv'));
    $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;

    //register button click handlers
    if (message.place != "" && !mentionedBy){
      console.log("Registering ClickHandler for #btn" + setid);
      
      $("#acceptBtn" + setid).click(function () {
        console.log("Accept: " + $(this)[0].value);
        console.log($(this));
      });

      $("#rejectBtn" + setid ).click(function () {
        console.log("Reject: " + $(this)[0].value);
        console.log($(this));
      });

      setid++;
    }

    //Render Button Icons 
    renderButtonIcons();

  } //Child Added Callback

  $(document).ready(function() {
    //empty.
  });

