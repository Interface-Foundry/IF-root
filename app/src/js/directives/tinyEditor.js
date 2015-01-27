app.directive('tinyEditor', function() {
	return {
		restrict: 'E',
		link: function(scope, element, attrs) {
			var d = (new Date().getTime() + Math.random()*16).toString(16);
			console.log(d);
			console.log(element);
			element[0].id = d;
			
			new TINY.editor.edit('editor', {
				id:d, 
				controls:['bold', 'italic', 'underline', 'strikethrough', '|', 'subscript', 'superscript', '|', 'orderedlist', 'unorderedlist', '|' ,'outdent' ,'indent', '|', 'leftalign', 'centeralign', 'rightalign', 'blockjustify', '|', 'unformat', '|', 'undo', 'redo', 'n', 'font', 'size', 'style', '|', 'image', 'hr', 'link', 'unlink', '|', 'print']
			})	
		
		}
	}
});