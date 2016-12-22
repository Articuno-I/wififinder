# wififinder

####Currently visible [here](https://wififinder-articuno-i.c9users.io/) (sometimes)

Project: rebuilt smogon wifi battle finder, as seen [here](https://www.youtube.com/watch?v=Lg3ivOcyx3w) 

Basic idea:
* Client-side page (single page that changes depending on where the user is), takes info including FC, smogon login, what you want to play etc. and hands it to the server
* Server (using node.js) handles requests, moves data between clients e.g. telling everyone what requests are going on and moving pms between users.

Difficulties:  
* Smogon logins: basically impossible if you're not Chaos, afaik. I'm just using a "pick a name" system for now.
* CSS - mostly dealt with now, but may look bad on some phones, IDK. I'm always open to ways to make it look better, too.
* Compatibility - IE is horrendous, safari's not great, and I haven't tested on phones.

Things I'm working on currently:
* Bug catching, I think I've got most of them but doubtless you can crash the server if you try hard enough.
* Compatibility, specifically some browsers don't tell you when they dc, meaning names that are taken remain taken. Seems to be a problem with socket.io (see [here](https://github.com/socketio/socket.io/issues/635)), I'll try to find a way round it though..
* Perhaps add a current user count?

Future considerations:
* Logging stuff: how many battles, what tiers, how long the wait times were, etc.
* Chat moderation: Prevent certain phrases, perhaps log chats to check validity of complaints?
* Log IPs?

### If you're reading this and thinking to yourself "I could help out with that", please feel free.
