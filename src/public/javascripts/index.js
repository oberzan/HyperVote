$(() => {

  $('.card').each((i, element) => {
    console.log($(element));
    if ($(element).find('.chart').length < 1)
      return;
    let ballot = $(element).find('.card-header btn').text().trim();
    console.log(ballot);
    
    $.ajax({
      url: '/api/ballot/' + ballot + '/results', //ballot.title,
      type:'get',
      success: data => {
        console.log("success");
        console.log(data);
      },
      error: err => {
        console.log("error");
        console.log(err);
      } //,
      // complete: x => {
      //   console.log("complete");
      //   console.log(x);
      //   form.find('button').prop('disabled', false);
      //   form.find('.token').prop('disabled', false);
      // }
    });
  });

  // for(ballot in $('.card')) {
  //   console.log
  // }

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

