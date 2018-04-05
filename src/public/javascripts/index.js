$(() => {

  // Enable form submitting, when an option is selected
  $("input[type=radio]").change(e => {
    console.log($(e.currentTarget).parent().parent().parent().find('button'));
    $(e.currentTarget).parent().parent().parent().find('button').prop('disabled', false);
  });

  makeChart = (element) => {
    let options = [];
    $('.table tbody tr').each((i, x) => {
      let tds = $(x).find('td');
      let option = tds[0].innerText;
      let n = tds[1].innerText;
      options.push([option, parseInt(n)]);
    });

    // $.ajax({
    //   url: '/api/ballot/' + ballot + '/results', //ballot.title,
    //   type:'get',
    //   success: data => {
    //     console.log("success");
    //     console.log(data);

        let processedData = [];
        for (let key in options) {
          processedData.push([key, options[key]]);
        }
        
        drawChart = () => {
          let data = new google.visualization.DataTable();
          data.addColumn('string', 'Option');
          data.addColumn('number', 'Number of votes');
          data.addRows(options);

          // let data = google.visualization.arrayToDataTable(processedData);

          let chartOptions = {
            legend: 'none',
            title: 'Results of a ballot',
            pieSliceText: 'none',
            chartArea:{height:185}
          };

          let chart = new google.visualization.PieChart(element.querySelector('.chart'));
          chart.draw(data, chartOptions);
        }

        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart);

      // },
      // error: err => {
      //   console.log("error");
      //   console.log(err);
      // } //,
      // complete: x => {
      //   console.log("complete");
      //   console.log(x);
      //   form.find('button').prop('disabled', false);
      //   form.find('.token').prop('disabled', false);
      // }
    // });
  }

  // Draw charts for finished ballots
  $('.card').each((i, element) => {
    console.log($(element));
    if ($(element).find('.chart').length < 1)
      return;
    makeChart(element);    
  });
  // Draw chart for /:id
  console.log(1234);
  let bId = $('#ballot h1').text().trim();
  if(bId)
    makeChart(document.querySelector('#ballot'));



  // Remove token too short/long message when a valid token is entered
  $(document).on('change', '.token.is-invalid', e => {
    let tokenInput = $(e.currentTarget);
    if(tokenInput.val().length == 36) {
      tokenInput.removeClass('is-invalid');
    }
  });

  $('#ballots form, #ballot form').submit(e => {
    let form = $(e.currentTarget);
    let token = form.find('.token');

    e.preventDefault();
    e.stopImmediatePropagation();

    var url = form.closest('form').attr('action'),
        data = form.closest('form').serialize();
    console.log("Data:")
    console.log(data);

    if(form.find('.token').val().length < 36) {
      // form.find('.invalid-feedback').text("Token too short");
      form.find('.invalid-feedback').text("Prekratek žeton");
      token.addClass('is-invalid');
      token.removeClass('is-valid');
      return;
    }
    if(form.find('.token').val().length > 36) {
      // form.find('.invalid-feedback').text("Token too long");
      form.find('.invalid-feedback').text("Predolg žeton");
      token.addClass('is-invalid');
      token.removeClass('is-valid');
      return;
    }
    if(form.find("input[type=radio]:checked").length <= 0) {
      // Shouldn't happen
      return;
    }

    form.find('button').prop('disabled', true);
    token.prop('disabled', true);

    $.ajax({
      url: url, //ballot.title,
      type:'post',
      data:data,
      success: data => {
        console.log("success");
        console.log(data);

        token.addClass('is-valid');
        token.removeClass('is-invalid');
      },
      error: err => {
        console.log("error");
        console.log(err);

        token.addClass('is-invalid');
        token.removeClass('is-valid');
      },
      complete: x => {
        console.log("complete");
        console.log(x);
        form.find('button').prop('disabled', false);
        token.prop('disabled', false);
      }
    });
  });

});

