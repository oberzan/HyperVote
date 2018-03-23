$(() => {


  $('#ballots form').submit(e => {
    let form = $(e.currentTarget);
    e.preventDefault();

    console.log(form);
    var url = form.closest('form').attr('action'),
        data = form.closest('form').serialize();
    $.ajax({
      url: url, //ballot.title,
      type:'post',
      data:data,
      success: x => {
        console.log(x);
        //whatever you wanna do after the form is successfully submitted
      }
    });
  });

});

