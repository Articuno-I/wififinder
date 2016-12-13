# wififinder

Project: rebuilt smogon wifi battle finder, as seen here: https://www.youtube.com/watch?v=Lg3ivOcyx3w  

Basic idea:
* Client-side page (probably all on a single page), takes info including FC, smogon login, what you want to play etc. and hands it to the server
* Server (using node.js) handles requests, then when players match up it tells the client to display (a pre-existing) battle page including chat, FCs, opponent's smogon username and all that stuff or something.

Difficulties:  
* Smogon logins: basically impossible if you're not Chaos, afaik. I'm just using a "pick a name" system for now.
* CSS, currently it looks terrible and I'm bad at changing that.
* Compatibility, specifically Internet Explorer is terrible and I haven't tested it on phone browsers or Safari yet.

Things I'm working on currently:
* Battles ending, IDK how to handle this. It'd also be nice to go back to the main submission part once a battle's over.
* Disconnects, making sure the array of current battles doesn't get infinitely long etc. Also, Internet Explorer doesn't send a disconnect message when it dc's, which breaks a few things.
 * IDK how to allow people back into battles if they DC, guess that'll just be something I can't deal with most likely.

Future considerations:
* Logging stuff: how many battles, what tiers, how long the wait times were, etc.
* Chat moderation: Prevent certain phrases, perhaps log chats to check validity of complaints?
* Log IPs?

### If you're reading this and thinking to yourself "I could help out with that", please feel free.
