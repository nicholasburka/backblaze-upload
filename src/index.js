import * as CryptoJS from 'crypto-js';

const getUploadDetailsUrl = 'https://server1.nicholasab.com/getUploadDetails';//'http://server1.nicholasab.com/getUploadDetails';

const getUploadDetails = async () => {
    return new Promise((resolve, reject) => {
        var data = null;

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = false;

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === this.DONE) {
                console.info(`Get upload details response: `, this.responseText);
                try {
                    const uploadDetails = JSON.parse(this.responseText);
                    resolve(uploadDetails);
                } catch (err) {
                    reject("could not connect to Backblaze");
                }
            }
        });

        xhr.open("GET", getUploadDetailsUrl);

        xhr.send(data);
    });
};

const uploadAFile = async (file) => {
    const uploadFileInput = document.getElementById("uploadFileInput");
    const uploadFileButton = document.getElementById("uploadFileButton");
    var uploadStatus = document.getElementById("uploadStatus");
    var uploadFileName = document.getElementById("uploadFileName");

    uploadFileName.innerHTML = file.name;

    uploadStatus.innerHTML = "preparing upload..."
    uploadStatus.className = "preparing";
    var uploadDetails;
    try {
        uploadDetails = await getUploadDetails();
    } catch (err) {
        console.log("errored out on uploadDetails");
        uploadStatus.innerHTML = "error - could not connect to database";
        uploadStatus.className = "";
    }
    

    const reader = new FileReader();
    reader.onload = function () {

        const hash = CryptoJS.SHA1(CryptoJS.enc.Latin1.parse(reader.result));
        // Data hashed. Now perform upload.
        const xhr = new XMLHttpRequest();

        xhr.addEventListener("load", function () {
            console.log(this.response);
            console.info(`XHR response:`, this.response);
            uploadStatus.innerHTML = "file(s) uploaded";
            uploadStatus.className = "uploaded";
        });

        try {
            xhr.open("POST", uploadDetails.uploadUrl);
            uploadStatus.innerHTML = "uploading...";
            uploadStatus.className = "uploading";

            xhr.setRequestHeader("Content-Type", "image/png");
            xhr.setRequestHeader("Authorization", uploadDetails.authToken);
            xhr.setRequestHeader("X-Bz-File-Name", escape(file.name));//escape percent encodes: https://thewebdev.info/2022/01/21/how-to-percent-encode-strings-with-javascript/
            xhr.setRequestHeader("X-Bz-Content-Sha1", hash);

            const fileToSend = file;

            
            xhr.send(fileToSend);
            
        } catch (err) {
            console.log(err);
            uploadStatus.innerHTML = "error - could not upload"
            uploadStatus.className = "";
        }

        
    };
    reader.readAsBinaryString(file);
};

document.addEventListener("DOMContentLoaded", () => {
    const uploadFileInput = document.getElementById("uploadFileInput");
    const uploadFileButton = document.getElementById("uploadFileButton");
    var uploadStatus = document.getElementById("uploadStatus");
    var fileNum = document.getElementById("uploadFileNum");
    console.log("DOM content loaded");

    // When upload button clicked, get upload details and then perform file
    // upload with AJAX.
    uploadFileButton.addEventListener("click", async () => {
        console.log(uploadFileInput.files);
        var files = uploadFileInput.files;
        for (let i = 0; i < files.length; i++) {
            let file = files.item(i);
            fileNum.innerHTML = i + 1 + " of " + files.length;
            try {
                await uploadAFile(file);
            } catch (err) {

            }
        }
    });
});
