app.directive('stickers', function(apertureService) { //NOT USED
	return {
		restrict: 'A',
		scope: true,
		link: function(scope, element, attrs) {
			var touch,
				action,
				diffX,
				diffY,
				endX,
				endY,
				scroll,
				drag,
				dragTimer,
				startX,
				startY;
				
			function getCoord(e, c) {
				return /touch/.test(e.type) ? (e.originalEvent || e).changedTouches[0]['page' + c] : e['page' + c];
			}
 
			//EVENT HANDLERS
			function onStart(ev) {
				startX = getCoord(ev, 'X');
				startY = getCoord(ev, 'Y');
				diffX = 0;
				diffY = 0;
				
				dragTimer = setTimeout(function () {
					drag = true;
				}, 200);
			}
			
			function onMove(ev) {
				endX = getCoord(ev, 'X');
				endY = getCoord(ev, 'Y');
				diffX = endX - startX;
				diffY = endY - startY;
				
				
				if (!drag) {
					if (Math.abs(diffY) > 10) {
						scroll = true;
						//android 4.0 touchend issue here
						//trigger touchend
					} /*else if (Math.abs(diffX) > 7) { //swipe
						swipe = true
					}*/
				}
				
				if (drag) {
					ev.preventDefault(); //kill page scrolling
					//handle dragging
					console.log('dragging starts');
					stickerElement.style.top = endY + 'px';
					stickerElement.style.left = endX + 'px';
				}
				
				if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
					//kill drag timer when you've started moving.
					clearTimeout(dragTimer)
				}
			}
						
			function onEnd(ev) {
				if (drag) {
					//handle drag end
					console.log('drag end');
					console.log(endX, endY);
				} else if (!scroll & Math.abs(diffX) < 5 && Math.abs(diffY) < 5) {
					if (ev.type === 'touchend') {
						ev.preventDefault(); //phantom clicks?
					}
					//handle tap
					console.log('tap');
				}
				
				swipe = false;
				drag = false;
				scroll = false;
				
				clearTimeout(dragTimer);
			}
			
			
			//INIT DOM
			var stickerElement = document.createElement('div');
			stickerElement.className = "floating-sticker";
			document.body.appendChild(stickerElement);
			
			
			//INIT LISTENERS
			element.on('touchstart', onStart)
			.on('touchmove', onMove)
			.on('touchend', onEnd);
			
			
		}
	}
});