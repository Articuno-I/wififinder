function xyshow() {
   if (!document.getElementById("sumo").checked) {
      document.getElementById("XYonly").style.display="block";
   } else {
      document.getElementById("XYonly").style.display="none";
   }
}

function submit() {
   //step 1: get the data
   var gen; if (document.getElementById('sumo').checked) {gen = 7;} else {gen = 6;} //could probably use a bool but meh
   var xy; if (gen === 6 && document.getElementById('XY').checked) {xy = true;} else {xy = false;}
   var fc = document.getElementById('fc').value;
   var tier = document.getElementById('tier').value;
   //step 1.5: make sure all the data's there
   var info = true;
   if (fc.length != 12 || fc.match(/^[0-9]+$/) != null) {info = false;}
   if (!tier.length) {info = false;}
   if (!info) {
      document.getElementById('error').style.display='block';
   } else {
      var data = {Gen: gen, FC: fc, Tier: tier};
      if (gen === 6) {data.XY = xy;}
   //step 2: actually send it
      socket.emit('request', data);
   //step 3, the unimportant bit and therefore the part I coded first bc I'm bad lol
      document.getElementById('initform').style.display='none';
      document.getElementById('requests').style.display='none';
      document.getElementById('chat').style.display='block';
   //step 3 part 2: work out who the opponent is, and all that stuff. Also I should probably be going to a "challenging" page before doing this but w/e
   //also I'll probably find that quite challenging okok brb kms
}

function chat() {
   socket.emit('pm', chatMsg.val()); /*need to work out how the to/from addresses stuff will work */
   chatMsg.val('');
}
//Note: all the 'to' and 'from' stuff _needs_ to be dealt with on the server, or I'm just asking for someone to make zarel pm chaos with "im gay lol"
//actually, do I *really* need to deal with it on the server, knowing that?
socket.on('pm', function(data) {
   chatLog.append('<li class="pm">'+data.from+' -> '+data.to+': '+data.msg+'</li>');
});
//yeah I really gotta work out how all this data is gonna be packaged up
//also need to work out the html to go w this stuff tho shouldn't be too hard