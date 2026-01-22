$(document).ready(function() {

    const videoElement = $('#video')[0];
    const recordedVideoElement = $('#recordedVideo')[0];
    const recordButton = $('#recordButton');
    const stopButton = $('#stopButton');
    const uploadButton = $('#uploadButton'); // This can be removed if not needed anymore
    const countdownElement = $('.v-countdown');


    let recorder;
    let cameralet;
    let fileDownloadURLSaved;

    recordButton.on('click', async function(e) {
        e.preventDefault();

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoElement.srcObject = stream;

        $('.recordcol').hide();
        $('.video-container').show();
        $('.video-preview-load').html('');
        $('#video-preview').hide();

        // $('.video-preview').hide();
        // $('.video-container').html('');
        // $('#video').hide();
        // $('.savecol').hide();

        startCountdown(10, function() {
            // $('.video-container').html('');
            $('.video-preview-load').html('');
            // $('#video-preview').hide();

            $('.video-container').hide();
            $('#video').show();
            $('.stopcol').show();
            
            
            // capture camera and/or microphone
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(function(camera) {

                cameralet = camera;

                // preview camera during recording
                document.getElementById('video').muted = true;
                document.getElementById('video').srcObject = camera;

                // recording configuration/hints/parameters
                var recordingHints = {
                    type: 'video'
                };

                // initiating the recorder
                recorder = RecordRTC(camera, recordingHints);

                 // starting recording here
                recorder.startRecording(); 

            }).catch(function(error) {
                console.error('Error accessing media devices:', error);
                // Display error message to the user or take appropriate action
            });
            
        });
        
        return false;
    });


    stopButton.on('click', function(e) {
        e.preventDefault();
     
        // $('html, body').animate({
        //     scrollTop: $('#experienceandintent').offset().top
        // }, 1000);
        
        $('.video-preview-load').html('<br/><br/><br/><p class="padding-25 text-center text-white f_400">Loading preview...</p><br/><br/><br/>');
        $('.video-preview').show();
        $('#video').hide();

        recordButton.html('<i class="fa fa-refresh"></i> Re-record');
        $('.recordcol').show();
        $('.stopcol').hide();
        // $('.savecol').show();

        

        // $('html, body').animate({
        //     scrollTop: $('#experienceandintent').offset().top
        // }, 1000);



        // stop recording
        recorder.stopRecording(function() {
                                
            // get recorded blob
            var blob = recorder.getBlob();

            // generating a random file name
            var fileName = getFileName('webm');

            // we need to upload "File" --- not "Blob"
            var fileObject = new File([blob], fileName, {
                type: 'video/webm'
            });

            var formData = new FormData();

            // recorded data
            formData.append('video-blob', fileObject);

            // file name
            formData.append('video-filename', fileObject.name);

            // document.getElementById('header').innerHTML = 'Uploading to PHP using jQuery.... file size: (' +  bytesToSize(fileObject.size) + ')';

            // upload using jQuery
            $.ajax({
                url: baseurl+'/'+submitvideoendpoint+'/fileupload', // replace with your own server URL
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                type: 'POST',
                success: function(response) {
                    // if (response === 'success') {
                        // alert('successfully uploaded recorded blob');
                        $('.video-preview-load').html('');
                        $('#video-preview').show();
                        $('#video').attr('controls','controls');

                        

                        // file path on server
                        // var fileDownloadURL = baseurl+'data/' + fileObject.name;
                        var fileDownloadURL = baseurl+'data/' + response;
                        fileDownloadURLSaved = fileDownloadURL;

                        $('.become_q1_field').val(response);

                        // preview the uploaded file URL
                        // document.getElementById('header').innerHTML = '<a href="' + fileDownloadURL + '" target="_blank">' + fileDownloadURL + '</a>';

                        // preview uploaded file in a VIDEO element
                        // document.getElementById('video-preview-src').src = fileDownloadURL;
                        // document.getElementById('video-preview').load();

                        setTimeout(function() {
                            // Update the src attribute with the new video URL
                            document.getElementById('video-preview-src').src = fileDownloadURL;
                    
                            // Reload the video element to play the new video
                            const videoElement = document.getElementById('video-preview');
                            videoElement.load();  // Reinitialize the video with the new source
                            
                            $('.video-preview').show();
                            $('.record-submit-btn').show();   

                        }, 2000); // 3000 milliseconds = 3 seconds

                        
                        // $('#video').attr('src', fileDownloadURL);
                        // $('#video').html('<source id="video-preview-src" src="'+fileDownloadURL+'" type="video/webm">');
                        // $('.video-preview video')[0].load();

                        // document.getElementById('video-preview-src').load();
                        // $('#video-preview-src').show();

                         // release camera
                        // $('.video-preview video source').attr('src', fileDownloadURLSaved);
                        // $('.video-preview video')[0].load();


                        // open uploaded file in a new tab
                        // window.open(fileDownloadURL);
                    // } else {
                    //     alert('error/failure'); // error/failure
                    // }
                }
            });

           
            document.getElementById('video').srcObject = null;
            cameralet.getTracks().forEach(function(track) {
                track.stop();
            });

        });
       


        return false;
    });
    
     

    // this function is used to generate random file name
    function getFileName(fileExtension) {
        var d = new Date();
        var year = d.getUTCFullYear();
        var month = d.getUTCMonth();
        var date = d.getUTCDate();
        return 'RecordRTC-' + year + month + date + '-' + getRandomString() + '.' + fileExtension;
    }

    function getRandomString() {
        if (window.crypto && window.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
            var a = window.crypto.getRandomValues(new Uint32Array(3)),
                token = '';
            for (var i = 0, l = a.length; i < l; i++) {
                token += a[i].toString(36);
            }
            return token;
        } else {
            return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
        }
    }

    function startCountdown(seconds, callback) {
        let remaining = seconds;
        countdownElement.text(remaining).show();

        const interval = setInterval(() => {
            remaining -= 1;
            countdownElement.text(remaining);
            if (remaining <= 0) {
                clearInterval(interval);
                countdownElement.hide();
                callback();
            }
        }, 1000);
    }

});
