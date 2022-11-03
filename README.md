Developed/extended from https://github.com/mattwelke/upload-file-to-backblaze-b2-from-browser-example 

3 main components to the photo upload tool:

HTML frontend + JavaScript - nicholasab.com/mold-upload.html
Index.html - The UI for the app, written in Hypertext Markup Language (HTML) with in-page styling using Cascading Styles Sheets (CSS) and some Javascript (JS) functionality (the classic webpage trio)
- HTML provides an <input> element for multiple file input
- src/index.js - On submit button click, loops through each file inputted (JS)
1. makes an XMLHttpRequest (using HTTPS) GET request to server1.nicholasab.com/getUploadDetails to get the Backblaze file storage upload URL
2. Sends an HTTPS POST request with the file (encrypted) to the backblaze file storage upload URL
3. Monitors progress throughout and provides status / error updates

Node.js Express Server - hosted on my Virtual Private Server, server1.nicholasab.com - /backend folder within the GitHub repo
- A node.js script that creates an HTTPS Express Server - in app.js, which routes all GET requests to server1.nicholasab.com/getUploadDetails to a file called getUploadDetails.js (/backend/routes/getUploadDetails.js, which relies on /backend/services/all files)
- Uses the Backblaze javascript-language Application Programming Interface to fetch an upload URL for the identified bucket (named mold-dataset, and has associated keys / IDs used in the script for the API request)
- Returns the URL
- Stays running all the time thanks to a tool called “forever”, which creates a daemon within the VPS to manage the script


Backblaze backend - a “public” bucket (files accessible through direct links, to view the full buckets contents requires either API keys or my associated Backblaze account information)
- Config information in /backend/config.js
- File storage bucket called mold-dataset (similar to AWS S3 buckets, cheaper and not owned by Amazon)
