const Draggable = {};


Draggable.draggify = function(elem, props) {
	//elem.style.position = elem.style.position=='absolute'? elem.style.position : 'relative';
	elem.style.top = '0px';
	//elem.style.left = '0px';
	
	elem.DraggableProperties = {};

	/*

	obj.xAxis / obj.yAxis		booleans allowing movement in either axis

	obj.xBoundaryElement /		HTMLElement nodes that dictate where the limit
	obj.yBoundaryElement		of drag movement is in each axis

	obj.ondrop			function to run when the element is dropped

	*/

	elem.DraggableProperties.xAxis = props.xAxis;
	elem.DraggableProperties.yAxis = props.yAxis;
	elem.DraggableProperties.xBoundaryElement = props.xBoundaryElement;
	elem.DraggableProperties.yBoundaryElement = props.yBoundaryElement;
	elem.DraggableProperties.ondrop = props.ondrop ? props.ondrop : null;
	elem.DraggableProperties.ondrag = props.ondrag ? props.ondrag : null;
	elem.DraggableProperties.onstart = props.onstart ? props.onstart : null;

	Draggable.elements.push(elem);

	elem.addEventListener('mousedown', function(e) {
		Draggable.currentElement = this;

		Draggable.initialMouseX = e.clientX - this.getBoundingClientRect().left;
		Draggable.initialMouseY = e.clientY - this.getBoundingClientRect().top;

		Draggable.startLeft = this.style.left;
		Draggable.startTop = this.style.top;

		Draggable.disable_selection();
	});

	props.xBoundaryElement.addEventListener('mousedown', function(e) {
		Draggable.currentElement = elem;
		Draggable.currentElement.DraggableProperties.onstart(e);

		Draggable.initialMouseX = e.clientX - elem.getBoundingClientRect().left;
		Draggable.initialMouseY = e.clientY - elem.getBoundingClientRect().top;

		Draggable.startLeft = elem.style.left;
		Draggable.startTop = elem.style.top;

		Draggable.disable_selection();
	});
}

// re-enabled text selection after a drag has been released
Draggable.enable_selection = function() {
	document.body.style.userSelect = '';
	document.body.style.webkitUserSelect = '';
	document.body.style.mozUserSelect = '';
	document.body.style.msUserSelect = '';
}

// disabled text selection while a drag is happening
Draggable.disable_selection = function() {
	document.body.style.userSelect = 'none';
	document.body.style.webkitUserSelect = 'none';
	document.body.style.mozUserSelect = 'none';
	document.body.style.msUserSelect = 'none';
}

// performs all necessary operations for when a drag is ended (completed or cancelled)
Draggable.release = function() {
	Draggable.enable_selection();
	Draggable.currentElement = null;
	Draggable.initialMouseX = null;
	Draggable.initialMouseY = null;
	//Draggable.startX = null;
	//Draggable.startY = null;
}

// performs drag completion specific actions
Draggable.complete = function() {
	Draggable.currentElement.DraggableProperties.ondrop(event);
}

// performs drag cancel specific actions
Draggable.cancel = function() {
	Draggable.currentElement.style.left = Draggable.startLeft;
	Draggable.currentElement.style.top = Draggable.startTop;
}

// array of objects for HTML elements that are draggable
Draggable.elements = [];

// logs the mouseX and mouseY values each time a mousemove event fires for calulating drag destination
Draggable.initialMouseX = null;
Draggable.initialMouseY = null;

// the element that is currently being dragged
Draggable.currentElement = null;

// handles a succesful drop
window.addEventListener('mouseup', function(event) {
	if (Draggable.currentElement) {
		Draggable.complete(event);
		Draggable.release();
	}
});

// handles the dragging if a Draggable element has been clicked on
window.addEventListener('mousemove', function(e) {
	if (Draggable.currentElement) {
		// the pixel distance between the initial click point on the element and the mouse location
		const movementX = e.clientX - (Draggable.initialMouseX + Draggable.currentElement.getBoundingClientRect().left);
		const movementY = e.clientY - (Draggable.initialMouseY + Draggable.currentElement.getBoundingClientRect().top);

		// handles x-axis movement if allowed
		if (Draggable.currentElement.DraggableProperties.xAxis) {
			// the new node.style.left value if the drag is succesful
			const newCSSLeft = parseInt(Draggable.currentElement.style.left) + movementX;

			// checks the bounds of the boundary element against the potential drag destination
			if (Draggable.currentElement.DraggableProperties.xBoundaryElement) {
				const boundaryRect = Draggable.currentElement.DraggableProperties.xBoundaryElement.getBoundingClientRect();
				const dragElementRect = Draggable.currentElement.getBoundingClientRect();
				const dragDestination = dragElementRect.left + movementX;

				const notPastLeft = dragDestination >= boundaryRect.left;
				const notPastRight = dragDestination <= (boundaryRect.right - dragElementRect.width);

				// checks to see if the destination is within the confines of the boundary element
				// otherwise sets the element against the edge of the boundary
				if (notPastLeft && notPastRight) {
					Draggable.currentElement.style.left = newCSSLeft + 'px';
				} else if (!notPastLeft) {
					Draggable.currentElement.style.left = newCSSLeft - (dragDestination - boundaryRect.left) + 'px';
				} else if (!notPastRight) {
					Draggable.currentElement.style.left = newCSSLeft - (dragDestination - boundaryRect.right + dragElementRect.width) + 'px';
				}
			} else {
				Draggable.currentElement.style.left = newCSSLeft + 'px';
			}
		}

		// handles y-axis movement if allowed
		if (Draggable.currentElement.DraggableProperties.yAxis) {
			// the new element.style.top value if the drag is succesful
			const newCSSTop = parseInt(Draggable.currentElement.style.top) + movementY;

			// checks the bounds of the boundary element against the potential drag destination
			if (Draggable.currentElement.DraggableProperties.yBoundaryElement) {
				const boundaryRect = Draggable.currentElement.DraggableProperties.yBoundaryElement.getBoundingClientRect();
				const dragElementRect = Draggable.currentElement.getBoundingClientRect();
				const dragDestination = dragElementRect.top + movementY;

				const notPastTop = dragDestination >= boundaryRect.top;
				const notPastBottom = dragDestination <= (boundaryRect.bottom - dragElementRect.height);

				// checks to see if the destination is within the confines of the boundary element
				// otherwise sets the element against the edge of the boundary
				if (notPastTop && notPastBottom) {
					Draggable.currentElement.style.top = newCSSTop + 'px';
				} else if (!notPastTop) {
					Draggable.currentElement.style.top = newCSSTop - (dragDestination - boundaryRect.top) + 'px';
				} else if (!notPastBottom) {
					Draggable.currentElement.style.top = newCSSTop - (dragDestination - boundaryRect.bottom + dragElementRect.height) + 'px';
				}
			} else {
				Draggable.currentElement.style.top = newCSSTop + 'px';
			}
		}
		Draggable.currentElement.DraggableProperties.ondrag(e);
	}
});

// Escape key releases drag elements, in the case of a bug
window.addEventListener('keydown', function(e) {
	if (e.key === 'Escape' && Draggable.currentElement) {
		Draggable.cancel();
		Draggable.release();
	}
});
