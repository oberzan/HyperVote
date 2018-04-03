$(function () {
  
  /** SEND TOKENS **/
  $('.btn.tokens').click((x) => {
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
        if(err.status == 500) {
          errBar.text(err.responseJSON);
          errBar.show();
        }
      },
      success: data => {
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
      //$("#datetimepicker input").val(submitDateString);
    });

  /** ADD OPTION **/ 
  $('#addOptionBtn').click(function() {
    let options = 
      $('#optionsUl li').map(function() {
        //console.log(this.innerText);
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

  $('#ballotForm').submit(function() {
    if($('#optionsUl').children().length < 2) {
      console.log("Not enough options");
      console.log($('.options .invalid-feedback'));
      $('.options .invalid-feedback').show().text("A ballot needs at least 2 options");
      return false;
    }
    return true;
  });


  // jQuery.validator.addMethod("minoptions", function(value, element, params) {
  //   console.log('minoptions')
  //   console.log(params);
    
  //   let nOptions = $(element).parent().siblings('ul').first().children().length;
  //   console.log(nOptions);
  //   return nOptions >= params;
  // }, 'A ballot needs at least 2 options');
  
  // $('#ballotForm').validate({
  //   debug: true,
  //   onkeyup: false,
  //   onclick: false,
  //   onfocusout: false,
  //   errorClass: 'is-invalid',
  //   errorElement: 'div',
  //   errorPlacement: function(error, element) {
  //     console.log("errorPlacement");
  //     console.log(error);
  //     console.log(element);
  //   },
  //   highlight: function(element, errorClass, validClass) {
  //     console.log($(element));
  //     console.log("#" + element.id + "-error");
  //     console.log($("#" + element.id + "-error"));
  //     console.log($(element.form).parent().find("div"));
  //     $(element).addClass(errorClass).removeClass(validClass);
  //     $("#" + element.id + "-error")
  //       .addClass('invalid-feedback');
  //   },
  //   nhighlight: function(element, errorClass, validClass) {
  //     $(element).removeClass(errorClass).addClass(validClass);
  //     $(element.form).find("label[for=" + element.id + "]")
  //       .removeClass('invalid-feedback');
  //   },
  //   invalidHandler: function(event, validator) {
  //     // 'this' refers to the form
  //     var errors = validator.numberOfInvalids();
  //     if (errors) {
  //       var message = errors == 1
  //         ? 'You missed 1 field. It has been highlighted'
  //         : 'You missed ' + errors + ' fields. They have been highlighted';
  //       $("div.error span").html(message);
  //       $("div.error").show();
  //     } else {
  //       $("div.error").hide();
  //     }
  //   },
  //   rules: {
  //     optionInput: {
  //       minoptions: 2
  //     }
  //   }
  // });
  $(document).on('click', '.options .delete', function() {
    console.log($(this));
    console.log(location);
    let li = $(this).parent();

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
      location.reload();
    }).fail( err => {
      console.log(err);
      console.log(err.statusCode());
    });

    //$(this).parent().remove();
  });
  $(document).on('click', '#optionsUl svg', function() {
    $(this).parent().remove();
  });

});