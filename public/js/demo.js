/**
 * Copyright 2014 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
var snapshots = [];
/*global $:false */

/**
 * Anonymous function, to use as a wrapper
 */
(function() {

  var library = {"featureVectors":[
                {"imageNumber":"img1", "featureName1":"Black","featureProb1":"70", "featureName2":"Color", "featureProb2":"68", "featureName3":"Shoes","featureProb3":"60", "featureName4":"Pole_Vault","featureProb4":"54"}, 
                {"imageNumber":"img2", "featureName1":"BW","featureProb1":"74", "featureName2":"Skyline_(night)", "featureProb2":"65", "featureName3":"Black","featureProb3":"63", "featureName4":"Pigeon","featureProb4":"56"},
                {"imageNumber":"img3", "featureName1":"Black","featureProb1":"73", "featureName2":"City_Scene", "featureProb2":"61", "featureName3":"","featureProb3":"", "featureName4":"","featureProb4":""},
                {"imageNumber":"img4", "featureName1":"Color","featureProb1":"73", "featureName2":"Photo", "featureProb2":"67", "featureName3":"Human","featureProb3":"65", "featureName4":"Indoors","featureProb4":"61"},
                {"imageNumber":"img5", "featureName1":"Color","featureProb1":"72", "featureName2":"Human", "featureProb2":"71", "featureName3":"Photo","featureProb3":"68", "featureName4":"Face","featureProb4":"68"},
                {"imageNumber":"img6", "featureName1":"Fabric","featureProb1":"73", "featureName2":"Face", "featureProb2":"72", "featureName3":"Human","featureProb3":"70", "featureName4":"Person_View","featureProb4":"54"},
                {"imageNumber":"img7", "featureName1":"Color","featureProb1":"75", "featureName2":"Shoes", "featureProb2":"67", "featureName3":"Indoors","featureProb3":"63", "featureName4":"Photo","featureProb4":"61"},
            ]};
  
  
  function processImage() {
    $('.selected-classifier').text('Classifier: ' + $("select[name='classifier'] option:selected").text());
    $('.loading').show();
    $('.result').show();
    $('.error').hide();
    $('.data').empty();

    $('.image-radio').each(function() {
      $(this).prop('disabled', true);
    });
    $('.image-options').addClass('disabled');
  }

  /**
   * Show the service results in the HTML
   * @param  {Object} results e.g
   * {
   *   "classifier": "0",
   *   "images": [{
   *   "image_id": "0",
   *   "image_name": "",
   *   "labels": [{
   *     "label_name": "",
   *     "label_score": ""
   *   }]
   * }]
   * }
   *
   */
  function showResult(results) {
    $('.loading').hide();

    if (!results || !results.images || !results.images[0]) {
      $('errorMsg').text('Error processing the request, please try again later.');
      return;
    }

    var labels = results.images[0].labels;

    if (!labels) {
      var classifier = $('#classifier').val();
      var message = 'No labels recognized in the image';

      if (classifier !== '0')
        message = 'No labels (from ' + classifier + ' grouping) recognized in the image';

      $('.empty-text').text(message);
      $('.empty-results').show();
    } else {
      $('.empty-results').hide();
    }

    if (!labels || labels.length === 0) {
      $('errorMsg').text('The image could not be classified');
      return;
    }
    var first = labels[0];

    populateTable(labels);

    $('.image_label').val(first.label_name);
    $('.image_score').text(first.label_score);
  }

  // populate table in results
  function populateTable(labels) {
    var htmlString = '<tbody>';

    for (var i = 0; i < labels.length; i++) {
      htmlString += '<tr>';
      htmlString += '<td>';
      htmlString += labels[i].label_name;
      htmlString += '</td>';
      htmlString += '<td>';
      htmlString += percentagify(labels[i].label_score) + '%';
      htmlString += '</td>';
      htmlString += '</tr>';
      
    }
    for (var j=0; j <labels.length; j++) {
     
      var testLabel = labels[j].label_name;
      var testProb = labels[j].label_score;
      console.log(testLabel);     
      
        
      
      var featureCount = featureCheck(testLabel,'Color',testProb, .74);
      featureCount = featureCount + featureCheck(testLabel,'Scene',testProb, .68, 5);
      console.log('featureCount is: ' +featureCount);
     
      
      
      
      
//      if(testLabel == 'Color'){
//        var benchMark = .74;
//        var difference = Math.abs(testProp - benchMark);  
//        console.log("We have a match for Color");
//        console.log("The difference is: " + difference);
//        if( difference < 5)
//         {          
//          k++;
//          console.log('k has been incremented');
//         }
//      }
      
    }
    if(featureCount > 5)
    {
      htmlString += '<tr>';
      htmlString += '<td>';
      htmlString += 'The Image was not poltical in nature...supposedly';
      htmlString += '</td>';
      htmlString += '</tr>';
    }
    
    if(featureCount < 5)
    {
      htmlString += '<tr>';
      htmlString += '<td>';
      htmlString += 'The Image was polticial in nature...supposedly';
      htmlString += '</td>';
      htmlString += '</tr>';
    }
    htmlString += '</tbody>';

    $('.data').append(htmlString);
  }

  function _error(xhr, status, error) {
    $('.loading').hide();
    $('.error').show();
    var response = JSON.parse(xhr.responseText);
    console.log(response.error.error);

    if (response.error.error == 500) {
      $('.error h4').text('The image format is not supported, try with another image.');
    }
  }

  // turns floating decimals into truncated percantages
  function percentagify(num) {
    return Math.floor(num * 100);
  }

  // submit event
  function classifyImage(imgPath) {
    processImage();
    $('.image-staged img').attr('src', imgPath);
    $('.image-staged').show();
    $('.upload-form').hide();
    $('.url-input').val(imgPath);

    // Grab all form data
    $.ajax({
      url: '/',
      type: 'POST',
      data: $('form').serialize(),
      success: showResult,
      error: _error
    });
  }

  $('#fileupload').submit(function (e) {
    e.preventDefault();
    return false;
  });

  // radio button image
  $('.image-radio').click(function() {
    var imgPath = $(this).next('label').find('img').attr('src');
    console.log(imgPath);
    classifyImage(imgPath);
  });

  // url image
  $('input[name="url"]').keypress(function(e) {
    var url = $(this).val();
    var self = $(this);

    if (e.keyCode === 13) {
      if (!isValidURL(url)) {
        $('.invalid-image-url').hide();
        $('.invalid-url').show();
        self.addClass('error-highlight');
      } else {
        $('.invalid-url').hide();
        $('.invalid-image-url').hide();
        imageExists(url, function(exists) {
          if (!exists) {
            $('.invalid-image-url').show();
            self.addClass('error-highlight');
          } else {
            $('.invalid-image-url').hide();
            classifyImage(url);
          }
        });
      }
    }
  });

  /**
   * Jquery file upload configuration
   * See details: https://github.com/blueimp/jQuery-File-Upload
   */
  $(function() {
    $('#fileupload').fileupload({
      dataType: 'json',
      dropZone: $('.dropzone'),
      acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
      maxFileSize: 5000000, // 5 MB
      add: function(e, data) {
        if (data.files && data.files[0]) {
          processImage();
          $('.upload-form').hide();
          var reader = new FileReader();
          reader.onload = function() {
            var image = new Image();
            image.src = reader.result;
            image.onload = function() {
              $('.image-staged').show();
              $('#image-staged').attr('src', this.src);
            };
          };
          reader.readAsDataURL(data.files[0]);
          data.submit();
        }
      },
      error: _error,
      done: function(e, data) {
        $('.status').hide();
        showResult(data.result);
      }
    });
  });

  function imageExists(url, callback) {
    var img = new Image();
    img.onload = function() { callback(true); };
    img.onerror = function() { callback(false); };
    img.src = url;
  }
  
  function featureCheck(testLabel,standLabel,testProb, standProb, threshold){
    if(testLabel == standLabel){      
      var k = 0;
      var difference = Math.abs(testProb - standProb);  
      console.log("We have a match for: " + standLabel);
      console.log("The difference is: " + difference);
      if( difference < threshold)
      {          
       k=1;
       console.log('k has been incremented');
      }
   }
   
    return difference;
  }
  
  
  
  function filter() {
    var video  = document.getElementById('video');
    $('#filter').show();
    video.muted = true;
  }
  
  function unfilter(){
    var video  = document.getElementById('video');
    $('#filter').hide();
    video.muted = false;
  }
  
  function shoot(){
    var video  = document.getElementById('video');
    var output = document.getElementById('output');
    
    var scaleFactor = 0.25;
    
    
    var w = video.videoWidth * scaleFactor;
    var h = video.videoHeight * scaleFactor;   
    var canvas = document.createElement('canvas');
        canvas.width  = w;
        canvas.height = h;
    var ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, w, h);
        var dataURL = canvas.toDataURL('image/jpeg');
        console.log('dataURI is: '+dataURL);
        output.innerHTML = '';
        output.src = dataURL;
      
        
        
          $.ajax({
              url: "/api/recognize",
              processData : false,
              type : "POST",
              data: dataURL
          })
          .done (function(data) {console.log("Success");} )
          .fail   (function()  { console.log("Error ")   ; })
          ;
       
//    snapshots.unshift(dataURI);
//    output.innerHTML = '';
//    for(var i=0; i<4; i++){
//      console.log(snapshots[i]);
//        output.appendChild(snapshots[i+1]);
//    }        
        
        //var random = Math.floor((Math.random() * 10) + 1);
//        console.log('Random number is: ' + random);
//        if(random < 5){
//          filter();
//        } else {
//          unfilter();
//        }
        //Create If statement to assess whether to put the filter in or not
       
  }
  
  //set up timer for acquiring still frame image every 5 seconds to be processed by Watson
  setInterval(shoot, 5000); 
  
  //Label Data as commerical or not for machine learning purposes
  
  document.getElementById("video").addEventListener('play', shoot, false);
  $('#filter').hide();
  
  document.getElementById("video").addEventListener("timeupdate", function() {
    if (this.currentTime >= 1 && this.currentTime <= 67) {
         unfilter();
     }
 }, false);
  document.getElementById("video").addEventListener("timeupdate", function() {
    if (this.currentTime >= 68 && this.currentTime <=98) {
         filter();
     }
 }, false);
  
  
  document.getElementById("video").addEventListener("timeupdate", function() {
    if (this.currentTime > 99 && this.currentTime <= 124) {
         unfilter();
     }
 }, false);
  
  document.getElementById("video").addEventListener("timeupdate", function() {
    if (this.currentTime >= 125 && this.currentTime <= 155) {
         filter();
     }
 }, false);
  
  document.getElementById("video").addEventListener("timeupdate", function() {
    if (this.currentTime >= 156 && this.currentTime <= 229) {
         unfilter();
     }
 }, false);
  document.getElementById("video").addEventListener("timeupdate", function() {
    if (this.currentTime >= 230 && this.currentTime <= 259) {
         filter();
     }
 }, false);
  document.getElementById("video").addEventListener("timeupdate", function() {
    if (this.currentTime >= 260 && this.currentTime <= 264) {
         unfilter();
     }
 }, false);
  document.getElementById("video").addEventListener("timeupdate", function() {
    if (this.currentTime >= 265 && this.currentTime <= 297) {
         filter();
     }
 }, false);
  
  document.getElementById("video").addEventListener("timeupdate", function() {
    if (this.currentTime >= 298 && this.currentTime <= 300) {
         unfilter();
     }
 }, false);
  
  document.getElementById("video").addEventListener("timeupdate", function() {
    if (this.currentTime >= 298 && this.currentTime <= 327) {
         filter();
     }
 }, false);
  
  document.getElementById("video").addEventListener("timeupdate", function() {
    if (this.currentTime >= 328 && this.currentTime <= 350) {
         unfilter();
     }
 }, false);
  document.getElementById("video").addEventListener("timeupdate", function() {
    if (this.currentTime >= 351 && this.currentTime <= 385) {
         filter();
     }
 }, false);
  document.getElementById("video").addEventListener("timeupdate", function() {
    if (this.currentTime >= 386 && this.currentTime <= 433) {
         unfilter();
     }
 }, false);
  document.getElementById("video").addEventListener("timeupdate", function() {
    if (this.currentTime >= 434 && this.currentTime <= 433) {
         filter();
     }
 }, false);
  document.getElementById("video").addEventListener("timeupdate", function() {
    if (this.currentTime >= 434 && this.currentTime <= 463) {
         filter();
     }
 }, false);
  document.getElementById("video").addEventListener("timeupdate", function() {
    if (this.currentTime >= 464 && this.currentTime <= 475) {
         unfilter();
     }
 }, false);
  document.getElementById("video").addEventListener("timeupdate", function() {
    if (this.currentTime >= 476 && this.currentTime <= 505) {
         filter();
     }
 }, false);
  document.getElementById("video").addEventListener("timeupdate", function() {
    if (this.currentTime >= 506 && this.currentTime <= 508) {
         unfilter();
     }
 }, false);
  document.getElementById("video").addEventListener("timeupdate", function() {
    if (this.currentTime >= 509 && this.currentTime <= 567) {
         filter();
     }
 }, false);
  document.getElementById("video").addEventListener("timeupdate", function() {
    if (this.currentTime >= 567 && this.currentTime <= 596) {
         unfilter();
     }
 }, false);
  document.getElementById("video").addEventListener("timeupdate", function() {
    if (this.currentTime >= 597 && this.currentTime <= 625) {
         filter();
     }
 }, false);
  document.getElementById("video").addEventListener("timeupdate", function() {
    if (this.currentTime >= 626) {
         unfilter();
     }
 }, false);
  
//  document.getElementById("video").addEventListener("timeupdate", function() {
//    if (this.currentTime >= 125 || this.currentTime <= 155) {
//         filter();
//     }
// }, false);
//  
//  document.getElementById("video").addEventListener("timeupdate", function() {
//    if (this.currentTime > 156) {
//         unfilter();
//     }
// }, false);

  $(document).on('dragover', function () {
    $('.dropzone label').addClass('hover');
  });

  $(document).on('dragleave', function () {
    $('.dropzone label').removeClass('hover');
  });

})();

