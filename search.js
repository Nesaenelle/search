(function($) {

    $.fn.customSearch = function(options) {
        var settings = $.extend({
            debounce: 300,
            localUrl: false
        }, options);

        return this.each(function() {
            var $container = $(this);
            var $input = $(this).find('input[type="text"]');
            var $results = $(this).find('[data-custom-search-results]');
            var $input = $(this).find('[data-custom-search-input]');
            var $closeBtn = $(this).find('[data-custom-search-close]');
            var elements = [];
            var dataFromServer;
            var navigationIndex = -1;
            var selectedIndex;

            $container.on('keydown', function(e) {
                if ($results.is(':visible')) {
                    switch (e.keyCode) {
                        case 13:
                            var item = elements.filter(function(item, i) { return i === navigationIndex })[0];
                            if (item) {
                                onItemClick.call(item);
                            }
                            break;
                            //up
                        case 38:
                            navigationIndex--;
                            if (navigationIndex < 0) {
                                navigationIndex = 0;
                            }
                            navigationToggleClass();
                            break;
                            //down
                        case 40:
                            navigationIndex++;
                            if (navigationIndex > elements.length - 1) {
                                navigationIndex = elements.length - 1;
                            }
                            navigationToggleClass();
                            break;
                    }
                }

            })

            $input.on('input', debounce(function(e) {
                var url = settings.localUrl ? './data.json' : 'http://loginprovider.com/search/getsearchdata?filter=' + e.target.value + '';

                $.ajax({
                    url: url,
                    method: "GET",
                    dataType: 'json',
                    success: function(data) {
                        elements = [];
                        dataFromServer = data;
                        $results.empty();
                        if (data) {
                            data.forEach(function(r, i) {
                                var $item = createListItem(r, i);
                                elements.push($item);
                                $item.on('click', function(e) {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    onItemClick.call(this);
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
                        dataFromServer = data;
                    }
                })
            }, settings.debounce));

            $input.on('focus', function() {
                showResults();
            });

            $closeBtn.on('click', function() {
                hideResults();
                $input.val('');
                $results.empty();
                $container.removeClass('has-results')
            });

            window.addEventListener('click', function(e) {
                if (!$container[0].contains(e.target)) {
                    hideResults();
                }
            });

            function onItemClick() {
                var id = $(this).attr('data-value');
                var obj = dataFromServer[id];
                $input.val(obj.Name);
                $input.blur();
                selectedIndex = id;
                elements.forEach(function(item) { item.removeClass('active') });
                $(this).addClass('active');
                alert(obj.Name);
                hideResults();
            }

            function createListItem(r, i) {
                return $('<div class="custom-search__results_item" data-value="' + i + '">\
                            <div class="custom-search__results_item_name">' + r.Name + '</div>\
                            <div class="custom-search__results_item_type">' + r.Type + '</div>\
                        </div>');
            }

            function showResults() {
                if (elements.length) {
                    $results.show();
                }
                if (selectedIndex) {
                    navigationIndex = selectedIndex;
                }
                $container.addClass('focus');
            }

            function hideResults() {
                $results.hide();
                $container.removeClass('focus');
                navigationIndex = -1;
                elements.forEach(function(item) {
                    item.removeClass('underline');
                });
            }

            function scrollTo(item) {
                var top = item.position().top;
                $results.stop().animate({ scrollTop: top }, 300);
            }

            function navigationToggleClass() {
                elements.forEach(function(item, i) {
                    if (navigationIndex === i) {
                        item.addClass('underline');
                        scrollTo(item);
                    } else {
                        item.removeClass('underline');
                    }
                });
            }

            function debounce(f, ms) {

                let timer = null;

                return function(...args) {
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
        });
    };

}(jQuery));

$('.custom-search').customSearch({
    debounce: 300,
    localUrl: true // false for production
});