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
        //Populate the LUT {place: 'playerName', ref: firebase-reference-rul} 
        places[message.place] = {name: message.name, ref: snapshot.ref().toString()};
        
        //highlight as valid
        placeNode = $('<span id="place' + setid + '" class="place-valid"/>').html(message.place);

        //create button set for the current statement
        buttonNode = createButtonSet(setid, message.place);
        //Register Callback
        voteRef = new Firebase(places[message.place].ref + '/vote');              
        voteRef.on('value', voteUpdateHandler);
            
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
      
      $("#acceptBtn" + setid).click(acceptButtonClickHandler);
      $("#rejectBtn" + setid ).click(rejectButtonClickHandler);

      setid++;
    }

    //Render Button Icons 
    renderButtonIcons();

  } //Child Added Callback

  function commonButtonClickHandler(place, typeStr, id) {
    var voteRef;

    //lookup correspondig place in LUT    
    console.log("Button Click: " + place + " - " + typeStr + " - mentioned by " + places[place].name);

    //update firebase 
    voteRef = new Firebase(places[place].ref + '/vote');
    voteRef.set({'vote': typeStr, 'id': id});
  }

  function acceptButtonClickHandler(event) {
    var place = $(this)[0].value;
    var setid = $(this)[0].name.charAt($(this)[0].name.length-1);

    commonButtonClickHandler(place,'Accepted',setid);
  }

  function rejectButtonClickHandler(event) {
    var place = $(this)[0].value;
    var setid = $(this)[0].name.charAt($(this)[0].name.length-1);

    commonButtonClickHandler(place,'Rejected',setid);
  }


  function voteUpdateHandler(snapshot) {
    var vote, setid;

    if(snapshot.val()) {
      vote = snapshot.val().vote;
      setid = snapshot.val().id;
      console.log('Vote value changed:' + vote + ' id: ' + setid);
      
      // Update UI Button States
      if (vote == 'Accepted') {
        $("#rejectBtn" + setid).removeAttr("checked");
        $("#acceptBtn" + setid).attr("checked","checked");
    
        $('#place' + setid).removeClass('place-invalid');
        $('#place' + setid).addClass('place-valid');

      } else if (vote == 'Rejected') {
        $("#acceptBtn" + setid).removeAttr("checked");
        $("#rejectBtn" + setid).attr("checked","checked");

        $('#place' + setid).removeClass('place-valid');
        $('#place' + setid).addClass('place-invalid');

      } else {
        //Error: Should not be called. 
      }

      $("#buttonSet" + setid).buttonset("refresh");
      if (setid > 1) {
        $("#buttonSet" + (setid - 1)).fadeOut(1000);
      }
      
      //TODO: update LUT with Vote.
      //places[place].vote = vote;
      
    }//snaptshot.val() is not null;
  }
