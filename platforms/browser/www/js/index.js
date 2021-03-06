var app = {

    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.

    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        //app.receivedEvent('deviceready');
        $( "#first" ).click();
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
    },

    getCameraOptions: function(srcType) {
        return {
            // Some common settings are 20, 50, and 100
            quality: 100,
            destinationType: Camera.DestinationType.DATA_URL,//Camera.DestinationType.DATA_URL,
            // In this app, dynamically set the picture source, Camera or photo gallery
            sourceType: srcType,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            allowEdit: false,
            correctOrientation: true, //Corrects Android orientation quirks,
            targetHeight: 100,
            targetWidth: 100
        }
    },

    takePicture: function () {

        openCamera();
        document.getElementById('result').innerHTML="";

        function openCamera(selection) {

            var options = app.getCameraOptions(Camera.PictureSourceType.CAMERA);
            
            navigator.camera.getPicture(function cameraSuccess(imageUri) {

                app.displayImage(imageUri);
            }, function cameraError(error) {
                console.debug("Unable to obtain picture: " + error, "app");

            }, options);
        }
    },

    displayImage: function (imgUri) {
        var parent = document.getElementById('imageGrid');
        var template = $('#imageGrid li')[0];
        var newElem = template.cloneNode(true);
        newElem.style.display = "block";
        newElem.children[0].children[0].src = "data:image/jpeg;base64, " + imgUri;
        parent.appendChild(newElem);
    },

    analyzePicture: function () {
        var elem = document.getElementById('result');
        var imageGrid = document.getElementById('imageGrid');        
        //var tf = new TensorFlow('inception-v1');
        var tf = new TensorFlow('custom-model', {
            'label': 'My Custom Model',
            'model_path': "www/files/retrained_graph.pb",//"https://www.dropbox.com/s/x20zu9ah73he19p/custom-model.zip?dl=1#retrained_graph.pb",//"https://files.fm/down.php?i=k4tm6wsy&n=custom-model.zip#retrained_graph.pb",
            'label_path': "www/files/retrained_labels.txt",//"https://www.dropbox.com/s/x20zu9ah73he19p/custom-model.zip?dl=1#retrained_labels.txt",//"https://files.fm/down.php?i=k4tm6wsy&n=custom-model.zip#retrained_labels.txt",
            'input_size': 224,
            'image_mean': 128,
            'image_std': 128,
            'input_name': 'input',  // 'Mul' for v3, 'input' for v1/mobile-net
            'output_name': 'final_result'
        });

        if(imageGrid.children.length <= 1) {
            elem.innerHTML = "Please click photo for analysis..";
            return;
        }
        else {
            elem.innerHTML = "";
            
            tf.load().then(() => {
                console.log('Model Loaded');
                
                var index = 0;
                for(var i=1; i<imageGrid.children.length; i++) {

                    tf.classify(imageGrid.children[i].children[0].children[0].src.replace('data:image/jpeg;base64, ','')).then(results => {
                        ++index;
                        imageGrid.children[index].children[0].children[1].innerHTML = results[0].title + "- " + parseFloat(results[0].confidence*100).toFixed(2);
                    });
                }
            });
        }
    },

    getPermission: function() {
        var successCallback = (hasPermission) => {
            if(!hasPermission) {
                window.plugins.speechRecognition.requestPermission(
                    () => console.log('Permission Granted!'), 
                    () => console.log('Permission Denied!'))
            }
            if(cordova.platformId === 'ios') {
                document.getElementById("btnStopListening").style.visibility = "visible";
            }
        }
        var errorCallback = function(hasPermission) {
            console.log('Error while requesting permission');
        }

        window.plugins.speechRecognition.isRecognitionAvailable(successCallback, errorCallback);

        cordova.plugins.diagnostic.isMicrophoneAuthorized(function(authorized){
            console.log("App is " + (authorized ? "authorized" : "denied") + " access to the microphone");
            if(!authorized) {
                cordova.plugins.diagnostic.requestMicrophoneAuthorization(function(status){
                    if(status === cordova.plugins.diagnostic.permissionStatus.GRANTED){
                        console.log("Microphone use is authorized");
                    }
                 }, function(error){
                     console.error("The following error occurred: "+error);
                 });
            }
            else {
                var speechContainer = document.getElementById('speech');
                speechContainer.style.backgroundImage = "url('img/speech-bg.png')";
                speechContainer.onclick = app.startListening;
            }

        }, function(error){
            console.error("The following error occurred: "+error);
        });
    },

    startListening: function() {

        var elem = document.getElementById('speechResults');
        elem.innerHTML = "";
        let options = {
          language: 'en-US',
          matches: 1
        }

        var speechContainer = document.getElementById('speech');
        speechContainer.style.backgroundImage = "url('img/listen-bg.png')";
        speechContainer.onclick = function() {console.log('Do nothing..');}

        function createEditFields(match, index) {
            var div = document.createElement('div');
            var textField = document.createElement('input');
            textField.id = 'text' + index;
            textField.value = match;
            textField.style.visibility = "hidden";

            var buttonUpdate = document.createElement('button');
            buttonUpdate.id = 'button2' + index;
            buttonUpdate.innerHTML = '<u>Update</u>';
            buttonUpdate.style.visibility = "hidden";
            buttonUpdate.onclick = function() {
                var field = document.getElementById('text' + index);
                var uiField = document.getElementById('p-' + index);
                uiField.innerHTML = field.value;
                field.style.visibility = "hidden";
                document.getElementById('button2' + index).style.visibility = "hidden";
            };

            var button = document.createElement('button');
            button.id = 'button' + index;
            button.innerHTML = '<u>Edit</u>';
            button.style.background = 'none';
            button.style.border = 'none';
            button.style.cursor = 'pointer';
            button.style.color = 'white';
            button.onclick = function() {
                var field = document.getElementById('text' + index);
                field.style.visibility = "visible";
                var field2 = document.getElementById('button2' + index);
                field2.style.visibility = "visible";
            };

            var buttonPub = document.createElement('button');
            buttonPub.id = 'buttonPub' + index;
            buttonPub.innerHTML = '<u>Publish</u>';
            buttonPub.style.background = 'none';
            buttonPub.style.border = 'none';
            buttonPub.style.cursor = 'pointer';
            buttonPub.style.color = 'white';
            buttonPub.onclick = function() {
                var uiField = document.getElementById('p-' + index);
                window.alert('Publish ' + uiField.innerHTML + ' to server done');
            };

            div.appendChild(button);
            div.appendChild(buttonPub);
            div.appendChild(textField);
            div.appendChild(buttonUpdate);
            div.appendChild(document.createElement('br'));
            return div;
        }

        window.plugins.speechRecognition.startListening(matches => {
            var index = -1;
            matches.forEach(match => {
                index++;
                elem.innerHTML += "<p id=\"p-"+ index +"\">" + match + "</p>&nbsp;&nbsp;";
                elem.appendChild(createEditFields(match, index));
            });
          },
        (onerror) => console.log('error: ' + onerror),
        options);
    },

    stopListening: function() {
        window.plugins.speechRecognition.stopListening(() => console.log('Finished listening..'));
    },

    showUI: function(elem) {
        elem.style.display = "none";
        document.getElementById("tabs").style.display = "block";
        document.getElementById("h1header").style.display = "block"
    },

    showChartDetails: function(imgPath) {
        var chartImg = document.getElementById('chartsData');
        chartImg.src = imgPath;
    },

    editImageText: function(selected) {
        var analyzedTextElement = selected.parentNode.children[1];
        if(analyzedTextElement.innerHTML === '') {
            analyzedTextElement.innerHTML = 'Please analyze image 1st..';
            return;
        }

        var editDiv = document.getElementById('editImageText');
        editDiv.style.display = 'block';
        editDiv.getElementsByTagName('input')[0].value = analyzedTextElement.innerHTML;
        window.elemToEdit = analyzedTextElement;
    },

    deleteImage: function(selected) {
        var parent = document.getElementById('imageGrid');
        parent.removeChild(selected.parentNode.parentNode);
    },

    updateImageText: function(updateElement) {
        updateElement.parentNode.style.display = "none";
        var updatedText = updateElement.parentNode.getElementsByTagName('input')[0].value;
        window.elemToEdit.innerHTML = updatedText;
    },

    lookupLibrary: function() {

        window.imagePicker.getPictures(
            function(results) {
                for (var i = 0; i < results.length; i++) {
                    window.plugins.Base64.encodeFile(results[i], (imgData => {
                        app.displayImage(imgData.replace('data:image/*;charset=utf-8;base64,',''));
                    }));
                }
            }, function (error) {
                console.log('Error: ' + error);
            }, {
                maximumImagesCount: 5,
                width: 800
            }
        );

        // var options = app.getCameraOptions(Camera.PictureSourceType.PHOTOLIBRARY);
        // navigator.camera.getPicture(function cameraSuccess(imageUri) {
        //     app.displayImage(imageUri);
        // }, function cameraError(error) {
        //     console.debug("Unable to obtain picture: " + error, "app");
        // }, options);
    },

    publishAllImages: function() {
        var parent = document.getElementById('imageGrid');
        if(parent.children.length > 1) {
            alert('Images uploaded to server..');
        } else {
            alert('Please click new images or import from library to upload');
        }
    }
};