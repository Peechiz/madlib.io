$(function(){
  var rawInputString;
  var userInputArray = [];
  var madlibName = '';
  var manifesto = $('.manifesto').text()


//--------------------Submit Text---------------------------//

  $('#submitText').click(function(){
    $('#progress').progress({percent:25});
    $(this).addClass('disabled');
    madlibName = $('#name').val() || 'The Communist Manifesto';
    // console.log(madlibName);
    $('.madlibName').text(madlibName);
    if ($('#input').val() === ''){
      inputStr = manifesto;
    }
    else {
      rawInputString = $('#input').val().trim()
      inputStr = rawInputString;
    }
    userInputArray = inputStr.split(/\n+|\s/g);
    console.log(userInputArray);
    userInputArray = userInputArray.reduce(function(arr,item,index){
      arr.push({
        'text':item,
        'wildcard':false,
        'index':index,
        'toggle': function(){
          if (this.wildcard === false ){
            this.wildcard = true;
          }
          else {
            this.wildcard = false;
          }
        },
        'wildcardText': null
      })
      return arr;
    },[])

    console.log(userInputArray);

    //fadout input1, fadin wildcard

    userInputArray.forEach(function(x){
      $('#wildcard > .form > .field:nth-of-type(1)').append(`<div data='${x.index}' class="ui basic toggle button tiny">${x.text}</div>`);
    })
    $('#wildcard > .form > .field:nth-of-type(2)').append('<button class="ui primary button" id="submitWildcards">Submit</button>')

    $('#wildcard > .form > .field:nth-of-type(1) > .button').click(function(){
      var word = $(this).text()
      console.log(word);
      $(this).toggleClass('basic');
      $(this).toggleClass('green');
      $(this).toggleClass('wildcard'); // active wildcard
      // toggle wildcard on object
      var index = $(this).attr('data');
      userInputArray[index].toggle();
    })

    //-----------------Submit Wildcards------------------------//

    $('#submitWildcards').click(function(){
      $('#progress').progress({percent:50});
      $(this).addClass('disabled');
      var wildcards = [];
      $('.wildcard').each(function(){
        wildcards.push(parseInt($(this).attr('data')));
      })
      console.log(wildcards);
      // populate
      var midpoint = Math.ceil(wildcards.length/2);

      wildcards.slice(0,midpoint).forEach(function(x){
        $('#hints .col1').append(`<div class="field"><div class="ui labeled input small"><div class="ui label">${userInputArray[x].text}</div><input type="text" placeholder="noun" data="${userInputArray[x].index}"></div></div>`);
      })
      wildcards.slice(midpoint).forEach(function(x){
        $('#hints .col2').append(`<div class="field"><div class="ui labeled input small"><div class="ui label">${userInputArray[x].text}</div><input type="text" placeholder="noun" data="${userInputArray[x].index}"></div></div>`);
      })

      $('#hints .col2').append('<button class="ui primary button" id="submitHints">Submit</button>')

      //--------------------Submit Hints------------------------//

      $('#submitHints').click(function(){
        $('#progress').progress({percent:75});
        $(this).addClass('disabled');
        $('#hints input').each(function(){
          userInputArray[$(this).attr('data')].wildcardText = $(this).val() || $(this).attr('placeholder');
        })
        userInputArray.forEach(function(x){
          if (x.wildcard){
            $('#madlib form').append(`<div class="field"><div class="ui left corner labeled input small"><input type="text" placeholder="${x.wildcardText}"><div class="ui left corner label"><i class="asterisk icon"></i></div></div></div>`)
          }
        })
      })

    }) // end submitWildcards
  }) // end submitText
})
