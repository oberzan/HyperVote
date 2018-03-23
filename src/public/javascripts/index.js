$(() => {

  $('#ballots form').submit(e => {
    let form = $(e.currentTarget);
    e.preventDefault();

    console.log(form);
    var url = form.closest('form').attr('action'),
        data = form.closest('form').serialize();

    form.find('button').prop('disabled', true);
    form.find('.token').prop('disabled', true);

    $.ajax({
      url: url, //ballot.title,
      type:'post',
      data:data,
      success: data => {
        console.log("success");
        console.log(data);
      },
      error: err => {
        console.log("error");
        console.log(err);
      },
      complete: x => {
        console.log("complete");
        console.log(x);
        form.find('button').prop('disabled', false);
        form.find('.token').prop('disabled', false);
      }
    });
  });

});

