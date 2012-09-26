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
	  
      if (message.length != 0) {
    		var place = getPlace(message).toLowerCase();
    		text = getText(message);
    		messagesRef.push({name:name, text:text, place:place});
    		$('#messageInput').val('');
  	  }
    }
  });
  

  // Add a callback that is triggered for each chat message.
  messagesRef.on('child_added', addMessage);

  function addMessage(snapshot) {
    var message = snapshot.val();	  
    var placeNode = [];
    var buttonNode = [""];
    var mentionedBy = null;

    placeNode[0] = "";
    buttonNode[0] = "";

    message.place = message.place.toLowerCase();
    
    count = count + 1;
  	
    if (message.place != "") {

      //Check if place was already mentioned
      if (places[message.place]) {
        mentionedBy = places[message.place].name;  
      }
       
      //Unique place. Did not find a prior mention
      if (!mentionedBy) {
        //Populate the LUT {place: 'playerName'} 
        places[message.place] = {name: message.name, ref: snapshot.ref().toString()};
        
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
    if (message.place != "" && places[message.place] && !mentionedBy){
      
      $("#acceptBtn" + setid).click(acceptBtnClickCB);
      $("#rejectBtn" + setid ).click(rejectBtnClickCB);

      setid++;
    }

    //Render Button Icons 
    renderButtonIcons();

  } //Child Added Callback

  function commonBtnCB(place, typeStr) {
    var player;
    var placeRef, voteRef;

    //lookup correspondig place in LUT
    player = places[place].name;
    placeRef = new Firebase(places[place].ref);

    console.log(typeStr + ": " + place + " mentioned by: " + player);

    //if (placeRef) Does NOT have a child 'vote'
    //TODO: Maintain state locally. Decide accordingly. 
    {
      voteRef = new Firebase(placeRef + '/vote');  
    
      //Register Callback 
      voteRef.on('value', setBtnState);
    }

    //update firebase 
    voteRef.set(typeStr);

    //TODO: update LUT
  }

  function acceptBtnClickCB(event) {
    commonBtnCB($(this)[0].value,'Accepted');
  }

  function rejectBtnClickCB(event) {
    commonBtnCB($(this)[0].value,'Rejected');
  }


  function setBtnState(snapshot) {
    if(snapshot.val()) {
      console.log('Btn Set:' + snapshot.val());    
    }
  }

  function addBtnState(snapshot) {
    console.log('Btn Add:' + snapshot.val());
  }



  $(document).ready(function() {
    //empty.
  });

