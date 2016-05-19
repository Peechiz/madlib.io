$(function(){

  $('.tooltip').popup();

  var userInputArray = [];
  var madlibName = '';
  var manifesto = $('.manifesto').text();
  var cache = {};
  var crappyPartsOfSpeech = ['definite-article','abbreviation','pronoun','conjunction'];
  var crapWords = 'the is a their it its of to and'.split(' ');
  var hasAlert = false;
  var hintHasAlert = false;

  var sectionButtons = {
    'input1': '#submitText',
    'wildcard': '#submitWildcards',
    'hints': '#submitHints',
    'madlib': '#submitMadlib',
  }
  var currentSection = 'input1';

  var jiggle = new Bounce();

  jiggle
    .scale({
    from: { x: .5, y: 1 },
    to: { x: 1, y: 1 },
    stiffness: 1,
    })
    .scale({
    from: { x: 1, y: .5 },
    to: { x: 1, y: 1 },
    stiffness: 1,
  });

  var jiggleSM = new Bounce();

  jiggleSM
    .scale({
    from: { x: .9, y: 1 },
    to: { x: 1, y: 1 },
    stiffness: 1,
    bounces: 3
    })
    .scale({
    from: { x: 1, y: .9 },
    to: { x: 1, y: 1 },
    stiffness: 1,
    bounces: 3
  });

  var clock = new Bounce();

  clock
    .rotate({
      from: 0,
      to: 360,
      delay: 200,
      bounces: 4,
      stiffness: 3
    })
    .scale({
      from: { x: .2, y: 1 },
      to: { x: 2, y: 1 },
      bounces: 4,
      stiffness: 3
    })
    .scale({
      from: { x: 3, y: 1 },
      to: { x: .5, y: 1 },
      bounces: 4,
      stiffness: 3,
      delay: 400
    });

  var smack = new Bounce();

  smack
    .skew({
      from: { x: 0, y: 0},
      to: { x: 40, y: 60},
      easing: 'sway',
      duration: 750,
      stiffness: 3
    })
    .scale({
      from: { x: .5, y:.5 },
      to: { x: 1, y: 1 },
      duration: 750,
      stiffness: 2
    });

  var runner = new Bounce();

  runner
    .translate({
      from: { x: 0, y: 0 },
      to: { x: 1000, y: 0 },
      duration: 750,
      bounces: 2,
      stiffness: 5
    })
    .skew({
      from: { x: 0, y: 0 },
      to: { x: 50, y: 0 },
      duration: 750,
      bounces: 4,
      stiffness: 3
    })
    .translate({
      from: { x: -2000, y: 0 },
      to: { x: -1000, y: 0 },
      delay: 750,
      bounces: 4,
      stiffness: 3
    })
    .skew({
      from: { x: 0, y: 0 },
      to: { x: -50, y: 0 },
      delay: 750,
    });

    var yay = new Bounce();

    yay
    .rotate({
      from: 0,
      to: 360,
      stiffness: 1
    })
    .translate({
      from: {x:0,y:0},
      to: {x:0,y:-100},
      easing: 'sway'
    })


  jiggle.applyTo($("#logo"));
  // runner.applyTo($("#logo"));
    // yay.applyTo($('#logo'));



  $(document).keypress(function(ev){
    if (ev.which === 13 && currentSection !== 'result'){
      var target = sectionButtons[currentSection];
      $(target).click();
    }
    else {
      jiggleSM.applyTo($("#logo"));
    }
  })

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

  function badPOS(pos){
    for (var i = 0; i < crappyPartsOfSpeech.length; i++) {
      if (pos === crappyPartsOfSpeech[i]){
        return true;
      }
    }
    return false;
  }

  function crapWord(word){
    word = word.toLowerCase();
    for (var i = 0; i < crapWords.length; i++) {
      if (word === crapWords[i]){
        return true;
      }
    }
    return false;
  }



  //----------------------------------------------------------//
  //                      Submit Text                         //
  //----------------------------------------------------------//

  $('#submitText').click(function(){
    clock.applyTo($('#logo'));
    currentSection = 'wildcard'
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
      var crappy = '';
      var basic = 'basic'
      if (crapWord(x.text)){
        crappy = 'disabled';
        basic = '';
      }

      $('#wildcard .field:nth-of-type(1)').append(`<div data='${x.index}' class="ui ${basic} toggle button tiny ${crappy}">${x.text}</div>`);

    });

    // hide those damn newlines, those aren't words, dawg.
    $('#wildcard .toggle').each(function(){
      if ($(this).text() === '#'){
        $(this).remove();
      }
    })

    $('#wildcard .field:nth-of-type(2)').append('<button class="ui primary button" id="submitWildcards">Submit</button>')

    $('#wildcard .field:nth-of-type(1) > .button').click(function(){
      smack.applyTo($('#logo'));
      var word = $(this).text();
      var curBtn = $(this);
      parsed_word = word.replace(/\W/g,'');
      var index = $(this).attr('data');
      var disable = function() {
        curBtn.addClass('disabled');
        curBtn.removeClass('basic');
        curBtn.removeClass('green');
        curBtn.removeClass('wildcard');
      }

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
            if (badPOS(pos)){
              disable();
            }
            else {
              cache[word] = pos;
            }
          }
          else {
            console.log(word + ': not found!');
            userInputArray[index].partOfSpeech = '?';
            cache[word] = pos;
          }
          // console.log(cache);
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
      }

      $(this).toggleClass('basic');
      if (!$(this).hasClass('disabled')){
        $(this).toggleClass('green');
        $(this).toggleClass('wildcard'); // active wildcard
      }
      // toggle wildcard on object
      userInputArray[index].toggle();
    });



    //----------------------------------------------------------//
    //                      Submit Wildcards                    //
    //----------------------------------------------------------//

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
        jiggle.applyTo($("#logo"));
        currentSection = 'hints';
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



      //----------------------------------------------------------//
      //                      Submit Hints                        //
      //----------------------------------------------------------//

      $('#submitHints').click(function(){
        var goodhints = true;
        // if hints have ? throw an error.
        $('#hints input').each(function(){
          if ($(this).attr('placeholder')==='?' && !$(this).val()){
            goodhints = false;
          }
        })

        if (goodhints){
          runner.applyTo($("#logo"));
          currentSection = 'madlib';
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
        }
        else {
          if (!hintHasAlert){
            $('#hints button').parent().prepend('<span class="alert rightTen">\'?\' isn\'t a very good hint. </span>');
            hintHasAlert = true;
          }
        }



        //----------------------------------------------------------//
        //                      Submit Madlib                       //
        //----------------------------------------------------------//

        $('#submitMadlib').click(function(){
          // make sure it's filled out first
          if (checkCompletion($('#madlib input'))){
            yay.applyTo($('#logo'));
            $('#logo,.tooltip').css('background-color', '#21BA45');
            currentSection = 'result';
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
            });
            if (!hasAlert){
              $('#madlib button').parent().prepend('<span class="alert rightTen">Oops! You forgot something. </span>');
              hasAlert = true;
            }
          } // end checkCompletion
        }) // end submit madlib
      }) // end submit Hints
    }) // end submit Wildcards
  }) // end submit Text
})
