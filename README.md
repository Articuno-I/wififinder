# wififinder

####Currently visible [here](https://wififinder-articuno-i.c9users.io/) (sometimes)

Project: rebuilt smogon wifi battle finder, as seen [here](https://www.youtube.com/watch?v=Lg3ivOcyx3w) 

Basic idea:
* Client-side page (single page that changes depending on where the user is), takes info including FC, smogon login, what you want to play etc. and hands it to the server
* Server (using node.js) handles requests, moves data between clients e.g. telling everyone what requests are going on and moving pms between users.

Difficulties:  
* Smogon logins: basically impossible if you're not Chaos, afaik. I'm just using a "pick a name" system for now.
* CSS, I'm terrible at making things look ok but hopefully someone else can fix that stuff.
* Compatibility, specifically Internet Explorer is terrible and I haven't tested it on phone browsers or Safari yet.

Things I'm working on currently:
* Bug catching, there's bound to be 5000000 of them that will doubtless crash the server many times.
* Compatibility, especially with some IE versions not telling the server when they dc which has potential to break things. (Or even flat-out not working? Kinda hard to test when I'm not running windows though...)
* Add more HTML. Probably put in a header with options like smogon frontpage, etc. Maybe a "current users" count?

Future considerations:
* Some way of getting back to battles after a dc? IDK how this would work though.
* Logging stuff: how many battles, what tiers, how long the wait times were, etc.
* Chat moderation: Prevent certain phrases, perhaps log chats to check validity of complaints?
* Log IPs?

### If you're reading this and thinking to yourself "I could help out with that", please feel free.
