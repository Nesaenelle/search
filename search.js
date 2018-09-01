(function($) {

    $.fn.customSearch = function(options) {
        var settings = $.extend({

        }, options);

        return this.each(function() {
        	var $container = $(this); 
            var $input = $(this).find('input[type="text"]');
            var $results = $(this).find('[data-custom-search-results]');
            var $input = $(this).find('[data-custom-search-input]');
            var $closeBtn = $(this).find('[data-custom-search-close]');

            $input.on('input', debounce(function(e) {
                // console.log(e.target.value);
            	var url = 'http://loginprovider.com/search/getsearchdata?filter=' + e.target.value + '';

                $.ajax({
                    url: './data.json'/* || url*/,
                    method: "GET",
                    dataType: 'json',
                    success: function(data) {
                        var elements = [];
                        $results.empty();
                        if (data) {
                            data.forEach(function(r, i) {
                            	var $item = $('<div class="custom-search__results_item" data-value="'+i+'">\
			                            		<div class="custom-search__results_item_name">'+r.Name+'</div>\
			                            		<div class="custom-search__results_item_type">'+r.Type+'</div>\
                            				</div>');
                            	elements.push($item);
                            	$item.on('click', function(e) {
                            		e.stopPropagation();
                            		e.preventDefault();
                            		var id = $(this).attr('data-value');
                            		var obj = data[id];
                            		$input.val(obj.Name);
                            		// $input.focus();
                            		// $results.hide()
                            		hideResults();
                            	});
                            });

                            $results.show()
                            $results.append(elements);
                            $container.addClass('has-results')
                        } else {
                        	$results.append($('<div class="custom-search__results_empty">Всі результати пошуку</div>'));
                        	hideResults();
                        }
                    },
                    error: function(data) {

                    }
                })
            }, 200));

	         $input.on('focus', function() {
	 			showResults();
	         });

	         $closeBtn.on('click', function() {
	         	hideResults();
	         	$input.val('');
	         	$results.empty();
	         	$container.removeClass('has-results')
	         });

	         window.addEventListener('click', function(e){
	         	if (!$container[0].contains(e.target)) {
	         	 	hideResults();
	         	}
	         });

	         function showResults() {
	         	$results.show()
	         	$container.addClass('focus')
	         }

	         function hideResults() {
	         	$results.hide();
	         	$container.removeClass('focus');
	         }
        });
    };


    $('.custom-search').customSearch();

    function debounce(f, ms) {

      let timer = null;

      return function (...args) {
        const onComplete = () => {
          f.apply(this, args);
          timer = null;
        }

        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(onComplete, ms);
      };
    }


}(jQuery));