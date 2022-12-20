import * as CryptoJS from 'crypto-js';

const getUploadDetailsUrl = 'https://server1.nicholasab.com/getUploadDetails';//'http://server1.nicholasab.com/getUploadDetails';

const SHOW_METADATA_QUESTIONS = (Math.random() < .5);
console.log("show metadata questions set to: " + SHOW_METADATA_QUESTIONS);

var REPORTED_TO_NYCHA = undefined;
var upload_counter = 1;

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

const uploadAFile = async (file, meta) => {
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
            if (meta) {
                xhr.setRequestHeader("X-Bz-File-Name", escape((meta + file.name)));//escape percent encodes: https://thewebdev.info/2022/01/21/how-to-percent-encode-strings-with-javascript/
            } else {
                xhr.setRequestHeader("X-Bz-File-Name", escape(file.name));//escape percent encodes: https://thewebdev.info/2022/01/21/how-to-percent-encode-strings-with-javascript/
            }
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

/*function googleTranslateElementInit() {
    console.log("google translate element init");
    console.log(google);
    new google.translate.TranslateElement(
        {
            pageLanguage: "en, es, zh-CN"//,
            //layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        },
        "google_translate_element"
    );
};*/

function getMetadata() {
    const strAddr = document.getElementById("streetAddress").value;
    const apt = document.getElementById("apt").value;
    const healthConds = document.getElementById("healthConditions").value;
    const numChildren = document.getElementById("numChildren").value;
    const numElderly = document.getElementById("numElderly").value;
    const moldLoc = document.getElementById("moldLocation").value;
    const firstNoticed = document.getElementById("firstNoticed").value;
    const fixedNYCHA = document.getElementById("NYCHAFixed").checked;
    const fixedSelf = document.getElementById("SelfFixed").checked;
    const fixedNot = document.getElementById("Unrepaired").checked;
    const fixedUnknown = document.getElementById("Unknown").checked;

    const meta_str = "STR_" + strAddr + "_APT_" + apt + "_HEALTH_" + healthConds + "_NUMCHILD_" + 
            numChildren + "_NUMELD_" + numElderly + "_MOLDLOC_" + moldLoc + "_NOTIDATE_" + firstNoticed
            + "_FNYCH_" + fixedNYCHA + "_FS_" + fixedSelf + "_NF_" + fixedNot + "_UKF_" + fixedUnknown;

    console.log(meta_str);
    console.log(meta_str.length);
    return meta_str;
}

document.addEventListener("DOMContentLoaded", () => {
    
    console.log("DOM content loaded");

    var alreadyReported = document.getElementById("alreadyReported");
    var notReported = document.getElementById("notReported");
    var notReported = document.getElementById("notMine");
    const confirmReported = document.getElementById("confirmReported");


    const uploadFileInput = document.getElementById("uploadFileInput");
    const uploadFileButton = document.getElementById("uploadFileButton");
    var uploadContainer = document.getElementById("upload-container");
    var uploadStatus = document.getElementById("uploadStatus");
    var fileNum = document.getElementById("uploadFileNum");

    //googleTranslateElementInit();


    confirmReported.addEventListener("click", () => {
        console.log("reported issue?");
        console.log("already reported: " + alreadyReported.checked);
        console.log("not reported: " + notReported.checked);
        document.getElementById("initial-question").className = "hidden";

        if (alreadyReported.checked || notMine.checked) {
            //reveal uploadContainer
            uploadContainer.className = "";

            if (SHOW_METADATA_QUESTIONS) {

                var metadata_qs = document.getElementById("upload-metadata");
                metadata_qs.className = "";

                uploadFileButton.addEventListener("click", async () => {
                    console.log(uploadFileInput.files);
                    /*var meta_str = "";
                    const strAddr = document.getElementById("streetAddress").value;
                    const apt = document.getElementById("apt").value;
                    const healthConds = document.getElementById("healthConditions").value;
                    const numChildren = document.getElementById("numChildren").value;
                    const numElderly = document.getElementById("numElderly").value;
                    const moldLoc = document.getElementById("moldLocation").value;

                    meta_str = "META_STR_" + strAddr + "_APT_" + apt + "_METAEND_";*/
                    const meta_str = "META_" + getMetadata() + "_METAEND_";
                    var files = uploadFileInput.files;
                    for (let i = 0; i < files.length; i++) {
                        let file = files.item(i);
                        fileNum.innerHTML = i + 1 + " of " + files.length;
                        try {
                            await uploadAFile(file, meta_str);
                        } catch (err) {

                        }
                    }
                });
            } else {


                // When upload button clicked, get upload details and then perform file
                // upload with AJAX.
                uploadFileButton.addEventListener("click", async () => {
                    console.log(uploadFileInput.files);
                    var files = uploadFileInput.files;
                    for (let i = 0; i < files.length; i++) {
                        let file = files.item(i);
                        fileNum.innerHTML = i + 1 + " of " + files.length;
                        try {
                            await uploadAFile(file, false);
                        } catch (err) {

                        }
                    }
                });
            }

        } else {
            uploadContainer.className = "";

            var instructions = document.getElementById("intake-directions");
            instructions.className = "";
            var metadata_qs = document.getElementById("upload-metadata");
            metadata_qs.className = "";

            

            uploadFileButton.addEventListener("click", async () => {
                    console.log(uploadFileInput.files);
                    const meta_str = "META_UPLOADNUM_" + upload_counter + "_" + getMetadata() + "_METAEND_";
                    var files = uploadFileInput.files;
                    for (let i = 0; i < files.length; i++) {
                        let file = files.item(i);
                        fileNum.innerHTML = i + 1 + " of " + files.length;
                        try {
                            await uploadAFile(file, meta_str);
                        } catch (err) {

                        }
                    }
                    upload_counter = upload_counter + 1;
                });
        }
    });

    

    
});
