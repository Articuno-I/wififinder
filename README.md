# wififinder

Project: rebuilt smogon wifi battle finder, as seen here: https://www.youtube.com/watch?v=Lg3ivOcyx3w
Main difficulty: I don't know how to do that but oh well how hard can it be?

Basic idea:
- Client-side page (probably all on a single page), takes info including FC, smogon login, what you want to play etc. and hands it to the server
- Server (using node.js bc python SimpleHTTPServer looked annoying to get to work) handles requests, then when players match up it tells the client to display (a pre-existing) battle page including chat, FCs, opponent's smogon username and all that stuff or something.

Main difficulties that I'm working on:
1) Sending data between client and server
2) Making sure I know which connection is who, who's battling what, and how the smogon username thing works
3) The fact that I don't know HTML or node.js (minor detail)
