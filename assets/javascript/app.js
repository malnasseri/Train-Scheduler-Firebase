  //initialize firebase
  var config = {
    apiKey: "AIzaSyD5A6U8k863dTbnJGxoSIN-CDftnuhS2t0",
    authDomain: "train-scheduler-78abd.firebaseapp.com",
    databaseURL: "https://train-scheduler-78abd.firebaseio.com",
    projectId: "train-scheduler-78abd",
    storageBucket: "train-scheduler-78abd.appspot.com",
    messagingSenderId: "897348887074"
  };
  firebase.initializeApp(config);
  
  var database = firebase.database();




	// Variables
	var trainName = "";
	var destination = "";
	var firstTrainTime = "";
	var frequency = 0;
	var currentTime = moment();
	


	// current time
	var datetime = null,
			date = null;
	//function to update time
	var update = function () {
  		  date = moment(new Date())
  	datetime.html(date.format('dddd, MMMM Do YYYY, h:mm:ss a'));
	};



	$(document).ready(function(){
  	datetime = $('#current-status')
  	update();
  	setInterval(update, 1000);
	


	// Capturing Button Click
	$("#submitBtn").on("click", function() {

  	// Grabbing values from input boxes
 	  trainName = $("#trainNameInput").val().trim();
  	destination = $("#destinationInput").val().trim();
  	firstTrainTime = $("#trainTimeInput").val().trim();
  	frequency = $("#frequencyInput").val().trim();
  
	

  // pushing
  database.ref().push({
    trainName: trainName,
    destination: destination,
    firstTrainTime: firstTrainTime,
    frequency: frequency,
    dateAdded: firebase.database.ServerValue.TIMESTAMP
  });
  
  alert("Addition submitted!");

  // Empty input boxes
  $("#trainNameInput").val("");
  $("#destinationInput").val("");
  $("#trainTimeInput").val("");
  $("#frequencyInput").val("");
  
  // Don't refresh the page
  return false; 
});




  database.ref().orderByChild("dateAdded").limitToLast(25).on("child_added", function(snapshot) {
    console.log("orderByChild");

    // console.log("Train name: " + snapshot.val().trainName);
    // console.log("Destination: " + snapshot.val().destination);
    // console.log("First train: " + snapshot.val().firstTrainTime);
    // console.log("Frequency: " + snapshot.val().frequency);
    // console.log("Next train: " + snapshot.val().nextArrival);
    // console.log("Minutes away: " + snapshot.val().minutesAway);
    
     // First Time (pushed back 1 year to make sure it comes before current time)
   var firstTimeConverted = moment(snapshot.val().firstTrainTime, "hh:mm").subtract(1, "years");
   //console.log(firstTimeConverted);

  
   var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
   //console.log(diffTime);

   
   var tRemainder = diffTime % snapshot.val().frequency;
   //console.log(tRemainder);

    
    var minutesAway = snapshot.val().frequency - tRemainder;
    // console.log("#####Minutes Away: "+ minutesAway);

    
    var nextTrain = moment().add(minutesAway, "minutes");
    // console.log("#####Next Train" + nextTrain);

   
    var nextArrival = moment(nextTrain).format("hh:mm a");
       
    

  // appending to change html table
  


  $("#new-train").append("<tr><td>" + snapshot.val().trainName + "</td>" +
    "<td>" + snapshot.val().destination + "</td>" + 
    "<td>" + snapshot.val().firstTrainTime + "</td>" +
    "<td>" + "Every " + snapshot.val().frequency + " mins" + "</td>" + 
    "<td>" + nextArrival + "</td>" +
    "<td>" + minutesAway + " mins until arrival" + "</td>" +
   	"</td></tr>");

  		

	  // Handle the errors if any
	  }, function(errorObject) {
	    console.log("Errors handled: " + errorObject.code);
	  })
});

  
