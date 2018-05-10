$(() => {

  $(document).on('focus', '#secret.is-invalid', e => {
    let secretInput = $(e.currentTarget);
    secretInput.removeClass("is-invalid");
  })

  $('#auth').submit(e => {
    console.log("Submitting ");
    console.log(e);
    let form = $(e.currentTarget);

    e.preventDefault();
    e.stopImmediatePropagation();

    let data = form.serialize();

    $.ajax({
      url: e.currentTarget.action,
      type: 'post',
      data: data,
      success: data => {
        console.log("Successfully authenticated");
        console.log(data.token);
        sessionStorage.setItem('cookieExpTime', data.cookieExpTime);
        if(data.user === "admin" && window.location.pathname.indexOf('/admin') != 0) {
          window.location.replace("admin");
        }
        //sessionStorage.setItem("hypervote_jwt", data.token);

        // token.addClass('is-valid');
        // token.removeClass('is-invalid');
      },
      error: err => {
        console.error("error");
        console.error(err);
        if(err.status != 0)
          $("#secret").addClass("is-invalid");
        //$("#secret").siblings(".invalid-feedback").show();

        // token.addClass('is-invalid');
        // token.removeClass('is-valid');
      },
      complete: x => {
        console.log("complete");
        console.log(x);
        // form.find('button').prop('disabled', false);
        // token.prop('disabled', false);
      }
    });

  });
});