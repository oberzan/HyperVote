$(() => {

  $(document).on('focus', '#secret.is-invalid', e => {
    let secretInput = $(e.currentTarget);
    secretInput.removeClass("is-invalid");
  })

  $('#auth').submit(e => {
    logger.verbose("Submitting ");
    logger.debug(e);
    let form = $(e.currentTarget);

    e.preventDefault();
    e.stopImmediatePropagation();

    let data = form.serialize();

    $.ajax({
      url: e.currentTarget.baseURI, //ballot.title,
      type: 'post',
      data: data,
      success: data => {
        logger.info("Successfully authenticated");
        logger.debug(data.token);
        if(data.user === "admin") {
          window.location.replace("admin");
        }
        //sessionStorage.setItem("hypervote_jwt", data.token);

        // token.addClass('is-valid');
        // token.removeClass('is-invalid');
      },
      error: err => {
        logger.debug("error");
        logger.error(err);
        $("#secret").addClass("is-invalid");
        //$("#secret").siblings(".invalid-feedback").show();

        // token.addClass('is-invalid');
        // token.removeClass('is-valid');
      },
      complete: x => {
        logger.debug("complete");
        logger.debug(x);
        // form.find('button').prop('disabled', false);
        // token.prop('disabled', false);
      }
    });

  });
});