// Prompt the user for a name to use.
  //name = prompt("Your name?", "Manav");
  name = "Manav";
  $('#nameInput').val(name);
  //$('#nameInput').attr('disabled', true);

  // Get a reference to the presence data in firebase.
  var userListRef = new Firebase('http://gamma.firebase.com/ManavKataria/SandBox/AtlasGame/Presence/');

  //Get a reference to my own presence status
  var myStatus = userListRef.child(name);

  //Our initial online status.
  var currentStatus = 'online';

  //A helper function to let us set our own state.
  function setUserStatus(status) {
    currentStatus = status;
    //if we lose our internet connection, we want ourselves removed from the list.
    myStatus.removeOnDisconnect();
    myStatus.set(status);
  }

  //We need to catch anytime we are marked as offline and then set the correct status. We
  //could be marked as offline 1) on page load or 2) when we lose our internet connection
  //temporarily.
  myStatus.on("value", function(snapshot) {
    if(snapshot.val() === null) {
      setUserStatus(currentStatus);
    }
  });

  // Render someone's online status
  function addStatus(snapshot) {
    $('#presenceDiv').append($('<div/>').attr('id', snapshot.name()));
    setStatus(snapshot);
  }
  //Remove the status of a user who left
  function removeStatus(snapshot) {
    $("#" + snapshot.name()).remove();
  }
  //Change a user's status
  function setStatus(snapshot) {
    $('#' + snapshot.name()).text(snapshot.name() + ' (' + snapshot.val() + ')');
  }

  //Anytime an online status is added, removed, or changed, we want to update the GUI
  userListRef.on('child_added', addStatus);
  userListRef.on('child_removed', removeStatus);
  userListRef.on('child_changed', setStatus);

  // Use idle/away/back events created by idle.js to update our status information.;
  document.onIdle = function () {
    setUserStatus('idle');
  }
  document.onAway = function () {
    setUserStatus('away');
  }
  document.onBack = function (isIdle, isAway) {
    setUserStatus('online');
  }

  setIdleTimeout(10000);
  setAwayTimeout(20000);
