/*
* 
* from web;
*
*/
Drag = { 
	obj: null, 
	init: function (options) { 
		options.handler.onmousedown = this.start; 
		options.handler.root = options.root || options.handler; 
		var root = options.handler.root; 
		root.onDragStart = options.dragStart || new Function(); 
		root.onDrag = options.onDrag || new Function(); 
		root.onDragEnd = options.onDragEnd || new Function(); 
	}, 
	start: function (e) {//此时的this是handler 
		var obj = Drag.obj = this; 
		//obj.style.cursor = 'move'; 
		e = e || Drag.fixEvent(window.event); 
		ex = e.pageX; 
		ey = e.pageY; 
		obj.lastMouseX = ex; 
		obj.lastMouseY = ey; 
		var x = obj.root.offsetLeft; 
		var y = obj.root.offsetTop; 
		obj.root.style.left = x + "px"; 
		obj.root.style.top = y + "px"; 
		document.onmouseup = Drag.end; 
		document.onmousemove = Drag.drag; 
		obj.root.onDragStart(x, y); 
	}, 
	drag: function (e) { 
		e = e || Drag.fixEvent(window.event); 
		ex = e.pageX; 
		ey = e.pageY; 
		var root = Drag.obj.root; 
		var x = root.style.left ? parseInt(root.style.left) : 0; 
		var y = root.style.top ? parseInt(root.style.top) : 0; 
		var nx = ex - Drag.obj.lastMouseX + x; 
		var ny = ey - Drag.obj.lastMouseY + y; 
		root.style.left = nx + "px"; 
		root.style.top = ny + "px"; 
		Drag.obj.root.onDrag(nx, ny); 
		Drag.obj.lastMouseX = ex; 
		Drag.obj.lastMouseY = ey; 
		e.preventDefault();
	}, 
	end: function (e) { 
		var x = Drag.obj.root.style.left ? parseInt(Drag.obj.root.style.left) : 0; 
		var y = Drag.obj.root.style.top ? parseInt(Drag.obj.root.style.top) : 0; 
		Drag.obj.root.onDragEnd(x, y); 
		document.onmousemove = null; 
		document.onmouseup = null; 
		Drag.obj = null; 
	}, 
	fixEvent: function (e) { 
		e.pageX = e.clientX + document.documentElement.scrollLeft; 
		e.pageY = e.clientY + document.documentElement.scrollTop; 
		return e; 
	} 
} 