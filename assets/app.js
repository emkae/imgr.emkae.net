/*jshint esversion: 6 */
(function(window, document) {
  'use strict';
  var _USER_ID, _USER_KEY, showSection, getAjax, showMessage, chunkyUpload,
      _MAX_CHUNK_SIZE_IN_BYTES, _MAX_UPLOAD_RETRIES, _UPLOAD_RETRY_TIMEOUT_IN_SECONDS;
  _MAX_CHUNK_SIZE_IN_BYTES = 1024*100; // 100 KB
  _MAX_UPLOAD_RETRIES = 5;
  _UPLOAD_RETRY_TIMEOUT_IN_SECONDS = 10;
  getAjax = function(doParam, cb) {
    $.ajax({
      method: "GET",
      url: "ajax.php?do=" + doParam
    })
    .done(function( msg ) {
      if (cb && typeof cb === 'function') {
        cb(msg);
      }
    });
  };
  showMessage = function(msg, title, type, dismissInSeconds) {
    msg = msg || '';
    if (title !== undefined && (title !== null && title !== false)) {
      title =  '<strong>' + title + '</strong> ';
    } else {
      title = '';
    }
    type = type || 'warning';
    dismissInSeconds = dismissInSeconds || 5;
    var $tpl;
    var tpl = `<div class="alert alert-${type} alert-dismissible" role="alert">
      <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
      ${title}${msg}
    </div>`;
    $tpl = $(tpl);
    $(app).prepend($tpl);
    if (dismissInSeconds > 0) {
      setTimeout(function(){
        $tpl.remove();
      }, (dismissInSeconds * 1000));
    }
  };
  $('#nav-link-upload').on('click', function(evt){
    $('#file-list').html('');
    $('#uploadform').get(0).reset();
    showSection('upload');
  });
  $('#nav-link-list').on('click', function(evt){
    getAjax('list', function(res) {
      var $list, list_item, tpl, hashedfilename, $row, i;
      i = 0;
      $list = $('#archive');
      // reset list
      $list.html('');
      $row = $('<div class="row"></div>');
      if (res.items && res.items.length) {
        res.items.forEach(function(item){
          hashedfilename = item.filehash + '.' + item.fileext;
          tpl = `
            <div class="col-sm-6 col-md-4">
              <div class="thumbnail">
                <a href="i/${hashedfilename}"><img src="i/${hashedfilename}" /></a>
                <div class="caption">
                  <input class="filename form-control" value="${item.filename}" />
                  <p><a href="#" data-filehash="${item.filehash}" data-fileext="${item.fileext}" class="btn btn-danger delete-item" role="button">Delete</a></p>
                </div>
              </div>
            </div>`;
          $row.append($(tpl));
        });
        $list.append($row);
      }
      $('#archive a.delete-item').on('click', function(evt) {
        evt.preventDefault();
        var $this, fileHash, fileExt;
        $this = $(this);
        fileHash = this.getAttribute('data-filehash');
        fileExt = this.getAttribute('data-fileext');
        getAjax('delete&filehash=' + fileHash + '&fileext='+fileExt+'&key='+_USER_KEY, function(delRes){
          if (delRes.success === true) {
            $this.closest('.thumbnail').parent().remove();
          } else {
            showMessage(delRes.msg, false, 'danger');
          }
        });
      });
      showSection('list');
    });
  });
  $('#nav-link-logout').on('click', function(evt){
    evt.preventDefault();
    getAjax('logout', function(res) {
      showSection('login');
    });
  });
  showSection = function(sectionId) {
    var $nav, $section;
    $nav = $('#nav');
    $section = $('#' + sectionId + '-section');
    $('section').hide();
    if (sectionId === 'login') {
      $nav.hide();
    } else {
      $nav.find('li').removeClass('active');
      $section.addClass('active');
      $nav.show();
    }
    $section.show();
  };
  var fadeOut = function(el, cb) {
    el.style.opacity = 1;
    (function fade() {
      if ((el.style.opacity -= 0.1) < 0) {
        el.style.display = "none";
        cb();
      } else {
        requestAnimationFrame(fade);
      }
    })();
  };
  var fadeIn = function(el, display) {
    el.style.opacity = 0;
    el.style.display = display || "block";
    (function fade() {
      var val = parseFloat(el.style.opacity);
      if (((val += 0.1) > 1) === false) {
        el.style.opacity = val;
        requestAnimationFrame(fade);
      }
    })();
  };
  $.ajax({
    method: "GET",
    url: "ajax.php?do=loggedInCheck"
  })
  .done(function( msg ) {
    if (msg.success) {
      _USER_ID = msg.data.userId;
      _USER_KEY = msg.data.userKey;
      showSection('upload');
    }
    setTimeout(function(){
      fadeOut(loader, function(){
        fadeIn(app);
      });
    }, 500);
  });
  var do_login = function(evt) {
    evt.preventDefault();
    $(app).hide();
    fadeIn(loader);
    $.ajax({
      method: "POST",
      url: "ajax.php?do=login",
      data: {
        email: $('#email').val(),
        password: $('#password').val()
      }
    })
    .done(function( msg ) {
      setTimeout(function(){
        fadeOut(loader, function(){
          fadeIn(app);
        });
      }, 500);
      if (msg.success) {
        _USER_ID = msg.data.userId;
        _USER_KEY = msg.data.userKey;
        showSection('upload');
      }
    });
  };
  $('#loginform').on('submit', do_login);

  var fileupload = function() {
    var filesUpload = document.getElementById("files"),
        dropArea = document.getElementById("drop-area"),
        fileList = document.getElementById("file-list");

    function traverseFiles (files) {
      if (typeof files !== "undefined") {
        for (var i=0, l=files.length; i<l; i++) {
          chunkyUpload(files[i]);
        }
      }
      else {
        fileList.innerHTML = "No support for the File API in this web browser";
      }
    }

    filesUpload.addEventListener("change", function () {
      traverseFiles(this.files);
    }, false);

    dropArea.addEventListener("dragleave", function (evt) {
      var target = evt.target;

      if (target && target === dropArea) {
        this.className = "";
      }
      evt.preventDefault();
      evt.stopPropagation();
    }, false);

    dropArea.addEventListener("dragenter", function (evt) {
      this.className = "over";
      evt.preventDefault();
      evt.stopPropagation();
    }, false);

    dropArea.addEventListener("dragover", function (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }, false);

    dropArea.addEventListener("drop", function (evt) {
      traverseFiles(evt.dataTransfer.files);
      this.className = "";
      evt.preventDefault();
      evt.stopPropagation();
    }, false);
  };
  chunkyUpload = function(file) {
    var loaded = 0;
    var step = _MAX_CHUNK_SIZE_IN_BYTES;
    var maxFailures = _MAX_UPLOAD_RETRIES;
    var totalFailures = 0;
    var fileHash = null;
    // total size of file
    var total = file.size;
    // Current Chunk Index
    var currentChunkIndex = 1;
    // Total amount of Chunks
    var totalChunks = Math.ceil(total/_MAX_CHUNK_SIZE_IN_BYTES);
    // starting position
    var start = 0;
    var reader = new FileReader();
    // a single chunk in starting of step size
    var blob = file.slice(start, step);
    // reading that chunk. when it read it, onload will be invoked
    reader.readAsDataURL(blob);
    // create upload bar for file
    var progressBarTemplate = `
      <div>
        <div class="filename">${file.name}</div>
        <div class="progress">
          <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">
            0%
          </div>
        </div>
      </div>`;
    var $uploadBar = $(progressBarTemplate);
    $('#filelist').append($uploadBar);
    var $progressBar = $uploadBar.find('.progress-bar');
    reader.onload = function(e) {
      var d = {
        fileChunk: e.target.result,
        fileHash: fileHash
      };
      $.ajax({
        url: "ajax.php?do=upload",
        type: "POST",
        headers: {
          "x-file-name": file.name,
          "x-file-chunks-current": currentChunkIndex,
          "x-file-chunks-total": totalChunks,
          "x-file-size": total
        },
        // processData: false,
        data: d // `d` is the chunk got by readAsBinaryString(...)
      }).done(function(r) { // if `d` is uploaded successfully then ->
        var nextStep;
        if (fileHash === null && r && r.data.fileHash) {
          fileHash = r.data.fileHash;
        }
        // increase current chunk index
        currentChunkIndex++;
        // Reset failure counter
        totalFailures = 0;
        var percentUploaded = Math.ceil(100/totalChunks*currentChunkIndex);
        $progressBar.attr('aria-valuenow', percentUploaded);
        $progressBar.attr('style', 'width: ' +percentUploaded + '%');
        $progressBar.html(percentUploaded + '%');
        // increasing loaded which is being used as start position for next chunk
        loaded = (loaded + step);
        nextStep = (loaded + step);
        // If file is not completely uploaded
        if (loaded <= total) {
          // Getting next chunk
          if (nextStep <= total) {
            blob = file.slice(loaded, nextStep);
          } else {
            blob = file.slice(loaded, total);
          }
          // Reading it through file reader which will call onload again.
          // So it will happen recursively until file is completely uploaded.
          reader.readAsDataURL(blob);
        } else { // if file is uploaded completely
          // just changed loaded which could be used to show status.
          loaded = total;
          $uploadBar.remove();
          showMessage('File ' + file.name + ' uploaded successfully.', 'Success', 'success');
        }
      }).fail(function(r){ // if upload failed
        // Try `_MAX_UPLOAD_RETRIES` times to upload file even on failure
        if ((totalFailures++) < _MAX_UPLOAD_RETRIES) {
          setTimeout(function(){
            reader.readAsDataURL(blob);
          }, (_UPLOAD_RETRY_TIMEOUT_IN_SECONDS * 1000));
        } else { // if file upload has failed `_MAX_UPLOAD_RETRIES` times
          showMessage('Could not upload file ' + file.name, 'File upload failed');
          $uploadBar.remove();
        }
      });
    };
  };
  // init fileupload
  fileupload();
})(window, document);

