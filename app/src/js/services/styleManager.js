'use strict';

angular.module('tidepoolsServices')

	.factory('styleManager', [
		function() {
			var styleManager = {
				navBG_color: 'rgba(62, 82, 181, 0.96)' 
				//---local settings---
				/*bodyBG_color: '#FFF',
				titleBG_color,
				//text settings
				title_color,
				worldTitle_color,
				landmarkTitle_color		*/
			}

			styleManager.resetNavBG = function() {
				styleManager.navBG_color = 'rgba(62, 82, 181, 0.96)';
				//@IFDEF PHONEGAP
				updateStatusBar('rgba(67, 86, 180)');
				StatusBar.styleLightContent();
				//@ENDIF
			}

			styleManager.setNavBG = function(color) {
				styleManager.navBG_color = color;
				//@IFDEF PHONEGAP
				updateStatusBar(color);
				//@ENDIF
			}

			// update statusbar for ios. handles hex and rgba values
			function updateStatusBar(color) {
				if (color[0] !== '#') {
					var rgb = getRgbValues(color);
					color = rgbToHex(rgb.r, rgb.g, rgb.b)
				}
				StatusBar.backgroundColorByHexString(color);
			}

			function getRgbValues(color) {
				var arr = color.slice(5, -1).split(',');
				return {
					r: Number(arr[0]),
					g: Number(arr[1]),
					b: Number(arr[2])
				};
			}

			function componentToHex(c) {
		    var hex = c.toString(16);
		    return hex.length == 1 ? '0' + hex : hex;
			}

			function rgbToHex(r, g, b) {
			  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
			}

			return styleManager;

		}
	]);