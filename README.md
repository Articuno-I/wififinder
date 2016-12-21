# wififinder

####Currently visible [here](https://wififinder-articuno-i.c9users.io/) (sometimes)

Project: rebuilt smogon wifi battle finder, as seen [here](https://www.youtube.com/watch?v=Lg3ivOcyx3w) 

Basic idea:
* Client-side page (single page that changes depending on where the user is), takes info including FC, smogon login, what you want to play etc. and hands it to the server
* Server (using node.js) handles requests, moves data between clients e.g. telling everyone what requests are going on and moving pms between users.

Difficulties:  
* Smogon logins: basically impossible if you're not Chaos, afaik. I'm just using a "pick a name" system for now.
* CSS, I'm terrible at making things look ok, and I need to make it work for phone-sized browsers.
* Compatibility - IE is horrendous, safari's not great, and I haven't tested on phones.

Things I'm working on currently:
* Bug catching, there's bound to be 5000000 of them that will doubtless crash the server many times.
* Compatibility, specifically some browsers don't tell you when they dc, meaning names that are taken remain taken.
* Perhaps add a current user count?

Future considerations:
* Logging stuff: how many battles, what tiers, how long the wait times were, etc.
* Chat moderation: Prevent certain phrases, perhaps log chats to check validity of complaints?
* Log IPs?

### If you're reading this and thinking to yourself "I could help out with that", please feel free.
