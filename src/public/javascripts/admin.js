$(() => {
  /** REAUTHENTICATION MODAL WINDOW **/
  setReauthenticationTimeout = () => {
    let cookieExpTime = sessionStorage.getItem('cookieExpTime');
    setTimeout(() => {
      $('#authModal').modal({backdrop:"static", keyboard:false});
    }, moment(cookieExpTime) - moment());
  }
  setReauthenticationTimeout();

  $('body').on('click', '.modal input[type="submit"]', e => {
    $('#auth').submit();
  });
  $(document).ajaxSuccess((e, xhr, settings) => {
    if(settings.url.indexOf('/authenticate') >= 0) {
      $('#authModal').modal('hide');
      setReauthenticationTimeout();
    }
  });

  /** SEND TOKENS **/
  sendTokens = (btn, title, addresses, cb) => {
    btn.prop('disabled', true);
    btn.before('<i class="fa fa-spinner fa-spin" style="font-size:24px"></i>');
    let url = [
      window.location.origin,
      'api',
      'ballot',
       title,
      'tokens'
    ].join('/');
    
    let errBar = $('#ballotErrorBar');
    let successBar = $('#ballotSuccessBar');
    $.ajax({
      type: "POST",
      url: url,
      data: {addresses: addresses},
      success: data => {
        // btn.hide();
        btn.prop('disabled', false);
        successBar.find('span').text(data);
        successBar.show();
        cb();
      },
      error: err => {
        console.log(err);
        if(err.status === 403)
          window.location.replace('/authenticate');
        if(err.status == 500) {
          errBar.text(err.responseJSON);
          errBar.show();
        }
        btn.prop('disabled', false);
      }
    }).done(() => {
      console.log('Done sending');
      btn.siblings('.fa-spinner').remove();
    });
  };

  // $('ul.ballots .tokens').click(e => {
  //   let title = $(e.currentTarget).siblings('.title').first().text();
  //   sendTokens($(e.currentTarget), title);
  // });

  $(document).on('click', '#addressList .tokens', e => {
    let title = $('#addressList .title').text();
    let addresses = $('#addressList li').map((i, el) => $(el).text().trim()).get();
    sendTokens($(e.target), title, addresses, () => {
        let li = $('ul.ballots > li').filter((i, el) => {
          return $(el).find('.title').text().trim() === title
        }).find('.address, .tokens').hide();
        $('#addressList').modal("hide");
      }
    );
  });

  /** DATE PICKER **/ 
  $('#enddatetimepicker').datetimepicker({
    format: 'DD.MM.YYYY HH:mm',
    extraFormats: [ 'DD.MM.YY' ],
    minDate: moment(),
    //sideBySide: true,
    stepping: 5
  });
  
  $('#enddatetimepicker').on("change.datetimepicker",
    function (e) {
      var submitDateString = '';
      console.log(e);
      if (e.date) {
        submitDateString = e.date.toISOString();
        console.log(submitDateString);
      }
    });

  /** ADD OPTION **/ 
  $('#addOptionBtn').click(() => {
    let options = 
      $('#optionsUl li').map(function() {
        return this.innerText.trim();
      }).get();

    let option = $('#optionInput').val().trim();
    
    if(option.length < 1)
      return alert('Option name too short.');
    if(options.includes(option))
      return alert('Option already exists');

    $('#optionInput').val('');
    $('#optionsUl').append(
      '<li class="list-group-item d-flex justify-content-between align-items-center">\
        <input type="hidden" name="option" value="'+ option +'">' +
        option +
        '<i class="far fa-trash-alt"></i>'+
      '</li>');
  });

  /* CREATE BALLOT FORM SUBMIT */ 
  $('#ballotForm').submit((e) => {
    e.preventDefault();
    let form = e.currentTarget;

    let ballots = 
      $('ul.ballots li').map((i, el) => {
        return el.innerText.trim();
      }).get();
    let ballot = $('#title').val().trim();
    if(ballots.includes(ballot))
      return alert('Ballot already exists');

    if($('#optionsUl').children().length < 2) {
      console.log("Not enough options");
      console.log($('ul.ballots .invalid-feedback'));
      $('.options .invalid-feedback').show().text("A ballot needs at least 2 options");
      return false;
    }

    $(form).find('input[type=submit]').prop('disabled', true);

    $.ajax({
      url:'/api/ballot',
      type:'post',
      data:$(form).serialize(),
      success:function(){
        // form.reset();
        // $(form).find('ul li').remove();
        location.reload();
      },
      error: err => {
        if (err.status === 403)
          window.location.replace('/authenticate');
        $(form).find('input[type=submit]').prop('disabled', false);
      }
  });

    return true;
  });

  /* DELETE A BALLOT */
  $(document).on('click', 'ul.ballots .delete', e => {
    let title = $(e.currentTarget).siblings('.title').text();
    $('#deleteModal .title').text(title);
    $('#deleteModal').modal({backdrop:"true", keyboard:true});
  });
  $('#deleteModal .delete').click(e => {
    let title = $('#deleteModal .title').first().text();
    let li = $('ul.ballots > li').filter((i, el) => {
      return $(el).find('.title').text().trim() === title
    });

    li.addClass('list-group-item-secondary');
    li.children().first().after('<i class="fa fa-spinner fa-spin" style="font-size:24px"></i>');

    let option = li.find('.title').text();
    let url = [window.location.origin,
              'api',
              'ballot',
               option
          ].join('/');

    console.log(url);
    
    $.ajax({
      type: "DELETE",
      url: url     
    }).done( data => {
      console.log("Successfully deleted " + option);
      li.remove();
      //location.reload();
    }).fail( err => {
      console.error(err);
      if (err.status === 403) {
        window.location.replace('/authenticate');
      } else {
        li.removeClass('list-group-item-secondary');
        li.find('.fa-spinner').remove();
        li.find('button').prop('disabled', false);
      }
    });
    $('#deleteModal').modal('hide');
  });

  $(document).on('click', '#optionsUl svg', e => {
    $(e.currentTarget).parent().remove();
  });

  /* OPEN ADDRESS LIST MODAL */
  $(document).on('click', 'ul.ballots .address', e => {
    let title = $(e.currentTarget).siblings('.title').text().trim();
    // let button = $(e.currentTarget).siblings('button.tokens');

    let titleSpan = $('#addressList .modal-header .title');
    if(titleSpan.text().trim() !== title)
      $('#addressList ul').html("");
    titleSpan.text(title);
    
    // if (button.length > 0 && button.is(':enabled')) 
    $('#addressList .tokens').show();
    // else
      // $('#addressList .tokens').hide();

    $('#addressList').modal({backdrop:"true", keyboard:true});
  });

  $('#addressList').on('hidden.bs.modal', () => {
    $('#addressList input[type="file"]').val("");
  });

  $(document).on('click', '#importAddresses svg', () => $('#importAddresses input').trigger('click'));

  // ADD ADDRESS
  addAddress = address => {
    let addresses = 
      $('#addressList li').map((i, li) => {
        return li.innerText.trim();
      }).get();

    if(address.length < 1)
      return;
    if(addresses.includes(address))
      return alert('Address already exists');

    $('#addressList ul')
      .append('<li class="list-group-item d-flex align-items-center"> \
                <span class="mr-auto">'+ address +'</span><i class="fas fa-minus remove"></i> \
              </li>');
  };  
  $(document).on('click', '#addressList .fa-plus', e => {
    let input = $(e.currentTarget).siblings('input');
    addAddress(input.val());
    input.val("");
    $('#addressList .tokens').prop('disabled', false);
  });

  // REMOVE ADDRESS
  $(document).on('click', '#addressList .remove', e => {
    if ($(e.currentTarget).parent().siblings().length < 1)
      $('#addressList .tokens').prop('disabled', true)
    $(e.currentTarget).parent().remove();    
  });

  // UPLOAD ADDRESSES FROM CSV FILE
  $('input[type="file"]').on('change', e => {
    let f = e.currentTarget.files[0];
    if(!f) 
      return;

    let reader = new FileReader();
    reader.onloadend = evt => {
      if (evt.target.readyState == FileReader.DONE) {
        let addresses = evt.target.result.split(",")
          .map(x => x.trim())
          .filter(x => x !== '');

        $('#addressList ul').html("");
        addresses.forEach(m => {
          addAddress(m)
        });
        if (addresses.length > 0) $('#addressList .tokens').prop('disabled', false);
      }
      $(e.currentTarget).val("");
    }
    reader.readAsBinaryString(f);
  });

});