# wififinder

Project: rebuilt smogon wifi battle finder, as seen here: https://www.youtube.com/watch?v=Lg3ivOcyx3w  

Basic idea:
* Client-side page (probably all on a single page), takes info including FC, smogon login, what you want to play etc. and hands it to the server
* Server (using node.js) handles requests, then when players match up it tells the client to display (a pre-existing) battle page including chat, FCs, opponent's smogon username and all that stuff or something.

Difficulties:  
* Smogon logins: basically impossible if you're not Chaos, afaik. I'm just using a "pick a name" system for now.
* CSS, I'm terrible at making things look ok but hopefully someone else can fix that stuff.
* Compatibility, specifically Internet Explorer is terrible and I haven't tested it on phone browsers or Safari yet.

Things I'm working on currently:
* Bug catching, there's bound to be 5000000 of them that will doubtless crash the server many times.
* Compatibility, especially with some IE versions not telling the server when they dc which has potential to break things. (Or even flat-out not working? Kinda hard to test when I'm not running windows though...)

Future considerations:
* Some way of getting back to battles after a dc? IDK how this would work though.
* Logging stuff: how many battles, what tiers, how long the wait times were, etc.
* Chat moderation: Prevent certain phrases, perhaps log chats to check validity of complaints?
* Log IPs?

### If you're reading this and thinking to yourself "I could help out with that", please feel free.
