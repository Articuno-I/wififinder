# wififinder

Project: rebuilt smogon wifi battle finder, as seen here: https://www.youtube.com/watch?v=Lg3ivOcyx3w  

Basic idea:
* Client-side page (probably all on a single page), takes info including FC, smogon login, what you want to play etc. and hands it to the server
* Server (using node.js) handles requests, then when players match up it tells the client to display (a pre-existing) battle page including chat, FCs, opponent's smogon username and all that stuff or something.

Difficulties:  
* Smogon logins: basically impossible if you're not Chaos, afaik. I'm just using a "pick a name" system for now.
* Actually doing stuff bc schoolwork and stuff
* Working out how the server's storing all the data, getting the functions in place to move data between the two and all that stuff

Things I'm working on currently:
* Challenging people, accepting those challenges, making sure all the data (e.g. FCs) is transferred
* Battle system including chat, knowing who's battling whom, etc.
* Disconnects, making sure the array of current battles doesn't get infinitely long etc.
 * IDK how to allow people back into battles if they DC, guess that'll just be something I can't deal with most likely.

Future problems:
* Ending battles, people dc'ing, etc. are all potentially annoying problems
* Making it look ok, hopefully someone else can deal with CSS and stuff
* Getting it integrated into smogon, again hopefully someone else can handle that stuff

### If you're reading this and thinking to yourself "I could help out with that", please feel free.
