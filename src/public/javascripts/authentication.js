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
      url: e.currentTarget.baseURI, //ballot.title,
      type: 'post',
      data: data,
      success: data => {
        console.log("Successfully authenticated");
        console.log(data.token);
        if(data.user === "admin") {
          window.location.replace("admin");
        }
        //sessionStorage.setItem("hypervote_jwt", data.token);

        // token.addClass('is-valid');
        // token.removeClass('is-invalid');
      },
      error: err => {
        console.log("error");
        console.log(err);
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