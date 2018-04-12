$(() => {
  
  /** SEND TOKENS **/
  $('.btn.tokens').click((x) => {
    $(x.target).prop('disabled', true);
    let ballot = $(x.target).siblings('.title').first().text();
    let url = [window.location.origin,
      'api',
      'ballot',
       ballot,
      'tokens'
    ].join('/');
    
    let errBar = $('#ballotErrorBar');
    let successBar = $('#ballotSuccessBar');
    $.ajax({
      type: "POST",
      url: url,
      error: err => {
        console.log(err);
        if(err.status === 403)
          window.location.replace('/authenticate');
        if(err.status == 500) {
          errBar.text(err.responseJSON);
          errBar.show();
        }
        $(x.target).prop('disabled', false);
      },
      success: data => {
        $(x.target).hide();
        console.log(data);
        successBar.text(data);
        successBar.show();
      }
    })
  });

  /** DATE PICKER **/ 
  let d = new Date();
  $('#enddatetimepicker').datetimepicker({
    format: 'DD.MM.YYYY HH:mm',
    extraFormats: [ 'DD.MM.YY' ],
    minDate: d.setDate(d.getDate()-1),
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
  $('#addOptionBtn').click(function() {
    let options = 
      $('#optionsUl li').map(function() {
        return this.innerText;
      }).get();

    let option = $('#optionInput').val();
    
    if(option.length < 1) {
      alert('Option name too short.');
      return;
    }
    if(options.includes(option)) {
      alert('Option already exists');
      return;
    }

    $('#optionInput').val('');
    $('#optionsUl').append(
      '<li class="list-group-item d-flex justify-content-between align-items-center">\
        <input type="hidden" name="option" value="'+ option +'">' +
        option +
        '<i class="far fa-trash-alt"></i>'+
      '</li>');
  });

  $('#ballotForm').submit((e) => {
    e.preventDefault();
    let form = e.currentTarget;
    $(form).find('input[type=submit]').prop('disabled', true);

    if($('#optionsUl').children().length < 2) {
      console.log("Not enough options");
      console.log($('.options .invalid-feedback'));
      $('.options .invalid-feedback').show().text("A ballot needs at least 2 options");
      return false;
    }

    $.ajax({
      url:'/api/ballot',
      type:'post',
      data:$(form).serialize(),
      success:function(){
        form.reset();
        $(form).find('ul li').remove();
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
  $(document).on('click', '.options .delete', function() {
    console.log($(this));
    console.log(location);
    let li = $(this).parent();
    li.find('button').prop('disabled', true);

    li.addClass('list-group-item-secondary');
    li.children().first().after('<i class="fa fa-spinner fa-spin" style="font-size:24px"></i>');

    let option = li.find('span').text();
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
  });
  $(document).on('click', '#optionsUl svg', function() {
    $(this).parent().remove();
  });

});