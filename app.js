$(function(){

  $('.tooltip').popup();

  var userInputArray = [];
  var madlibName = '';
  var manifesto = $('.manifesto').text();
  var cache = {};
  var crappyPartsOfSpeech = ['definite-article','preposition','abbreviation','pronoun','conjunction'];

  function colSplit(arr){
    var midpoint = Math.ceil(arr.length/2);
    var col1 = arr.slice(0,midpoint);
    var col2 = arr.slice(midpoint);
    return {'col1':col1, 'col2':col2};
  };

  function transition($previous, $next){
    $previous.fadeOut(400, function(){
      $next.fadeIn();
    });
  }

  function checkPOS(data) {
    for (var i = 0; i < data.length; i++) {
      if (data[i].hasOwnProperty('partOfSpeech')){
        return data[i].partOfSpeech;
      }
    }
    return '?'
  }

  function checkCompletion($inputs){
    var arr = [];
    $inputs.each(function(){
      arr.push($(this).val())
    })
    var complete = arr.reduce(function(bool,item){
      if (item === '' ){
        bool = false;
      }
      return bool
    },true)
    return complete;
  }


//--------------------Submit Text---------------------------//

  $('#submitText').click(function(){
    transition($('#input1'),$('#wildcard'));
    $('#progress').progress({percent:25});
    $(this).addClass('disabled');
    madlibName = $('#name').val() || 'The Communist Manifesto';
    // console.log(madlibName);
    $('.madlibName').text(madlibName);
    if ($('#input').val() === ''){
      inputStr = manifesto;
    }
    else {
      inputStr = $('#input').val().trim();
    }
    // newlines are magically # instead
    inputStr = inputStr.replace(/\n/g,' # ');
    userInputArray = inputStr.split(/\s+/g);
    
    userInputArray = userInputArray.reduce(function(arr,item,index){
      arr.push({
        'text':item,
        'wildcard':false,
        'index':index,
        'state': function(){
          if (this.partOfSpeech === '?'){
            return 'disabled'
          }
          else {
            return ''
          }
        },
        'toggle': function(){
          if (this.wildcard === false ){
            this.wildcard = true;
          }
          else {
            this.wildcard = false;
          }
        },
        'wildcardText': null,
        'madlibText': null,
        'partOfSpeech': null
      })
      return arr;
    },[]);

    console.log(userInputArray);

    userInputArray.forEach(function(x){
      $('#wildcard .field:nth-of-type(1)').append(`<div data='${x.index}' class="ui basic toggle button tiny">${x.text}</div>`);
    });

    // hide those damn newlines, those aren't words, dawg.
    $('#wildcard .toggle').each(function(){
      if ($(this).text() === '#'){
        $(this).remove();
      }
    })

    $('#wildcard .field:nth-of-type(2)').append('<button class="ui primary button" id="submitWildcards">Submit</button>')

    $('#wildcard .field:nth-of-type(1) > .button').click(function(){
      var word = $(this).text();
      parsed_word = word.replace(/\W/g,'');
      var index = $(this).attr('data');

      if (parsed_word && !cache[word]) {
        $.ajax({
          method:"GET",
          url:`http://api.wordnik.com/v4/word.json/${parsed_word}/definitions?limit=10&includeRelated=true&sourceDictionaries=all&useCanonical=false&includeTags=false&api_key=eea26315166006d3c02ca06c6cf00e42bd0d6eca6fb7aad9f`,
        }).done(function(data){
          if (data.length) {
            var pos;
            pos = checkPOS(data);
            console.log(word + ': ' + pos);
            userInputArray[index].partOfSpeech = pos;
          }
          else {
            console.log(word + ': not found!');
            userInputArray[index].partOfSpeech = '?';
          }
          cache[word] = pos;
          console.log(cache);
        });
      }
      else if (cache[word]) {
        console.log('word already in cache');
        userInputArray[index].partOfSpeech = cache[word];
      }
      else {
        console.log('not actually a word');
        userInputArray[index].partOfSpeech = '?';
        $(this).addClass('disabled');
        $(this).attr('data-content',"This isn't really a good wildcard.  Pick something else.");
      }

      $(this).toggleClass('basic');
      if (!$(this).hasClass('disabled')){
        $(this).toggleClass('green');
        $(this).toggleClass('wildcard'); // active wildcard
      }
      // toggle wildcard on object
      userInputArray[index].toggle();
    });

    //-----------------Submit Wildcards------------------------//
    var wildcardsPicked = false;
    var wildCardsError = false;
    $('#submitWildcards').click(function(){

      $('#wildcard .field:nth-of-type(1) > .button').each(function(){
        if ($(this).hasClass('wildcard')){
          wildcardsPicked = true;
        }
      })

      if (!wildcardsPicked){
        // throw error
        console.log('Pick some damn wildcards');
        if (!wildCardsError){
          $('#wildcard .box').append('<div class="alert topTen">Please pick some wildcards!</div>');
          wildCardsError = true;
        }
      }
      else {
        transition($('#wildcard'),$('#hints'));
        $('#progress').progress({percent:50});
        $(this).addClass('disabled');
        var wildcards = [];
        $('.wildcard').each(function(){
          wildcards.push(parseInt($(this).attr('data')));
        });
        console.log(wildcards);

        colSplit(wildcards).col1.forEach(function(x){
          $('#hints .col1').append(`<div class="field"><div class="ui labeled input small"><div class="ui label">${userInputArray[x].text}</div><input type="text" placeholder="${userInputArray[x].partOfSpeech}" data="${userInputArray[x].index}"></div></div>`);
        });
        colSplit(wildcards).col2.forEach(function(x){
          $('#hints .col2').append(`<div class="field"><div class="ui labeled input small"><div class="ui label">${userInputArray[x].text}</div><input type="text" placeholder="${userInputArray[x].partOfSpeech}" data="${userInputArray[x].index}"></div></div>`);
        });

        $('#hints .col2').append('<div class="field"><button class="ui primary button" id="submitHints">Submit</button></div>');
      } // end check for wildcardsPicked


      //--------------------Submit Hints------------------------//

      $('#submitHints').click(function(){
        transition($('#hints'),$('#madlib'));
        $('#progress').progress({percent:75});
        $(this).addClass('disabled');
        $('#hints input').each(function(){
          userInputArray[$(this).attr('data')].wildcardText = $(this).val() || $(this).attr('placeholder');
        });

        wildcardArr = userInputArray.filter(function(x){
          return x.wildcard
        });

        colSplit(wildcardArr).col1.forEach(function(x){
          $('#madlib .col1').append(`<div class="field"><div class="ui left corner labeled input small"><input type="text" placeholder="${x.wildcardText}" data="${x.index}"><div class="ui left corner label"><i class="asterisk icon"></i></div></div></div>`)
        });

        colSplit(wildcardArr).col2.forEach(function(x){
          $('#madlib .col2').append(`<div class="field"><div class="ui left corner labeled input small"><input type="text" placeholder="${x.wildcardText}" data="${x.index}"><div class="ui left corner label"><i class="asterisk icon"></i></div></div></div>`)
        });

        $('#madlib .col2').append('<div class="field"><button class="ui primary button" id="submitMadlib">Submit</button></div>');

        //--------------------Submit Madlib------------------------//

        $('#submitMadlib').click(function(){
          // make sure it's filled out first

          if (checkCompletion($('#madlib input'))){
            transition($('#madlib'),$('#result'));
            $('#progress').progress({percent:100});
            $('#progress').removeClass('orange').addClass('green');
            $(this).addClass('disabled');
            // fill that shit out

            $('#madlib input').each(function(){
              var index = $(this).attr('data');
              var madlibText = $(this).val();
              console.log(userInputArray[index]);
              var original = userInputArray[index].text;
              if (original.match(/\W/)){
                madlibText = original.replace(/\w+/,madlibText);
              }
              console.log(madlibText);
              userInputArray[index].madlibText = madlibText;
            })

            var output = userInputArray.map(function(x){
              if (x.wildcard) {
                return `<span class="highlite">${x.madlibText}</span>`;
              }
              else if (x.text === '#'){
                return '<br/>'
              }
              else {
                return x.text;
              }
            }).join(' ');
            // console.log(output);

            $('#result p').html(output);
          }
          else {
            $('#madlib input').each(function(){
              $(this).parent().removeClass('error');
              if (!$(this).val()){
                $(this).parent().addClass('error');
              }
            })
            if (!$('#madlib').has('span').length){
              $('#madlib button').parent().prepend('<span class="alert rightTen">Oops! You forgot something. </span>')
              console.log($('#madlib').has('span'));
            }
          } // end checkCompletion

        }) // end submit madlib
      }) // end submit Hints
    }) // end submit Wildcards
  }) // end submit Text
})
