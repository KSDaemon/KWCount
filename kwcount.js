/**
* jQuery word/characters counter plugin
* Provides a character/word counter for any text input or textarea
* 
* @version  0.0.1
* @homepage https://github.com/KSDaemon/KWCount/
* @author   Konstantin Burkalev 
* @email 	kostik@ksdaemon.ru
* @site 		http://blog.ksdaemon.ru
*
* Copyright (c) 20011 Konstantin Burkalev 
* Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
* and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
*/

(function ($,undefined) {

	$.fn.kwcount = function (params) {
		var settings = $.extend({
				hide_delay: 2000,			//	delay before hiding message
				count_type: 'chars',		//	counter type, possible values: chars | words
				show_max: true, 			// show possible maximum chars if exits
				limit: false				// Limit input for chars above maximum
			}, params);
			
		var etalon_container = $('<div>', {
			"class":  'kwc-container',
			"html":     '<SPAN class="kwc-text">&nbsp;</SPAN><span class="kwc-outer-tail"></span><span class="kwc-inner-tail"></span>'
		});
			
		function showContainer (container) {
			container.css('z-index', parseInt(container.css('z-index'), 10) + 1);	// For bubbling up if going to prev input
			container.fadeIn();
		};
  
		function hideContainer (container) {
			container.fadeOut();
		};

		function initialPositionContainer (container, field) {
			var fOffset = field.offset();
			var new_left = fOffset.left + field.width() - 30;
			var new_top = fOffset.top - container.height() + 20;
			container.css({
				left: new_left,
				top: new_top
			});
		};
  
		function positionContainer (container, field) {
			container.animate({
				top: field.offset().top - container.height()
			});
		};
		
		function showCount (container, value, max) {
			var rest = max - value;
			var txt = '';
//			console.log('container:',container, ' value:', value, ' max:', max);
			if(settings.count_type === 'chars') {
				if(settings.show_max) {
					txt = value.length + '/' + max;
				}
				else {
					txt = value.length;
				}
			}
			
			container.find('.kwc-text').html(txt);
			
			if(settings.limit) {
				return checkLimit(value, max);
			}
		};
		
		function checkLimit (value, max) {
			if(value.length >= max) {
				return false;
			}
			
			return true;
		};
		
		function getRandomNum (lbound, ubound) {
			return (Math.floor(Math.random() * (ubound - lbound)) + lbound);
		};
		
		function getRandomId () {
			var i, l = 5, ri = '', charSet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', cl;
			cl = charSet.length;
			for (i = 0; i < l; i++) {
				ri = ri + charSet.charAt(getRandomNum(0, cl));;
			}
		
			return ri;
		}
		
		if(typeof(params) == 'string') {			// i think wa want to call some service method.
			switch(params) {
				case 'remove':
					return this.each(function () {
						var that = $(this);
						that.unbind('.kwc');
						$('#' + that.data('kwc-container-id')).remove();
					});
					break;
				case 'removeall':
					$('input[type="text"],textarea').unbind('.kwc');
					$('.kwc-container').remove();
					return this;
					break;
			}
		}
		else {				// assume wa want to initialize.
			
			return this.each(function () { 
				var that = $(this);
				var visibleContainer = false;
				var max = that.attr('maxlength') > 0 ? that.attr('maxlength') : 				// Checking for > 0 because textarea return -1 if not set
									(that.data('maxlength') ? that.data('maxlength') : '?');
				var random_id = getRandomId();
				var contnr = etalon_container.clone().attr('id', random_id).appendTo('body');
				that.data('kwc-container-id', random_id);
				
				contnr.click(function () {
						hideContainer($(this));
					});
	
				$(window).resize(function() {
					initialPositionContainer(contnr, that);
				});
					
				$(this).bind({
					'focus.kwc': function () {
						initialPositionContainer(contnr, that);
						showCount(contnr, that.val(), max);
	
						if(!visibleContainer)
						{
							showContainer(contnr);
							visibleContainer = true;
						}
				     
						positionContainer(contnr, that);
						
					},
					'blur.kwc': function () {
						var tmr; 
						
						tmr = window.setTimeout(
									function () { 
										hideContainer(contnr); 
										visibleContainer = false;
										if (tmr) {
											window.clearTimeout(tmr);
										}
									}, 
									settings.hide_delay);
					}})
					.bind('keyup.kwc change.kwc paste.kwc', function () {
						return showCount(contnr, that.val(), max);
					});
					
				if(settings.limit) {
					$(this).bind('keypress.kwc', function () { return checkLimit(that.val(), max); });
				}
			});
		
		}	// end if-else
	
	};
	
})(jQuery);
