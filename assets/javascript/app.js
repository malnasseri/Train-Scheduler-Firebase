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
var data;
function t() {
    document.getElementById('time').innerHTML = moment().format('ddd hh:mm:ss a');
}

t();
window.setInterval(t, 1000);
function d() {
    document.getElementById('date').innerHTML = moment().format('MMM Do YYYY');
}

d();
window.setInterval(d, 1000);


	  var dataRef = firebase.database();
    var editTrainKey = '';
    var fbTime = moment();
    var newTime;
 $('.reset').on('click', function(e) {
   e.preventDefault();
   $('.help-block').removeClass('bg-danger');

 });
    $('.submit').on('click', function(e) {

      e.preventDefault();
      // Grab input values
      var trainName = $('#trainName').val().trim();
      var trainDestination = $('#trainDestination').val().trim();
      // Convert to Unix
      var trainTime = moment($('#firstTrain').val().trim(),"HH:mm").format("X");
      var trainFreq = $('#trainFrequency').val().trim();

      if (trainName != '' && trainDestination != '' && trainTime != '' && trainFreq != '') {
        // Clear form data
        $('#trainName').val('');
        $('#trainDestination').val('');
        $('#firstTrain').val('');
        $('#trainFrequency').val('');
        $('#trainKey').val('');

        fbTime = moment().format('X');
        // Push to firebase
        if (editTrainKey == ''){ 
          dataRef.ref().child('trains').push({
            trainName: trainName,
            trainDestination: trainDestination,
            trainTime: trainTime,
            trainFreq: trainFreq,
            currentTime: fbTime,
          })
        } else if (editTrainKey != '') {
          dataRef.ref('trains/' + editTrainKey).update({
            trainName: trainName,
            trainDestination: trainDestination,
            trainTime: trainTime,
            trainFreq: trainFreq,
            currentTime: fbTime,
          })
          editTrainKey = '';
        }
        $('.help-block').removeClass('bg-danger');
      } else {
        $('.help-block').addClass('bg-danger');
      }

    });

    // Update minutes away by triggering change in firebase children
    function timeUpdater() {
      dataRef.ref().child('trains').once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
          fbTime = moment().format('X');
          dataRef.ref('trains/' + childSnapshot.key).update({
          currentTime: fbTime,
          })
        })    
      });
    };

    setInterval(timeUpdater, 1000);


    // Reference Firebase when page loads and train added
    dataRef.ref().child('trains').on('value', function(snapshot){
      $('tbody').empty();
      
      snapshot.forEach(function(childSnapshot){
        var trainClass = childSnapshot.key;
        var trainId = childSnapshot.val();
        var firstTimeConverted = moment.unix(trainId.trainTime);
        var timeDiff = moment().diff(moment(firstTimeConverted, 'HH:mm'), 'minutes');
        var timeDiffCalc = timeDiff % parseInt(trainId.trainFreq);
        var timeDiffTotal = parseInt(trainId.trainFreq) - timeDiffCalc;

        if(timeDiff >= 0) {
          newTime = null;
          newTime = moment().add(timeDiffTotal, 'minutes').format('hh:mm A');

        } else {
          newTime = null;
          newTime = firstTimeConverted.format('hh:mm A');
          timeDiffTotal = Math.abs(timeDiff - 1);
        }

        $('tbody').append("<tr class=" + trainClass + "><td>" + trainId.trainName + "</td><td>" +
          trainId.trainDestination + "</td><td>" + 
          trainId.trainFreq + "</td><td>" +
          newTime + "</td><td>" +
          timeDiffTotal + "</td><td><button class='edit btn' data-train=" + trainClass + "><i class='glyphicon glyphicon-pencil'></i></button></td><td><button class='delete btn' data-train=" + trainClass + "><i class='glyphicon glyphicon-remove'></i></button></td></tr>");

    });
    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });

     // Reference Firebase when children are updated
    dataRef.ref().child('trains').on('child_changed', function(childSnapshot){
      
      var trainClass = childSnapshot.key;
      var trainId = childSnapshot.val();
      var firstTimeConverted = moment.unix(trainId.trainTime);
      var timeDiff = moment().diff(moment(firstTimeConverted, 'HH:mm'), 'minutes');
      var timeDiffCalc = timeDiff % parseInt(trainId.trainFreq);
      var timeDiffTotal = parseInt(trainId.trainFreq) - timeDiffCalc;

      if(timeDiff > 0) {
        newTime = moment().add(timeDiffTotal, 'minutes').format('hh:mm A');
      } else {
        newTime = firstTimeConverted.format('hh:mm A');
        timeDiffTotal = Math.abs(timeDiff - 1);
      } 

      $('.'+trainClass).html("<td>" + trainId.trainName + "</td><td>" +
        trainId.trainDestination + "</td><td>" + 
        trainId.trainFreq + "</td><td>" +
        newTime + "</td><td>" +
        timeDiffTotal + "</td><td><button class='edit btn' data-train=" + trainClass + "><i class='glyphicon glyphicon-pencil'></i></button></td><td><button class='delete btn' data-train=" + trainClass + "><i class='glyphicon glyphicon-remove'></i></button></td>");

    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });


    $(document).on('click','.delete', function(){
      var trainKey = $(this).attr('data-train');
      dataRef.ref("trains/" + trainKey).remove();
      $('.'+ trainKey).remove();
    });

    $(document).on('click','.edit', function(){
      editTrainKey = $(this).attr('data-train');
      dataRef.ref("trains/" + editTrainKey).once('value').then(function(childSnapshot) {
        $('#trainName').val(childSnapshot.val().trainName);
        $('#trainDestination').val(childSnapshot.val().trainDestination);
        $('#firstTrain').val(moment.unix(childSnapshot.val().trainTime).format('HH:mm'));
        $('#trainFrequency').val(childSnapshot.val().trainFreq);
        $('#trainKey').val(childSnapshot.key);

      });
      
    });

  

