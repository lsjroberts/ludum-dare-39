
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		return '<function>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$never = function (_p0) {
	never:
	while (true) {
		var _p1 = _p0;
		var _v1 = _p1._0;
		_p0 = _v1;
		continue never;
	}
};
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return A2(f, _p3._0, _p3._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$always = F2(
	function (a, _p4) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$JustOneMore = function (a) {
	return {ctor: 'JustOneMore', _0: a};
};

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		var _p1 = maybeValue;
		if (_p1.ctor === 'Just') {
			return callback(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p2 = maybe;
		if (_p2.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p3 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p3._0._0, _p3._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p4 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p4.ctor === '_Tuple3') && (_p4._0.ctor === 'Just')) && (_p4._1.ctor === 'Just')) && (_p4._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p4._0._0, _p4._1._0, _p4._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p5 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p5.ctor === '_Tuple4') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) && (_p5._2.ctor === 'Just')) && (_p5._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p5._0._0, _p5._1._0, _p5._2._0, _p5._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p6 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p6.ctor === '_Tuple5') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) && (_p6._2.ctor === 'Just')) && (_p6._3.ctor === 'Just')) && (_p6._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0, _p6._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$singleton = function (value) {
	return {
		ctor: '::',
		_0: value,
		_1: {ctor: '[]'}
	};
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			_elm_lang$core$List$any,
			function (_p2) {
				return !isOkay(_p2);
			},
			list);
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return {
						ctor: '::',
						_0: f(x),
						_1: acc
					};
				}),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (front, back) {
				return pred(front) ? {ctor: '::', _0: front, _1: back} : back;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return {ctor: '::', _0: _p10._0, _1: xs};
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			}),
		{ctor: '[]'},
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, x, _p11._0),
						_1: accAcc
					};
				} else {
					return {ctor: '[]'};
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				{
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				},
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		{ctor: '[]'},
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: x, _1: _p16},
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: {ctor: '::', _0: x, _1: _p15}
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: _p19._0, _1: _p20._0},
				_1: {ctor: '::', _0: _p19._1, _1: _p20._1}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var step = F2(
				function (x, rest) {
					return {
						ctor: '::',
						_0: sep,
						_1: {ctor: '::', _0: x, _1: rest}
					};
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				{ctor: '[]'},
				_p21._1);
			return {ctor: '::', _0: _p21._0, _1: spersed};
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = {ctor: '::', _0: _p22._0, _1: taken};
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				{ctor: '[]'}));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return {ctor: '[]'};
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return {
											ctor: '::',
											_0: _p23._1._0,
											_1: {
												ctor: '::',
												_0: _p23._1._1._0,
												_1: {ctor: '[]'}
											}
										};
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return {
												ctor: '::',
												_0: _p23._1._0,
												_1: {
													ctor: '::',
													_0: _p23._1._1._0,
													_1: {
														ctor: '::',
														_0: _p23._1._1._1._0,
														_1: {ctor: '[]'}
													}
												}
											};
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A2(_elm_lang$core$List$takeTailRec, n - 4, _p24)
														}
													}
												}
											} : {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)
														}
													}
												}
											};
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return {
					ctor: '::',
					_0: _p23._1._0,
					_1: {ctor: '[]'}
				};
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = {ctor: '::', _0: value, _1: result},
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			{ctor: '[]'},
			n,
			value);
	});
var _elm_lang$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(lo, hi) < 1) {
				var _v30 = lo,
					_v31 = hi - 1,
					_v32 = {ctor: '::', _0: hi, _1: list};
				lo = _v30;
				hi = _v31;
				list = _v32;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var _elm_lang$core$List$range = F2(
	function (lo, hi) {
		return A3(
			_elm_lang$core$List$rangeHelp,
			lo,
			hi,
			{ctor: '[]'});
	});
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});

var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		A2(
			_elm_lang$core$List$range,
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _elm_lang$core$Native_List.fromArray(is);
}


function toInt(s)
{
	var len = s.length;

	// if empty
	if (len === 0)
	{
		return intErr(s);
	}

	// if hex
	var c = s[0];
	if (c === '0' && s[1] === 'x')
	{
		for (var i = 2; i < len; ++i)
		{
			var c = s[i];
			if (('0' <= c && c <= '9') || ('A' <= c && c <= 'F') || ('a' <= c && c <= 'f'))
			{
				continue;
			}
			return intErr(s);
		}
		return _elm_lang$core$Result$Ok(parseInt(s, 16));
	}

	// is decimal
	if (c > '9' || (c < '0' && c !== '-' && c !== '+'))
	{
		return intErr(s);
	}
	for (var i = 1; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return intErr(s);
		}
	}

	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function intErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int");
}


function toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return floatErr(s);
	}
	var n = +s;
	// faster isNaN check
	return n === n ? _elm_lang$core$Result$Ok(n) : floatErr(s);
}

function floatErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float");
}


function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (callback, result) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$mapError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return {ctor: '::', _0: key, _1: keyList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return {ctor: '::', _0: value, _1: valueList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: key, _1: value},
					_1: list
				};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				{
					ctor: '::',
					_0: 'Internal red-black tree invariant violated, expected ',
					_1: {
						ctor: '::',
						_0: msg,
						_1: {
							ctor: '::',
							_0: ' and got ',
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(c),
								_1: {
									ctor: '::',
									_0: '/',
									_1: {
										ctor: '::',
										_0: lgot,
										_1: {
											ctor: '::',
											_0: '/',
											_1: {
												ctor: '::',
												_0: rgot,
												_1: {
													ctor: '::',
													_0: '\nPlease report this bug to <https://github.com/elm-lang/core/issues>',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
	return function (xk) {
		return function (xv) {
			return function (yk) {
				return function (yv) {
					return function (zk) {
						return function (zv) {
							return function (a) {
								return function (b) {
									return function (c) {
										return function (d) {
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (color, left, right) {
		var _p29 = {ctor: '_Tuple2', _0: left, _1: right};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = color;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: color, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						color,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: color, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						color,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var newLeft = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, color, k, v, newLeft, right);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeIndex(index, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'index',
		index: index,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function mapMany(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function andThen(callback, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function map1(f, d1)
{
	return mapMany(f, [d1]);
}

function map2(f, d1, d2)
{
	return mapMany(f, [d1, d2]);
}

function map3(f, d1, d2, d3)
{
	return mapMany(f, [d1, d2, d3]);
}

function map4(f, d1, d2, d3, d4)
{
	return mapMany(f, [d1, d2, d3, d4]);
}

function map5(f, d1, d2, d3, d4, d5)
{
	return mapMany(f, [d1, d2, d3, d4, d5]);
}

function map6(f, d1, d2, d3, d4, d5, d6)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6]);
}

function map7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function map8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok') ? result : badField(field, result);

		case 'index':
			var index = decoder.index;
			if (!(value instanceof Array))
			{
				return badPrimitive('an array', value);
			}
			if (index >= value.length)
			{
				return badPrimitive('a longer array. Need index ' + index + ' but there are only ' + value.length + ' entries', value);
			}

			var result = runHelp(decoder.decoder, value[index]);
			return (result.tag === 'ok') ? result : badIndex(index, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'index':
			return a.index === b.index && equality(a.decoder, b.decoder);

		case 'map-many':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

	decodeField: F2(decodeField),
	decodeIndex: F2(decodeIndex),

	map1: F2(map1),
	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	map6: F7(map6),
	map7: F8(map7),
	map8: F9(map8),
	decodeKeyValuePairs: decodeKeyValuePairs,

	andThen: F2(andThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$lazy = function (thunk) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		thunk,
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map8 = _elm_lang$core$Native_Json.map8;
var _elm_lang$core$Json_Decode$map7 = _elm_lang$core$Native_Json.map7;
var _elm_lang$core$Json_Decode$map6 = _elm_lang$core$Native_Json.map6;
var _elm_lang$core$Json_Decode$map5 = _elm_lang$core$Native_Json.map5;
var _elm_lang$core$Json_Decode$map4 = _elm_lang$core$Native_Json.map4;
var _elm_lang$core$Json_Decode$map3 = _elm_lang$core$Native_Json.map3;
var _elm_lang$core$Json_Decode$map2 = _elm_lang$core$Native_Json.map2;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.map1;
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$index = _elm_lang$core$Native_Json.decodeIndex;
var _elm_lang$core$Json_Decode$field = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(_elm_lang$core$List$foldr, _elm_lang$core$Json_Decode$field, decoder, fields);
	});
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$nullable = function (decoder) {
	return _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, decoder),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

var _elm_lang$virtual_dom$VirtualDom_Debug$wrap;
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags;

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';

var localDoc = typeof document !== 'undefined' ? document : {};


////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(factList, kidList) {
		return nodeHelp(tag, factList, kidList);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function keyedNode(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid._1.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'keyed-node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function custom(factList, model, impl)
{
	var facts = organizeFacts(factList).facts;

	return {
		type: 'custom',
		facts: facts,
		model: model,
		impl: impl
	};
}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: 1 + (node.descendantsCount || 0)
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: undefined
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



// FACTS


function organizeFacts(factList)
{
	var namespace, facts = {};

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
		{
			var subFacts = facts[key] || {};
			subFacts[entry.realKey] = entry.value;
			facts[key] = subFacts;
		}
		else if (key === STYLE_KEY)
		{
			var styles = facts[key] || {};
			var styleList = entry.value;
			while (styleList.ctor !== '[]')
			{
				var style = styleList._0;
				styles[style._0] = style._1;
				styleList = styleList._1;
			}
			facts[key] = styles;
		}
		else if (key === 'namespace')
		{
			namespace = entry.value;
		}
		else if (key === 'className')
		{
			var classes = facts[key];
			facts[key] = typeof classes === 'undefined'
				? entry.value
				: classes + ' ' + entry.value;
		}
 		else
		{
			facts[key] = entry.value;
		}
		factList = factList._1;
	}

	return {
		facts: facts,
		namespace: namespace
	};
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
		key: STYLE_KEY,
		value: value
	};
}


function property(key, value)
{
	return {
		key: key,
		value: value
	};
}


function attribute(key, value)
{
	return {
		key: ATTR_KEY,
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTR_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	if (a.options !== b.options)
	{
		if (a.options.stopPropagation !== b.options.stopPropagation || a.options.preventDefault !== b.options.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
}


function mapProperty(func, property)
{
	if (property.key !== EVENT_KEY)
	{
		return property;
	}
	return on(
		property.realKey,
		property.value.options,
		A2(_elm_lang$core$Json_Decode$map, func, property.value.decoder)
	);
}


////////////  RENDER  ////////////


function render(vNode, eventNode)
{
	switch (vNode.type)
	{
		case 'thunk':
			if (!vNode.node)
			{
				vNode.node = vNode.thunk();
			}
			return render(vNode.node, eventNode);

		case 'tagger':
			var subNode = vNode.node;
			var tagger = vNode.tagger;

			while (subNode.type === 'tagger')
			{
				typeof tagger !== 'object'
					? tagger = [tagger, subNode.tagger]
					: tagger.push(subNode.tagger);

				subNode = subNode.node;
			}

			var subEventRoot = { tagger: tagger, parent: eventNode };
			var domNode = render(subNode, subEventRoot);
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return localDoc.createTextNode(vNode.text);

		case 'node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i], eventNode));
			}

			return domNode;

		case 'keyed-node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i]._1, eventNode));
			}

			return domNode;

		case 'custom':
			var domNode = vNode.impl.render(vNode.model);
			applyFacts(domNode, eventNode, vNode.facts);
			return domNode;
	}
}



////////////  APPLY FACTS  ////////////


function applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		switch (key)
		{
			case STYLE_KEY:
				applyStyles(domNode, value);
				break;

			case EVENT_KEY:
				applyEvents(domNode, eventNode, value);
				break;

			case ATTR_KEY:
				applyAttrs(domNode, value);
				break;

			case ATTR_NS_KEY:
				applyAttrsNS(domNode, value);
				break;

			case 'value':
				if (domNode[key] !== value)
				{
					domNode[key] = value;
				}
				break;

			default:
				domNode[key] = value;
				break;
		}
	}
}

function applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}

function applyEvents(domNode, eventNode, events)
{
	var allHandlers = domNode.elm_handlers || {};

	for (var key in events)
	{
		var handler = allHandlers[key];
		var value = events[key];

		if (typeof value === 'undefined')
		{
			domNode.removeEventListener(key, handler);
			allHandlers[key] = undefined;
		}
		else if (typeof handler === 'undefined')
		{
			var handler = makeEventHandler(eventNode, value);
			domNode.addEventListener(key, handler);
			allHandlers[key] = handler;
		}
		else
		{
			handler.info = value;
		}
	}

	domNode.elm_handlers = allHandlers;
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
				{
					message = tagger(message);
				}
				else
				{
					for (var i = tagger.length; i--; )
					{
						message = tagger[i](message);
					}
				}
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}

function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}

function applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.namespace;
		var value = pair.value;

		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(namespace, key);
		}
		else
		{
			domNode.setAttributeNS(namespace, key, value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function makePatch(type, index, data)
{
	return {
		index: index,
		type: type,
		data: data,
		domNode: undefined,
		eventNode: undefined
	};
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push(makePatch('p-redraw', index, b));
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			if (subPatches.length > 0)
			{
				patches.push(makePatch('p-thunk', index, subPatches));
			}
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push(makePatch('p-tagger', index, bTaggers));
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push(makePatch('p-text', index, b.text));
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffChildren(a, b, patches, index);
			return;

		case 'keyed-node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffKeyedChildren(a, b, patches, index);
			return;

		case 'custom':
			if (a.impl !== b.impl)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);
			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			var patch = b.impl.diff(a,b);
			if (patch)
			{
				patches.push(makePatch('p-custom', index, patch));
				return;
			}

			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, category)
{
	var diff;

	// look for changes and removals
	for (var aKey in a)
	{
		if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
		{
			var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[aKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] =
				(typeof category === 'undefined')
					? (typeof a[aKey] === 'string' ? '' : null)
					:
				(category === STYLE_KEY)
					? ''
					:
				(category === EVENT_KEY || category === ATTR_KEY)
					? undefined
					:
				{ namespace: a[aKey].namespace, value: undefined };

			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		// reference equal, so don't worry about it
		if (aValue === bValue && aKey !== 'value'
			|| category === EVENT_KEY && equalEvents(aValue, bValue))
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	// add new stuff
	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (aLen > bLen)
	{
		patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
	}
	else if (aLen < bLen)
	{
		patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	var index = rootIndex;
	var minLen = aLen < bLen ? aLen : bLen;
	for (var i = 0; i < minLen; i++)
	{
		index++;
		var aChild = aChildren[i];
		diffHelp(aChild, bChildren[i], patches, index);
		index += aChild.descendantsCount || 0;
	}
}



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var aChildren = aParent.children;
	var bChildren = bParent.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var aIndex = 0;
	var bIndex = 0;

	var index = rootIndex;

	while (aIndex < aLen && bIndex < bLen)
	{
		var a = aChildren[aIndex];
		var b = bChildren[bIndex];

		var aKey = a._0;
		var bKey = b._0;
		var aNode = a._1;
		var bNode = b._1;

		// check if keys match

		if (aKey === bKey)
		{
			index++;
			diffHelp(aNode, bNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex++;
			bIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var aLookAhead = aIndex + 1 < aLen;
		var bLookAhead = bIndex + 1 < bLen;

		if (aLookAhead)
		{
			var aNext = aChildren[aIndex + 1];
			var aNextKey = aNext._0;
			var aNextNode = aNext._1;
			var oldMatch = bKey === aNextKey;
		}

		if (bLookAhead)
		{
			var bNext = bChildren[bIndex + 1];
			var bNextKey = bNext._0;
			var bNextNode = bNext._1;
			var newMatch = aKey === bNextKey;
		}


		// swap a and b
		if (aLookAhead && bLookAhead && newMatch && oldMatch)
		{
			index++;
			diffHelp(aNode, bNextNode, localPatches, index);
			insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			removeNode(changes, localPatches, aKey, aNextNode, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		// insert b
		if (bLookAhead && newMatch)
		{
			index++;
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			diffHelp(aNode, bNextNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex += 1;
			bIndex += 2;
			continue;
		}

		// remove a
		if (aLookAhead && oldMatch)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 1;
			continue;
		}

		// remove a, insert b
		if (aLookAhead && bLookAhead && aNextKey === bNextKey)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNextNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (aIndex < aLen)
	{
		index++;
		var a = aChildren[aIndex];
		var aNode = a._1;
		removeNode(changes, localPatches, a._0, aNode, index);
		index += aNode.descendantsCount || 0;
		aIndex++;
	}

	var endInserts;
	while (bIndex < bLen)
	{
		endInserts = endInserts || [];
		var b = bChildren[bIndex];
		insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
		bIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
	{
		patches.push(makePatch('p-reorder', rootIndex, {
			patches: localPatches,
			inserts: inserts,
			endInserts: endInserts
		}));
	}
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		entry = {
			tag: 'insert',
			vnode: vnode,
			index: bIndex,
			data: undefined
		};

		inserts.push({ index: bIndex, entry: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.tag === 'remove')
	{
		inserts.push({ index: bIndex, entry: entry });

		entry.tag = 'move';
		var subPatches = [];
		diffHelp(entry.vnode, vnode, subPatches, entry.index);
		entry.index = bIndex;
		entry.data.data = {
			patches: subPatches,
			entry: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		var patch = makePatch('p-remove', index, undefined);
		localPatches.push(patch);

		changes[key] = {
			tag: 'remove',
			vnode: vnode,
			index: index,
			data: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.tag === 'insert')
	{
		entry.tag = 'move';
		var subPatches = [];
		diffHelp(vnode, entry.vnode, subPatches, index);

		var patch = makePatch('p-remove', index, {
			patches: subPatches,
			entry: entry
		});
		localPatches.push(patch);

		return;
	}

	// this key has already been removed or moved, a duplicate!
	removeNode(changes, localPatches, key + POSTFIX, vnode, index);
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		var patchType = patch.type;

		if (patchType === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else if (patchType === 'p-reorder')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var subPatches = patch.data.patches;
			if (subPatches.length > 0)
			{
				addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 'p-remove')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var data = patch.data;
			if (typeof data !== 'undefined')
			{
				data.entry.data = domNode;
				var subPatches = data.patches;
				if (subPatches.length > 0)
				{
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			var subNode = vNode.node;

			while (subNode.type === "tagger")
			{
				subNode = subNode.node;
			}

			return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'keyed-node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j]._1;
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return applyPatchRedraw(domNode, patch.data, patch.eventNode);

		case 'p-facts':
			applyFacts(domNode, patch.eventNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-thunk':
			return applyPatchesHelp(domNode, patch.data);

		case 'p-tagger':
			if (typeof domNode.elm_event_node_ref !== 'undefined')
			{
				domNode.elm_event_node_ref.tagger = patch.data;
			}
			else
			{
				domNode.elm_event_node_ref = { tagger: patch.data, parent: patch.eventNode };
			}
			return domNode;

		case 'p-remove-last':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-append':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				domNode.appendChild(render(newNodes[i], patch.eventNode));
			}
			return domNode;

		case 'p-remove':
			var data = patch.data;
			if (typeof data === 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.entry;
			if (typeof entry.index !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.data = applyPatchesHelp(domNode, data.patches);
			return domNode;

		case 'p-reorder':
			return applyPatchReorder(domNode, patch);

		case 'p-custom':
			var impl = patch.data;
			return impl.applyPatch(domNode, impl.data);

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, eventNode);

	if (typeof newNode.elm_event_node_ref === 'undefined')
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function applyPatchReorder(domNode, patch)
{
	var data = patch.data;

	// remove end inserts
	var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

	// removals
	domNode = applyPatchesHelp(domNode, data.patches);

	// inserts
	var inserts = data.inserts;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.entry;
		var node = entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode);
		domNode.insertBefore(node, domNode.childNodes[insert.index]);
	}

	// add end inserts
	if (typeof frag !== 'undefined')
	{
		domNode.appendChild(frag);
	}

	return domNode;
}


function applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (typeof endInserts === 'undefined')
	{
		return;
	}

	var frag = localDoc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.entry;
		frag.appendChild(entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode)
		);
	}
	return frag;
}


// PROGRAMS

var program = makeProgram(checkNoFlags);
var programWithFlags = makeProgram(checkYesFlags);

function makeProgram(flagChecker)
{
	return F2(function(debugWrap, impl)
	{
		return function(flagDecoder)
		{
			return function(object, moduleName, debugMetadata)
			{
				var checker = flagChecker(flagDecoder, moduleName);
				if (typeof debugMetadata === 'undefined')
				{
					normalSetup(impl, object, moduleName, checker);
				}
				else
				{
					debugSetup(A2(debugWrap, debugMetadata, impl), object, moduleName, checker);
				}
			};
		};
	});
}

function staticProgram(vNode)
{
	var nothing = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		_elm_lang$core$Platform_Cmd$none
	);
	return A2(program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, {
		init: nothing,
		view: function() { return vNode; },
		update: F2(function() { return nothing; }),
		subscriptions: function() { return _elm_lang$core$Platform_Sub$none; }
	})();
}


// FLAG CHECKERS

function checkNoFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flags === 'undefined')
		{
			return init;
		}

		var errorMessage =
			'The `' + moduleName + '` module does not need flags.\n'
			+ 'Initialize it with no arguments and you should be all set!';

		crash(errorMessage, domNode);
	};
}

function checkYesFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flagDecoder === 'undefined')
		{
			var errorMessage =
				'Are you trying to sneak a Never value into Elm? Trickster!\n'
				+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
				+ 'Use `program` instead if you do not want flags.'

			crash(errorMessage, domNode);
		}

		var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
		if (result.ctor === 'Ok')
		{
			return init(result._0);
		}

		var errorMessage =
			'Trying to initialize the `' + moduleName + '` module with an unexpected flag.\n'
			+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
			+ result._0;

		crash(errorMessage, domNode);
	};
}

function crash(errorMessage, domNode)
{
	if (domNode)
	{
		domNode.innerHTML =
			'<div style="padding-left:1em;">'
			+ '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
			+ '<pre style="padding-left:1em;">' + errorMessage + '</pre>'
			+ '</div>';
	}

	throw new Error(errorMessage);
}


//  NORMAL SETUP

function normalSetup(impl, object, moduleName, flagChecker)
{
	object['embed'] = function embed(node, flags)
	{
		while (node.lastChild)
		{
			node.removeChild(node.lastChild);
		}

		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update,
			impl.subscriptions,
			normalRenderer(node, impl.view)
		);
	};

	object['fullscreen'] = function fullscreen(flags)
	{
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update,
			impl.subscriptions,
			normalRenderer(document.body, impl.view)
		);
	};
}

function normalRenderer(parentNode, view)
{
	return function(tagger, initialModel)
	{
		var eventNode = { tagger: tagger, parent: undefined };
		var initialVirtualNode = view(initialModel);
		var domNode = render(initialVirtualNode, eventNode);
		parentNode.appendChild(domNode);
		return makeStepper(domNode, view, initialVirtualNode, eventNode);
	};
}


// STEPPER

var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { setTimeout(callback, 1000 / 60); };

function makeStepper(domNode, view, initialVirtualNode, eventNode)
{
	var state = 'NO_REQUEST';
	var currNode = initialVirtualNode;
	var nextModel;

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/virtual-dom/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var nextNode = view(nextModel);
				var patches = diff(currNode, nextNode);
				domNode = applyPatches(domNode, currNode, patches, eventNode);
				currNode = nextNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return function stepper(model)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextModel = model;
	};
}


// DEBUG SETUP

function debugSetup(impl, object, moduleName, flagChecker)
{
	object['fullscreen'] = function fullscreen(flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, document.body, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};

	object['embed'] = function fullscreen(node, flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, node, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};
}

function scrollTask(popoutRef)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var doc = popoutRef.doc;
		if (doc)
		{
			var msgs = doc.getElementsByClassName('debugger-sidebar-messages')[0];
			if (msgs)
			{
				msgs.scrollTop = msgs.scrollHeight;
			}
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


function debugRenderer(moduleName, parentNode, popoutRef, view, viewIn, viewOut)
{
	return function(tagger, initialModel)
	{
		var appEventNode = { tagger: tagger, parent: undefined };
		var eventNode = { tagger: tagger, parent: undefined };

		// make normal stepper
		var appVirtualNode = view(initialModel);
		var appNode = render(appVirtualNode, appEventNode);
		parentNode.appendChild(appNode);
		var appStepper = makeStepper(appNode, view, appVirtualNode, appEventNode);

		// make overlay stepper
		var overVirtualNode = viewIn(initialModel)._1;
		var overNode = render(overVirtualNode, eventNode);
		parentNode.appendChild(overNode);
		var wrappedViewIn = wrapViewIn(appEventNode, overNode, viewIn);
		var overStepper = makeStepper(overNode, wrappedViewIn, overVirtualNode, eventNode);

		// make debugger stepper
		var debugStepper = makeDebugStepper(initialModel, viewOut, eventNode, parentNode, moduleName, popoutRef);

		return function stepper(model)
		{
			appStepper(model);
			overStepper(model);
			debugStepper(model);
		}
	};
}

function makeDebugStepper(initialModel, view, eventNode, parentNode, moduleName, popoutRef)
{
	var curr;
	var domNode;

	return function stepper(model)
	{
		if (!model.isDebuggerOpen)
		{
			return;
		}

		if (!popoutRef.doc)
		{
			curr = view(model);
			domNode = openDebugWindow(moduleName, popoutRef, curr, eventNode);
			return;
		}

		// switch to document of popout
		localDoc = popoutRef.doc;

		var next = view(model);
		var patches = diff(curr, next);
		domNode = applyPatches(domNode, curr, patches, eventNode);
		curr = next;

		// switch back to normal document
		localDoc = document;
	};
}

function openDebugWindow(moduleName, popoutRef, virtualNode, eventNode)
{
	var w = 900;
	var h = 360;
	var x = screen.width - w;
	var y = screen.height - h;
	var debugWindow = window.open('', '', 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y);

	// switch to window document
	localDoc = debugWindow.document;

	popoutRef.doc = localDoc;
	localDoc.title = 'Debugger - ' + moduleName;
	localDoc.body.style.margin = '0';
	localDoc.body.style.padding = '0';
	var domNode = render(virtualNode, eventNode);
	localDoc.body.appendChild(domNode);

	localDoc.addEventListener('keydown', function(event) {
		if (event.metaKey && event.which === 82)
		{
			window.location.reload();
		}
		if (event.which === 38)
		{
			eventNode.tagger({ ctor: 'Up' });
			event.preventDefault();
		}
		if (event.which === 40)
		{
			eventNode.tagger({ ctor: 'Down' });
			event.preventDefault();
		}
	});

	function close()
	{
		popoutRef.doc = undefined;
		debugWindow.close();
	}
	window.addEventListener('unload', close);
	debugWindow.addEventListener('unload', function() {
		popoutRef.doc = undefined;
		window.removeEventListener('unload', close);
		eventNode.tagger({ ctor: 'Close' });
	});

	// switch back to the normal document
	localDoc = document;

	return domNode;
}


// BLOCK EVENTS

function wrapViewIn(appEventNode, overlayNode, viewIn)
{
	var ignorer = makeIgnorer(overlayNode);
	var blocking = 'Normal';
	var overflow;

	var normalTagger = appEventNode.tagger;
	var blockTagger = function() {};

	return function(model)
	{
		var tuple = viewIn(model);
		var newBlocking = tuple._0.ctor;
		appEventNode.tagger = newBlocking === 'Normal' ? normalTagger : blockTagger;
		if (blocking !== newBlocking)
		{
			traverse('removeEventListener', ignorer, blocking);
			traverse('addEventListener', ignorer, newBlocking);

			if (blocking === 'Normal')
			{
				overflow = document.body.style.overflow;
				document.body.style.overflow = 'hidden';
			}

			if (newBlocking === 'Normal')
			{
				document.body.style.overflow = overflow;
			}

			blocking = newBlocking;
		}
		return tuple._1;
	}
}

function traverse(verbEventListener, ignorer, blocking)
{
	switch(blocking)
	{
		case 'Normal':
			return;

		case 'Pause':
			return traverseHelp(verbEventListener, ignorer, mostEvents);

		case 'Message':
			return traverseHelp(verbEventListener, ignorer, allEvents);
	}
}

function traverseHelp(verbEventListener, handler, eventNames)
{
	for (var i = 0; i < eventNames.length; i++)
	{
		document.body[verbEventListener](eventNames[i], handler, true);
	}
}

function makeIgnorer(overlayNode)
{
	return function(event)
	{
		if (event.type === 'keydown' && event.metaKey && event.which === 82)
		{
			return;
		}

		var isScroll = event.type === 'scroll' || event.type === 'wheel';

		var node = event.target;
		while (node !== null)
		{
			if (node.className === 'elm-overlay-message-details' && isScroll)
			{
				return;
			}

			if (node === overlayNode && !isScroll)
			{
				return;
			}
			node = node.parentNode;
		}

		event.stopPropagation();
		event.preventDefault();
	}
}

var mostEvents = [
	'click', 'dblclick', 'mousemove',
	'mouseup', 'mousedown', 'mouseenter', 'mouseleave',
	'touchstart', 'touchend', 'touchcancel', 'touchmove',
	'pointerdown', 'pointerup', 'pointerover', 'pointerout',
	'pointerenter', 'pointerleave', 'pointermove', 'pointercancel',
	'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
	'keyup', 'keydown', 'keypress',
	'input', 'change',
	'focus', 'blur'
];

var allEvents = mostEvents.concat('wheel', 'scroll');


return {
	node: node,
	text: text,
	custom: custom,
	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),
	mapProperty: F2(mapProperty),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: F3(keyedNode),

	program: program,
	programWithFlags: programWithFlags,
	staticProgram: staticProgram
};

}();

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

var _elm_lang$core$Tuple$mapSecond = F2(
	function (func, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: func(_p1._1)
		};
	});
var _elm_lang$core$Tuple$mapFirst = F2(
	function (func, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: func(_p3._0),
			_1: _p3._1
		};
	});
var _elm_lang$core$Tuple$second = function (_p4) {
	var _p5 = _p4;
	return _p5._1;
};
var _elm_lang$core$Tuple$first = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};

//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function program(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flags !== 'undefined')
				{
					throw new Error(
						'The `' + moduleName + '` module does not need flags.\n'
						+ 'Call ' + moduleName + '.worker() with no arguments and you should be all set!'
					);
				}

				return initialize(
					impl.init,
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function programWithFlags(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flagDecoder === 'undefined')
				{
					throw new Error(
						'Are you trying to sneak a Never value into Elm? Trickster!\n'
						+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
						+ 'Use `program` instead if you do not want flags.'
					);
				}

				var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
				if (result.ctor === 'Err')
				{
					throw new Error(
						moduleName + '.worker(...) was called with an unexpected argument.\n'
						+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
						+ result._0
					);
				}

				return initialize(
					impl.init(result._0),
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function renderer(enqueue, _)
{
	return function(_) {};
}


// HTML TO PROGRAM

function htmlToProgram(vnode)
{
	var emptyBag = batch(_elm_lang$core$Native_List.Nil);
	var noChange = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		emptyBag
	);

	return _elm_lang$virtual_dom$VirtualDom$program({
		init: noChange,
		view: function(model) { return main; },
		update: F2(function(msg, model) { return noChange; }),
		subscriptions: function (model) { return emptyBag; }
	});
}


// INITIALIZE A PROGRAM

function initialize(init, update, subscriptions, renderer)
{
	// ambient state
	var managers = {};
	var updateView;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var model = init._0;
		updateView = renderer(enqueue, model);
		var cmds = init._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			updateView(model);
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, loop, handleMsg);
	}

	var task = A2(andThen, loop, init);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = converter(cmdList._0);
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(value)
	{
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		currentSend(result._0);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,

	htmlToProgram: htmlToProgram,
	program: program,
	programWithFlags: programWithFlags,
	initialize: initialize,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(callback, task)
{
	return {
		ctor: '_Task_andThen',
		callback: callback,
		task: task
	};
}

function onError(callback, task)
{
	return {
		ctor: '_Task_onError',
		callback: callback,
		task: task
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$programWithFlags = _elm_lang$core$Native_Platform.programWithFlags;
var _elm_lang$core$Platform$program = _elm_lang$core$Native_Platform.program;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _elm_lang$virtual_dom$VirtualDom$programWithFlags = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.programWithFlags, _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags, impl);
};
var _elm_lang$virtual_dom$VirtualDom$program = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, impl);
};
var _elm_lang$virtual_dom$VirtualDom$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom$mapProperty = _elm_lang$virtual_dom$Native_VirtualDom.mapProperty;
var _elm_lang$virtual_dom$VirtualDom$attributeNS = _elm_lang$virtual_dom$Native_VirtualDom.attributeNS;
var _elm_lang$virtual_dom$VirtualDom$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom$Property = {ctor: 'Property'};

var _elm_lang$html$Html$programWithFlags = _elm_lang$virtual_dom$VirtualDom$programWithFlags;
var _elm_lang$html$Html$program = _elm_lang$virtual_dom$VirtualDom$program;
var _elm_lang$html$Html$beginnerProgram = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$html$Html$program(
		{
			init: A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_p1.model,
				{ctor: '[]'}),
			update: F2(
				function (msg, model) {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						A2(_p1.update, msg, model),
						{ctor: '[]'});
				}),
			view: _p1.view,
			subscriptions: function (_p2) {
				return _elm_lang$core$Platform_Sub$none;
			}
		});
};
var _elm_lang$html$Html$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$html$Html$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$html$Html$node = _elm_lang$virtual_dom$VirtualDom$node;
var _elm_lang$html$Html$body = _elm_lang$html$Html$node('body');
var _elm_lang$html$Html$section = _elm_lang$html$Html$node('section');
var _elm_lang$html$Html$nav = _elm_lang$html$Html$node('nav');
var _elm_lang$html$Html$article = _elm_lang$html$Html$node('article');
var _elm_lang$html$Html$aside = _elm_lang$html$Html$node('aside');
var _elm_lang$html$Html$h1 = _elm_lang$html$Html$node('h1');
var _elm_lang$html$Html$h2 = _elm_lang$html$Html$node('h2');
var _elm_lang$html$Html$h3 = _elm_lang$html$Html$node('h3');
var _elm_lang$html$Html$h4 = _elm_lang$html$Html$node('h4');
var _elm_lang$html$Html$h5 = _elm_lang$html$Html$node('h5');
var _elm_lang$html$Html$h6 = _elm_lang$html$Html$node('h6');
var _elm_lang$html$Html$header = _elm_lang$html$Html$node('header');
var _elm_lang$html$Html$footer = _elm_lang$html$Html$node('footer');
var _elm_lang$html$Html$address = _elm_lang$html$Html$node('address');
var _elm_lang$html$Html$main_ = _elm_lang$html$Html$node('main');
var _elm_lang$html$Html$p = _elm_lang$html$Html$node('p');
var _elm_lang$html$Html$hr = _elm_lang$html$Html$node('hr');
var _elm_lang$html$Html$pre = _elm_lang$html$Html$node('pre');
var _elm_lang$html$Html$blockquote = _elm_lang$html$Html$node('blockquote');
var _elm_lang$html$Html$ol = _elm_lang$html$Html$node('ol');
var _elm_lang$html$Html$ul = _elm_lang$html$Html$node('ul');
var _elm_lang$html$Html$li = _elm_lang$html$Html$node('li');
var _elm_lang$html$Html$dl = _elm_lang$html$Html$node('dl');
var _elm_lang$html$Html$dt = _elm_lang$html$Html$node('dt');
var _elm_lang$html$Html$dd = _elm_lang$html$Html$node('dd');
var _elm_lang$html$Html$figure = _elm_lang$html$Html$node('figure');
var _elm_lang$html$Html$figcaption = _elm_lang$html$Html$node('figcaption');
var _elm_lang$html$Html$div = _elm_lang$html$Html$node('div');
var _elm_lang$html$Html$a = _elm_lang$html$Html$node('a');
var _elm_lang$html$Html$em = _elm_lang$html$Html$node('em');
var _elm_lang$html$Html$strong = _elm_lang$html$Html$node('strong');
var _elm_lang$html$Html$small = _elm_lang$html$Html$node('small');
var _elm_lang$html$Html$s = _elm_lang$html$Html$node('s');
var _elm_lang$html$Html$cite = _elm_lang$html$Html$node('cite');
var _elm_lang$html$Html$q = _elm_lang$html$Html$node('q');
var _elm_lang$html$Html$dfn = _elm_lang$html$Html$node('dfn');
var _elm_lang$html$Html$abbr = _elm_lang$html$Html$node('abbr');
var _elm_lang$html$Html$time = _elm_lang$html$Html$node('time');
var _elm_lang$html$Html$code = _elm_lang$html$Html$node('code');
var _elm_lang$html$Html$var = _elm_lang$html$Html$node('var');
var _elm_lang$html$Html$samp = _elm_lang$html$Html$node('samp');
var _elm_lang$html$Html$kbd = _elm_lang$html$Html$node('kbd');
var _elm_lang$html$Html$sub = _elm_lang$html$Html$node('sub');
var _elm_lang$html$Html$sup = _elm_lang$html$Html$node('sup');
var _elm_lang$html$Html$i = _elm_lang$html$Html$node('i');
var _elm_lang$html$Html$b = _elm_lang$html$Html$node('b');
var _elm_lang$html$Html$u = _elm_lang$html$Html$node('u');
var _elm_lang$html$Html$mark = _elm_lang$html$Html$node('mark');
var _elm_lang$html$Html$ruby = _elm_lang$html$Html$node('ruby');
var _elm_lang$html$Html$rt = _elm_lang$html$Html$node('rt');
var _elm_lang$html$Html$rp = _elm_lang$html$Html$node('rp');
var _elm_lang$html$Html$bdi = _elm_lang$html$Html$node('bdi');
var _elm_lang$html$Html$bdo = _elm_lang$html$Html$node('bdo');
var _elm_lang$html$Html$span = _elm_lang$html$Html$node('span');
var _elm_lang$html$Html$br = _elm_lang$html$Html$node('br');
var _elm_lang$html$Html$wbr = _elm_lang$html$Html$node('wbr');
var _elm_lang$html$Html$ins = _elm_lang$html$Html$node('ins');
var _elm_lang$html$Html$del = _elm_lang$html$Html$node('del');
var _elm_lang$html$Html$img = _elm_lang$html$Html$node('img');
var _elm_lang$html$Html$iframe = _elm_lang$html$Html$node('iframe');
var _elm_lang$html$Html$embed = _elm_lang$html$Html$node('embed');
var _elm_lang$html$Html$object = _elm_lang$html$Html$node('object');
var _elm_lang$html$Html$param = _elm_lang$html$Html$node('param');
var _elm_lang$html$Html$video = _elm_lang$html$Html$node('video');
var _elm_lang$html$Html$audio = _elm_lang$html$Html$node('audio');
var _elm_lang$html$Html$source = _elm_lang$html$Html$node('source');
var _elm_lang$html$Html$track = _elm_lang$html$Html$node('track');
var _elm_lang$html$Html$canvas = _elm_lang$html$Html$node('canvas');
var _elm_lang$html$Html$math = _elm_lang$html$Html$node('math');
var _elm_lang$html$Html$table = _elm_lang$html$Html$node('table');
var _elm_lang$html$Html$caption = _elm_lang$html$Html$node('caption');
var _elm_lang$html$Html$colgroup = _elm_lang$html$Html$node('colgroup');
var _elm_lang$html$Html$col = _elm_lang$html$Html$node('col');
var _elm_lang$html$Html$tbody = _elm_lang$html$Html$node('tbody');
var _elm_lang$html$Html$thead = _elm_lang$html$Html$node('thead');
var _elm_lang$html$Html$tfoot = _elm_lang$html$Html$node('tfoot');
var _elm_lang$html$Html$tr = _elm_lang$html$Html$node('tr');
var _elm_lang$html$Html$td = _elm_lang$html$Html$node('td');
var _elm_lang$html$Html$th = _elm_lang$html$Html$node('th');
var _elm_lang$html$Html$form = _elm_lang$html$Html$node('form');
var _elm_lang$html$Html$fieldset = _elm_lang$html$Html$node('fieldset');
var _elm_lang$html$Html$legend = _elm_lang$html$Html$node('legend');
var _elm_lang$html$Html$label = _elm_lang$html$Html$node('label');
var _elm_lang$html$Html$input = _elm_lang$html$Html$node('input');
var _elm_lang$html$Html$button = _elm_lang$html$Html$node('button');
var _elm_lang$html$Html$select = _elm_lang$html$Html$node('select');
var _elm_lang$html$Html$datalist = _elm_lang$html$Html$node('datalist');
var _elm_lang$html$Html$optgroup = _elm_lang$html$Html$node('optgroup');
var _elm_lang$html$Html$option = _elm_lang$html$Html$node('option');
var _elm_lang$html$Html$textarea = _elm_lang$html$Html$node('textarea');
var _elm_lang$html$Html$keygen = _elm_lang$html$Html$node('keygen');
var _elm_lang$html$Html$output = _elm_lang$html$Html$node('output');
var _elm_lang$html$Html$progress = _elm_lang$html$Html$node('progress');
var _elm_lang$html$Html$meter = _elm_lang$html$Html$node('meter');
var _elm_lang$html$Html$details = _elm_lang$html$Html$node('details');
var _elm_lang$html$Html$summary = _elm_lang$html$Html$node('summary');
var _elm_lang$html$Html$menuitem = _elm_lang$html$Html$node('menuitem');
var _elm_lang$html$Html$menu = _elm_lang$html$Html$node('menu');

var _elm_lang$svg$Svg$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$svg$Svg$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$svg$Svg$svgNamespace = A2(
	_elm_lang$virtual_dom$VirtualDom$property,
	'namespace',
	_elm_lang$core$Json_Encode$string('http://www.w3.org/2000/svg'));
var _elm_lang$svg$Svg$node = F3(
	function (name, attributes, children) {
		return A3(
			_elm_lang$virtual_dom$VirtualDom$node,
			name,
			{ctor: '::', _0: _elm_lang$svg$Svg$svgNamespace, _1: attributes},
			children);
	});
var _elm_lang$svg$Svg$svg = _elm_lang$svg$Svg$node('svg');
var _elm_lang$svg$Svg$foreignObject = _elm_lang$svg$Svg$node('foreignObject');
var _elm_lang$svg$Svg$animate = _elm_lang$svg$Svg$node('animate');
var _elm_lang$svg$Svg$animateColor = _elm_lang$svg$Svg$node('animateColor');
var _elm_lang$svg$Svg$animateMotion = _elm_lang$svg$Svg$node('animateMotion');
var _elm_lang$svg$Svg$animateTransform = _elm_lang$svg$Svg$node('animateTransform');
var _elm_lang$svg$Svg$mpath = _elm_lang$svg$Svg$node('mpath');
var _elm_lang$svg$Svg$set = _elm_lang$svg$Svg$node('set');
var _elm_lang$svg$Svg$a = _elm_lang$svg$Svg$node('a');
var _elm_lang$svg$Svg$defs = _elm_lang$svg$Svg$node('defs');
var _elm_lang$svg$Svg$g = _elm_lang$svg$Svg$node('g');
var _elm_lang$svg$Svg$marker = _elm_lang$svg$Svg$node('marker');
var _elm_lang$svg$Svg$mask = _elm_lang$svg$Svg$node('mask');
var _elm_lang$svg$Svg$pattern = _elm_lang$svg$Svg$node('pattern');
var _elm_lang$svg$Svg$switch = _elm_lang$svg$Svg$node('switch');
var _elm_lang$svg$Svg$symbol = _elm_lang$svg$Svg$node('symbol');
var _elm_lang$svg$Svg$desc = _elm_lang$svg$Svg$node('desc');
var _elm_lang$svg$Svg$metadata = _elm_lang$svg$Svg$node('metadata');
var _elm_lang$svg$Svg$title = _elm_lang$svg$Svg$node('title');
var _elm_lang$svg$Svg$feBlend = _elm_lang$svg$Svg$node('feBlend');
var _elm_lang$svg$Svg$feColorMatrix = _elm_lang$svg$Svg$node('feColorMatrix');
var _elm_lang$svg$Svg$feComponentTransfer = _elm_lang$svg$Svg$node('feComponentTransfer');
var _elm_lang$svg$Svg$feComposite = _elm_lang$svg$Svg$node('feComposite');
var _elm_lang$svg$Svg$feConvolveMatrix = _elm_lang$svg$Svg$node('feConvolveMatrix');
var _elm_lang$svg$Svg$feDiffuseLighting = _elm_lang$svg$Svg$node('feDiffuseLighting');
var _elm_lang$svg$Svg$feDisplacementMap = _elm_lang$svg$Svg$node('feDisplacementMap');
var _elm_lang$svg$Svg$feFlood = _elm_lang$svg$Svg$node('feFlood');
var _elm_lang$svg$Svg$feFuncA = _elm_lang$svg$Svg$node('feFuncA');
var _elm_lang$svg$Svg$feFuncB = _elm_lang$svg$Svg$node('feFuncB');
var _elm_lang$svg$Svg$feFuncG = _elm_lang$svg$Svg$node('feFuncG');
var _elm_lang$svg$Svg$feFuncR = _elm_lang$svg$Svg$node('feFuncR');
var _elm_lang$svg$Svg$feGaussianBlur = _elm_lang$svg$Svg$node('feGaussianBlur');
var _elm_lang$svg$Svg$feImage = _elm_lang$svg$Svg$node('feImage');
var _elm_lang$svg$Svg$feMerge = _elm_lang$svg$Svg$node('feMerge');
var _elm_lang$svg$Svg$feMergeNode = _elm_lang$svg$Svg$node('feMergeNode');
var _elm_lang$svg$Svg$feMorphology = _elm_lang$svg$Svg$node('feMorphology');
var _elm_lang$svg$Svg$feOffset = _elm_lang$svg$Svg$node('feOffset');
var _elm_lang$svg$Svg$feSpecularLighting = _elm_lang$svg$Svg$node('feSpecularLighting');
var _elm_lang$svg$Svg$feTile = _elm_lang$svg$Svg$node('feTile');
var _elm_lang$svg$Svg$feTurbulence = _elm_lang$svg$Svg$node('feTurbulence');
var _elm_lang$svg$Svg$font = _elm_lang$svg$Svg$node('font');
var _elm_lang$svg$Svg$linearGradient = _elm_lang$svg$Svg$node('linearGradient');
var _elm_lang$svg$Svg$radialGradient = _elm_lang$svg$Svg$node('radialGradient');
var _elm_lang$svg$Svg$stop = _elm_lang$svg$Svg$node('stop');
var _elm_lang$svg$Svg$circle = _elm_lang$svg$Svg$node('circle');
var _elm_lang$svg$Svg$ellipse = _elm_lang$svg$Svg$node('ellipse');
var _elm_lang$svg$Svg$image = _elm_lang$svg$Svg$node('image');
var _elm_lang$svg$Svg$line = _elm_lang$svg$Svg$node('line');
var _elm_lang$svg$Svg$path = _elm_lang$svg$Svg$node('path');
var _elm_lang$svg$Svg$polygon = _elm_lang$svg$Svg$node('polygon');
var _elm_lang$svg$Svg$polyline = _elm_lang$svg$Svg$node('polyline');
var _elm_lang$svg$Svg$rect = _elm_lang$svg$Svg$node('rect');
var _elm_lang$svg$Svg$use = _elm_lang$svg$Svg$node('use');
var _elm_lang$svg$Svg$feDistantLight = _elm_lang$svg$Svg$node('feDistantLight');
var _elm_lang$svg$Svg$fePointLight = _elm_lang$svg$Svg$node('fePointLight');
var _elm_lang$svg$Svg$feSpotLight = _elm_lang$svg$Svg$node('feSpotLight');
var _elm_lang$svg$Svg$altGlyph = _elm_lang$svg$Svg$node('altGlyph');
var _elm_lang$svg$Svg$altGlyphDef = _elm_lang$svg$Svg$node('altGlyphDef');
var _elm_lang$svg$Svg$altGlyphItem = _elm_lang$svg$Svg$node('altGlyphItem');
var _elm_lang$svg$Svg$glyph = _elm_lang$svg$Svg$node('glyph');
var _elm_lang$svg$Svg$glyphRef = _elm_lang$svg$Svg$node('glyphRef');
var _elm_lang$svg$Svg$textPath = _elm_lang$svg$Svg$node('textPath');
var _elm_lang$svg$Svg$text_ = _elm_lang$svg$Svg$node('text');
var _elm_lang$svg$Svg$tref = _elm_lang$svg$Svg$node('tref');
var _elm_lang$svg$Svg$tspan = _elm_lang$svg$Svg$node('tspan');
var _elm_lang$svg$Svg$clipPath = _elm_lang$svg$Svg$node('clipPath');
var _elm_lang$svg$Svg$colorProfile = _elm_lang$svg$Svg$node('colorProfile');
var _elm_lang$svg$Svg$cursor = _elm_lang$svg$Svg$node('cursor');
var _elm_lang$svg$Svg$filter = _elm_lang$svg$Svg$node('filter');
var _elm_lang$svg$Svg$script = _elm_lang$svg$Svg$node('script');
var _elm_lang$svg$Svg$style = _elm_lang$svg$Svg$node('style');
var _elm_lang$svg$Svg$view = _elm_lang$svg$Svg$node('view');

var _elm_lang$svg$Svg_Attributes$writingMode = _elm_lang$virtual_dom$VirtualDom$attribute('writing-mode');
var _elm_lang$svg$Svg_Attributes$wordSpacing = _elm_lang$virtual_dom$VirtualDom$attribute('word-spacing');
var _elm_lang$svg$Svg_Attributes$visibility = _elm_lang$virtual_dom$VirtualDom$attribute('visibility');
var _elm_lang$svg$Svg_Attributes$unicodeBidi = _elm_lang$virtual_dom$VirtualDom$attribute('unicode-bidi');
var _elm_lang$svg$Svg_Attributes$textRendering = _elm_lang$virtual_dom$VirtualDom$attribute('text-rendering');
var _elm_lang$svg$Svg_Attributes$textDecoration = _elm_lang$virtual_dom$VirtualDom$attribute('text-decoration');
var _elm_lang$svg$Svg_Attributes$textAnchor = _elm_lang$virtual_dom$VirtualDom$attribute('text-anchor');
var _elm_lang$svg$Svg_Attributes$stroke = _elm_lang$virtual_dom$VirtualDom$attribute('stroke');
var _elm_lang$svg$Svg_Attributes$strokeWidth = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-width');
var _elm_lang$svg$Svg_Attributes$strokeOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-opacity');
var _elm_lang$svg$Svg_Attributes$strokeMiterlimit = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-miterlimit');
var _elm_lang$svg$Svg_Attributes$strokeLinejoin = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-linejoin');
var _elm_lang$svg$Svg_Attributes$strokeLinecap = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-linecap');
var _elm_lang$svg$Svg_Attributes$strokeDashoffset = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-dashoffset');
var _elm_lang$svg$Svg_Attributes$strokeDasharray = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-dasharray');
var _elm_lang$svg$Svg_Attributes$stopOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('stop-opacity');
var _elm_lang$svg$Svg_Attributes$stopColor = _elm_lang$virtual_dom$VirtualDom$attribute('stop-color');
var _elm_lang$svg$Svg_Attributes$shapeRendering = _elm_lang$virtual_dom$VirtualDom$attribute('shape-rendering');
var _elm_lang$svg$Svg_Attributes$pointerEvents = _elm_lang$virtual_dom$VirtualDom$attribute('pointer-events');
var _elm_lang$svg$Svg_Attributes$overflow = _elm_lang$virtual_dom$VirtualDom$attribute('overflow');
var _elm_lang$svg$Svg_Attributes$opacity = _elm_lang$virtual_dom$VirtualDom$attribute('opacity');
var _elm_lang$svg$Svg_Attributes$mask = _elm_lang$virtual_dom$VirtualDom$attribute('mask');
var _elm_lang$svg$Svg_Attributes$markerStart = _elm_lang$virtual_dom$VirtualDom$attribute('marker-start');
var _elm_lang$svg$Svg_Attributes$markerMid = _elm_lang$virtual_dom$VirtualDom$attribute('marker-mid');
var _elm_lang$svg$Svg_Attributes$markerEnd = _elm_lang$virtual_dom$VirtualDom$attribute('marker-end');
var _elm_lang$svg$Svg_Attributes$lightingColor = _elm_lang$virtual_dom$VirtualDom$attribute('lighting-color');
var _elm_lang$svg$Svg_Attributes$letterSpacing = _elm_lang$virtual_dom$VirtualDom$attribute('letter-spacing');
var _elm_lang$svg$Svg_Attributes$kerning = _elm_lang$virtual_dom$VirtualDom$attribute('kerning');
var _elm_lang$svg$Svg_Attributes$imageRendering = _elm_lang$virtual_dom$VirtualDom$attribute('image-rendering');
var _elm_lang$svg$Svg_Attributes$glyphOrientationVertical = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-orientation-vertical');
var _elm_lang$svg$Svg_Attributes$glyphOrientationHorizontal = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-orientation-horizontal');
var _elm_lang$svg$Svg_Attributes$fontWeight = _elm_lang$virtual_dom$VirtualDom$attribute('font-weight');
var _elm_lang$svg$Svg_Attributes$fontVariant = _elm_lang$virtual_dom$VirtualDom$attribute('font-variant');
var _elm_lang$svg$Svg_Attributes$fontStyle = _elm_lang$virtual_dom$VirtualDom$attribute('font-style');
var _elm_lang$svg$Svg_Attributes$fontStretch = _elm_lang$virtual_dom$VirtualDom$attribute('font-stretch');
var _elm_lang$svg$Svg_Attributes$fontSize = _elm_lang$virtual_dom$VirtualDom$attribute('font-size');
var _elm_lang$svg$Svg_Attributes$fontSizeAdjust = _elm_lang$virtual_dom$VirtualDom$attribute('font-size-adjust');
var _elm_lang$svg$Svg_Attributes$fontFamily = _elm_lang$virtual_dom$VirtualDom$attribute('font-family');
var _elm_lang$svg$Svg_Attributes$floodOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('flood-opacity');
var _elm_lang$svg$Svg_Attributes$floodColor = _elm_lang$virtual_dom$VirtualDom$attribute('flood-color');
var _elm_lang$svg$Svg_Attributes$filter = _elm_lang$virtual_dom$VirtualDom$attribute('filter');
var _elm_lang$svg$Svg_Attributes$fill = _elm_lang$virtual_dom$VirtualDom$attribute('fill');
var _elm_lang$svg$Svg_Attributes$fillRule = _elm_lang$virtual_dom$VirtualDom$attribute('fill-rule');
var _elm_lang$svg$Svg_Attributes$fillOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('fill-opacity');
var _elm_lang$svg$Svg_Attributes$enableBackground = _elm_lang$virtual_dom$VirtualDom$attribute('enable-background');
var _elm_lang$svg$Svg_Attributes$dominantBaseline = _elm_lang$virtual_dom$VirtualDom$attribute('dominant-baseline');
var _elm_lang$svg$Svg_Attributes$display = _elm_lang$virtual_dom$VirtualDom$attribute('display');
var _elm_lang$svg$Svg_Attributes$direction = _elm_lang$virtual_dom$VirtualDom$attribute('direction');
var _elm_lang$svg$Svg_Attributes$cursor = _elm_lang$virtual_dom$VirtualDom$attribute('cursor');
var _elm_lang$svg$Svg_Attributes$color = _elm_lang$virtual_dom$VirtualDom$attribute('color');
var _elm_lang$svg$Svg_Attributes$colorRendering = _elm_lang$virtual_dom$VirtualDom$attribute('color-rendering');
var _elm_lang$svg$Svg_Attributes$colorProfile = _elm_lang$virtual_dom$VirtualDom$attribute('color-profile');
var _elm_lang$svg$Svg_Attributes$colorInterpolation = _elm_lang$virtual_dom$VirtualDom$attribute('color-interpolation');
var _elm_lang$svg$Svg_Attributes$colorInterpolationFilters = _elm_lang$virtual_dom$VirtualDom$attribute('color-interpolation-filters');
var _elm_lang$svg$Svg_Attributes$clip = _elm_lang$virtual_dom$VirtualDom$attribute('clip');
var _elm_lang$svg$Svg_Attributes$clipRule = _elm_lang$virtual_dom$VirtualDom$attribute('clip-rule');
var _elm_lang$svg$Svg_Attributes$clipPath = _elm_lang$virtual_dom$VirtualDom$attribute('clip-path');
var _elm_lang$svg$Svg_Attributes$baselineShift = _elm_lang$virtual_dom$VirtualDom$attribute('baseline-shift');
var _elm_lang$svg$Svg_Attributes$alignmentBaseline = _elm_lang$virtual_dom$VirtualDom$attribute('alignment-baseline');
var _elm_lang$svg$Svg_Attributes$zoomAndPan = _elm_lang$virtual_dom$VirtualDom$attribute('zoomAndPan');
var _elm_lang$svg$Svg_Attributes$z = _elm_lang$virtual_dom$VirtualDom$attribute('z');
var _elm_lang$svg$Svg_Attributes$yChannelSelector = _elm_lang$virtual_dom$VirtualDom$attribute('yChannelSelector');
var _elm_lang$svg$Svg_Attributes$y2 = _elm_lang$virtual_dom$VirtualDom$attribute('y2');
var _elm_lang$svg$Svg_Attributes$y1 = _elm_lang$virtual_dom$VirtualDom$attribute('y1');
var _elm_lang$svg$Svg_Attributes$y = _elm_lang$virtual_dom$VirtualDom$attribute('y');
var _elm_lang$svg$Svg_Attributes$xmlSpace = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:space');
var _elm_lang$svg$Svg_Attributes$xmlLang = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:lang');
var _elm_lang$svg$Svg_Attributes$xmlBase = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:base');
var _elm_lang$svg$Svg_Attributes$xlinkType = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:type');
var _elm_lang$svg$Svg_Attributes$xlinkTitle = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:title');
var _elm_lang$svg$Svg_Attributes$xlinkShow = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:show');
var _elm_lang$svg$Svg_Attributes$xlinkRole = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:role');
var _elm_lang$svg$Svg_Attributes$xlinkHref = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:href');
var _elm_lang$svg$Svg_Attributes$xlinkArcrole = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:arcrole');
var _elm_lang$svg$Svg_Attributes$xlinkActuate = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:actuate');
var _elm_lang$svg$Svg_Attributes$xChannelSelector = _elm_lang$virtual_dom$VirtualDom$attribute('xChannelSelector');
var _elm_lang$svg$Svg_Attributes$x2 = _elm_lang$virtual_dom$VirtualDom$attribute('x2');
var _elm_lang$svg$Svg_Attributes$x1 = _elm_lang$virtual_dom$VirtualDom$attribute('x1');
var _elm_lang$svg$Svg_Attributes$xHeight = _elm_lang$virtual_dom$VirtualDom$attribute('x-height');
var _elm_lang$svg$Svg_Attributes$x = _elm_lang$virtual_dom$VirtualDom$attribute('x');
var _elm_lang$svg$Svg_Attributes$widths = _elm_lang$virtual_dom$VirtualDom$attribute('widths');
var _elm_lang$svg$Svg_Attributes$width = _elm_lang$virtual_dom$VirtualDom$attribute('width');
var _elm_lang$svg$Svg_Attributes$viewTarget = _elm_lang$virtual_dom$VirtualDom$attribute('viewTarget');
var _elm_lang$svg$Svg_Attributes$viewBox = _elm_lang$virtual_dom$VirtualDom$attribute('viewBox');
var _elm_lang$svg$Svg_Attributes$vertOriginY = _elm_lang$virtual_dom$VirtualDom$attribute('vert-origin-y');
var _elm_lang$svg$Svg_Attributes$vertOriginX = _elm_lang$virtual_dom$VirtualDom$attribute('vert-origin-x');
var _elm_lang$svg$Svg_Attributes$vertAdvY = _elm_lang$virtual_dom$VirtualDom$attribute('vert-adv-y');
var _elm_lang$svg$Svg_Attributes$version = _elm_lang$virtual_dom$VirtualDom$attribute('version');
var _elm_lang$svg$Svg_Attributes$values = _elm_lang$virtual_dom$VirtualDom$attribute('values');
var _elm_lang$svg$Svg_Attributes$vMathematical = _elm_lang$virtual_dom$VirtualDom$attribute('v-mathematical');
var _elm_lang$svg$Svg_Attributes$vIdeographic = _elm_lang$virtual_dom$VirtualDom$attribute('v-ideographic');
var _elm_lang$svg$Svg_Attributes$vHanging = _elm_lang$virtual_dom$VirtualDom$attribute('v-hanging');
var _elm_lang$svg$Svg_Attributes$vAlphabetic = _elm_lang$virtual_dom$VirtualDom$attribute('v-alphabetic');
var _elm_lang$svg$Svg_Attributes$unitsPerEm = _elm_lang$virtual_dom$VirtualDom$attribute('units-per-em');
var _elm_lang$svg$Svg_Attributes$unicodeRange = _elm_lang$virtual_dom$VirtualDom$attribute('unicode-range');
var _elm_lang$svg$Svg_Attributes$unicode = _elm_lang$virtual_dom$VirtualDom$attribute('unicode');
var _elm_lang$svg$Svg_Attributes$underlineThickness = _elm_lang$virtual_dom$VirtualDom$attribute('underline-thickness');
var _elm_lang$svg$Svg_Attributes$underlinePosition = _elm_lang$virtual_dom$VirtualDom$attribute('underline-position');
var _elm_lang$svg$Svg_Attributes$u2 = _elm_lang$virtual_dom$VirtualDom$attribute('u2');
var _elm_lang$svg$Svg_Attributes$u1 = _elm_lang$virtual_dom$VirtualDom$attribute('u1');
var _elm_lang$svg$Svg_Attributes$type_ = _elm_lang$virtual_dom$VirtualDom$attribute('type');
var _elm_lang$svg$Svg_Attributes$transform = _elm_lang$virtual_dom$VirtualDom$attribute('transform');
var _elm_lang$svg$Svg_Attributes$to = _elm_lang$virtual_dom$VirtualDom$attribute('to');
var _elm_lang$svg$Svg_Attributes$title = _elm_lang$virtual_dom$VirtualDom$attribute('title');
var _elm_lang$svg$Svg_Attributes$textLength = _elm_lang$virtual_dom$VirtualDom$attribute('textLength');
var _elm_lang$svg$Svg_Attributes$targetY = _elm_lang$virtual_dom$VirtualDom$attribute('targetY');
var _elm_lang$svg$Svg_Attributes$targetX = _elm_lang$virtual_dom$VirtualDom$attribute('targetX');
var _elm_lang$svg$Svg_Attributes$target = _elm_lang$virtual_dom$VirtualDom$attribute('target');
var _elm_lang$svg$Svg_Attributes$tableValues = _elm_lang$virtual_dom$VirtualDom$attribute('tableValues');
var _elm_lang$svg$Svg_Attributes$systemLanguage = _elm_lang$virtual_dom$VirtualDom$attribute('systemLanguage');
var _elm_lang$svg$Svg_Attributes$surfaceScale = _elm_lang$virtual_dom$VirtualDom$attribute('surfaceScale');
var _elm_lang$svg$Svg_Attributes$style = _elm_lang$virtual_dom$VirtualDom$attribute('style');
var _elm_lang$svg$Svg_Attributes$string = _elm_lang$virtual_dom$VirtualDom$attribute('string');
var _elm_lang$svg$Svg_Attributes$strikethroughThickness = _elm_lang$virtual_dom$VirtualDom$attribute('strikethrough-thickness');
var _elm_lang$svg$Svg_Attributes$strikethroughPosition = _elm_lang$virtual_dom$VirtualDom$attribute('strikethrough-position');
var _elm_lang$svg$Svg_Attributes$stitchTiles = _elm_lang$virtual_dom$VirtualDom$attribute('stitchTiles');
var _elm_lang$svg$Svg_Attributes$stemv = _elm_lang$virtual_dom$VirtualDom$attribute('stemv');
var _elm_lang$svg$Svg_Attributes$stemh = _elm_lang$virtual_dom$VirtualDom$attribute('stemh');
var _elm_lang$svg$Svg_Attributes$stdDeviation = _elm_lang$virtual_dom$VirtualDom$attribute('stdDeviation');
var _elm_lang$svg$Svg_Attributes$startOffset = _elm_lang$virtual_dom$VirtualDom$attribute('startOffset');
var _elm_lang$svg$Svg_Attributes$spreadMethod = _elm_lang$virtual_dom$VirtualDom$attribute('spreadMethod');
var _elm_lang$svg$Svg_Attributes$speed = _elm_lang$virtual_dom$VirtualDom$attribute('speed');
var _elm_lang$svg$Svg_Attributes$specularExponent = _elm_lang$virtual_dom$VirtualDom$attribute('specularExponent');
var _elm_lang$svg$Svg_Attributes$specularConstant = _elm_lang$virtual_dom$VirtualDom$attribute('specularConstant');
var _elm_lang$svg$Svg_Attributes$spacing = _elm_lang$virtual_dom$VirtualDom$attribute('spacing');
var _elm_lang$svg$Svg_Attributes$slope = _elm_lang$virtual_dom$VirtualDom$attribute('slope');
var _elm_lang$svg$Svg_Attributes$seed = _elm_lang$virtual_dom$VirtualDom$attribute('seed');
var _elm_lang$svg$Svg_Attributes$scale = _elm_lang$virtual_dom$VirtualDom$attribute('scale');
var _elm_lang$svg$Svg_Attributes$ry = _elm_lang$virtual_dom$VirtualDom$attribute('ry');
var _elm_lang$svg$Svg_Attributes$rx = _elm_lang$virtual_dom$VirtualDom$attribute('rx');
var _elm_lang$svg$Svg_Attributes$rotate = _elm_lang$virtual_dom$VirtualDom$attribute('rotate');
var _elm_lang$svg$Svg_Attributes$result = _elm_lang$virtual_dom$VirtualDom$attribute('result');
var _elm_lang$svg$Svg_Attributes$restart = _elm_lang$virtual_dom$VirtualDom$attribute('restart');
var _elm_lang$svg$Svg_Attributes$requiredFeatures = _elm_lang$virtual_dom$VirtualDom$attribute('requiredFeatures');
var _elm_lang$svg$Svg_Attributes$requiredExtensions = _elm_lang$virtual_dom$VirtualDom$attribute('requiredExtensions');
var _elm_lang$svg$Svg_Attributes$repeatDur = _elm_lang$virtual_dom$VirtualDom$attribute('repeatDur');
var _elm_lang$svg$Svg_Attributes$repeatCount = _elm_lang$virtual_dom$VirtualDom$attribute('repeatCount');
var _elm_lang$svg$Svg_Attributes$renderingIntent = _elm_lang$virtual_dom$VirtualDom$attribute('rendering-intent');
var _elm_lang$svg$Svg_Attributes$refY = _elm_lang$virtual_dom$VirtualDom$attribute('refY');
var _elm_lang$svg$Svg_Attributes$refX = _elm_lang$virtual_dom$VirtualDom$attribute('refX');
var _elm_lang$svg$Svg_Attributes$radius = _elm_lang$virtual_dom$VirtualDom$attribute('radius');
var _elm_lang$svg$Svg_Attributes$r = _elm_lang$virtual_dom$VirtualDom$attribute('r');
var _elm_lang$svg$Svg_Attributes$primitiveUnits = _elm_lang$virtual_dom$VirtualDom$attribute('primitiveUnits');
var _elm_lang$svg$Svg_Attributes$preserveAspectRatio = _elm_lang$virtual_dom$VirtualDom$attribute('preserveAspectRatio');
var _elm_lang$svg$Svg_Attributes$preserveAlpha = _elm_lang$virtual_dom$VirtualDom$attribute('preserveAlpha');
var _elm_lang$svg$Svg_Attributes$pointsAtZ = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtZ');
var _elm_lang$svg$Svg_Attributes$pointsAtY = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtY');
var _elm_lang$svg$Svg_Attributes$pointsAtX = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtX');
var _elm_lang$svg$Svg_Attributes$points = _elm_lang$virtual_dom$VirtualDom$attribute('points');
var _elm_lang$svg$Svg_Attributes$pointOrder = _elm_lang$virtual_dom$VirtualDom$attribute('point-order');
var _elm_lang$svg$Svg_Attributes$patternUnits = _elm_lang$virtual_dom$VirtualDom$attribute('patternUnits');
var _elm_lang$svg$Svg_Attributes$patternTransform = _elm_lang$virtual_dom$VirtualDom$attribute('patternTransform');
var _elm_lang$svg$Svg_Attributes$patternContentUnits = _elm_lang$virtual_dom$VirtualDom$attribute('patternContentUnits');
var _elm_lang$svg$Svg_Attributes$pathLength = _elm_lang$virtual_dom$VirtualDom$attribute('pathLength');
var _elm_lang$svg$Svg_Attributes$path = _elm_lang$virtual_dom$VirtualDom$attribute('path');
var _elm_lang$svg$Svg_Attributes$panose1 = _elm_lang$virtual_dom$VirtualDom$attribute('panose-1');
var _elm_lang$svg$Svg_Attributes$overlineThickness = _elm_lang$virtual_dom$VirtualDom$attribute('overline-thickness');
var _elm_lang$svg$Svg_Attributes$overlinePosition = _elm_lang$virtual_dom$VirtualDom$attribute('overline-position');
var _elm_lang$svg$Svg_Attributes$origin = _elm_lang$virtual_dom$VirtualDom$attribute('origin');
var _elm_lang$svg$Svg_Attributes$orientation = _elm_lang$virtual_dom$VirtualDom$attribute('orientation');
var _elm_lang$svg$Svg_Attributes$orient = _elm_lang$virtual_dom$VirtualDom$attribute('orient');
var _elm_lang$svg$Svg_Attributes$order = _elm_lang$virtual_dom$VirtualDom$attribute('order');
var _elm_lang$svg$Svg_Attributes$operator = _elm_lang$virtual_dom$VirtualDom$attribute('operator');
var _elm_lang$svg$Svg_Attributes$offset = _elm_lang$virtual_dom$VirtualDom$attribute('offset');
var _elm_lang$svg$Svg_Attributes$numOctaves = _elm_lang$virtual_dom$VirtualDom$attribute('numOctaves');
var _elm_lang$svg$Svg_Attributes$name = _elm_lang$virtual_dom$VirtualDom$attribute('name');
var _elm_lang$svg$Svg_Attributes$mode = _elm_lang$virtual_dom$VirtualDom$attribute('mode');
var _elm_lang$svg$Svg_Attributes$min = _elm_lang$virtual_dom$VirtualDom$attribute('min');
var _elm_lang$svg$Svg_Attributes$method = _elm_lang$virtual_dom$VirtualDom$attribute('method');
var _elm_lang$svg$Svg_Attributes$media = _elm_lang$virtual_dom$VirtualDom$attribute('media');
var _elm_lang$svg$Svg_Attributes$max = _elm_lang$virtual_dom$VirtualDom$attribute('max');
var _elm_lang$svg$Svg_Attributes$mathematical = _elm_lang$virtual_dom$VirtualDom$attribute('mathematical');
var _elm_lang$svg$Svg_Attributes$maskUnits = _elm_lang$virtual_dom$VirtualDom$attribute('maskUnits');
var _elm_lang$svg$Svg_Attributes$maskContentUnits = _elm_lang$virtual_dom$VirtualDom$attribute('maskContentUnits');
var _elm_lang$svg$Svg_Attributes$markerWidth = _elm_lang$virtual_dom$VirtualDom$attribute('markerWidth');
var _elm_lang$svg$Svg_Attributes$markerUnits = _elm_lang$virtual_dom$VirtualDom$attribute('markerUnits');
var _elm_lang$svg$Svg_Attributes$markerHeight = _elm_lang$virtual_dom$VirtualDom$attribute('markerHeight');
var _elm_lang$svg$Svg_Attributes$local = _elm_lang$virtual_dom$VirtualDom$attribute('local');
var _elm_lang$svg$Svg_Attributes$limitingConeAngle = _elm_lang$virtual_dom$VirtualDom$attribute('limitingConeAngle');
var _elm_lang$svg$Svg_Attributes$lengthAdjust = _elm_lang$virtual_dom$VirtualDom$attribute('lengthAdjust');
var _elm_lang$svg$Svg_Attributes$lang = _elm_lang$virtual_dom$VirtualDom$attribute('lang');
var _elm_lang$svg$Svg_Attributes$keyTimes = _elm_lang$virtual_dom$VirtualDom$attribute('keyTimes');
var _elm_lang$svg$Svg_Attributes$keySplines = _elm_lang$virtual_dom$VirtualDom$attribute('keySplines');
var _elm_lang$svg$Svg_Attributes$keyPoints = _elm_lang$virtual_dom$VirtualDom$attribute('keyPoints');
var _elm_lang$svg$Svg_Attributes$kernelUnitLength = _elm_lang$virtual_dom$VirtualDom$attribute('kernelUnitLength');
var _elm_lang$svg$Svg_Attributes$kernelMatrix = _elm_lang$virtual_dom$VirtualDom$attribute('kernelMatrix');
var _elm_lang$svg$Svg_Attributes$k4 = _elm_lang$virtual_dom$VirtualDom$attribute('k4');
var _elm_lang$svg$Svg_Attributes$k3 = _elm_lang$virtual_dom$VirtualDom$attribute('k3');
var _elm_lang$svg$Svg_Attributes$k2 = _elm_lang$virtual_dom$VirtualDom$attribute('k2');
var _elm_lang$svg$Svg_Attributes$k1 = _elm_lang$virtual_dom$VirtualDom$attribute('k1');
var _elm_lang$svg$Svg_Attributes$k = _elm_lang$virtual_dom$VirtualDom$attribute('k');
var _elm_lang$svg$Svg_Attributes$intercept = _elm_lang$virtual_dom$VirtualDom$attribute('intercept');
var _elm_lang$svg$Svg_Attributes$in2 = _elm_lang$virtual_dom$VirtualDom$attribute('in2');
var _elm_lang$svg$Svg_Attributes$in_ = _elm_lang$virtual_dom$VirtualDom$attribute('in');
var _elm_lang$svg$Svg_Attributes$ideographic = _elm_lang$virtual_dom$VirtualDom$attribute('ideographic');
var _elm_lang$svg$Svg_Attributes$id = _elm_lang$virtual_dom$VirtualDom$attribute('id');
var _elm_lang$svg$Svg_Attributes$horizOriginY = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-origin-y');
var _elm_lang$svg$Svg_Attributes$horizOriginX = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-origin-x');
var _elm_lang$svg$Svg_Attributes$horizAdvX = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-adv-x');
var _elm_lang$svg$Svg_Attributes$height = _elm_lang$virtual_dom$VirtualDom$attribute('height');
var _elm_lang$svg$Svg_Attributes$hanging = _elm_lang$virtual_dom$VirtualDom$attribute('hanging');
var _elm_lang$svg$Svg_Attributes$gradientUnits = _elm_lang$virtual_dom$VirtualDom$attribute('gradientUnits');
var _elm_lang$svg$Svg_Attributes$gradientTransform = _elm_lang$virtual_dom$VirtualDom$attribute('gradientTransform');
var _elm_lang$svg$Svg_Attributes$glyphRef = _elm_lang$virtual_dom$VirtualDom$attribute('glyphRef');
var _elm_lang$svg$Svg_Attributes$glyphName = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-name');
var _elm_lang$svg$Svg_Attributes$g2 = _elm_lang$virtual_dom$VirtualDom$attribute('g2');
var _elm_lang$svg$Svg_Attributes$g1 = _elm_lang$virtual_dom$VirtualDom$attribute('g1');
var _elm_lang$svg$Svg_Attributes$fy = _elm_lang$virtual_dom$VirtualDom$attribute('fy');
var _elm_lang$svg$Svg_Attributes$fx = _elm_lang$virtual_dom$VirtualDom$attribute('fx');
var _elm_lang$svg$Svg_Attributes$from = _elm_lang$virtual_dom$VirtualDom$attribute('from');
var _elm_lang$svg$Svg_Attributes$format = _elm_lang$virtual_dom$VirtualDom$attribute('format');
var _elm_lang$svg$Svg_Attributes$filterUnits = _elm_lang$virtual_dom$VirtualDom$attribute('filterUnits');
var _elm_lang$svg$Svg_Attributes$filterRes = _elm_lang$virtual_dom$VirtualDom$attribute('filterRes');
var _elm_lang$svg$Svg_Attributes$externalResourcesRequired = _elm_lang$virtual_dom$VirtualDom$attribute('externalResourcesRequired');
var _elm_lang$svg$Svg_Attributes$exponent = _elm_lang$virtual_dom$VirtualDom$attribute('exponent');
var _elm_lang$svg$Svg_Attributes$end = _elm_lang$virtual_dom$VirtualDom$attribute('end');
var _elm_lang$svg$Svg_Attributes$elevation = _elm_lang$virtual_dom$VirtualDom$attribute('elevation');
var _elm_lang$svg$Svg_Attributes$edgeMode = _elm_lang$virtual_dom$VirtualDom$attribute('edgeMode');
var _elm_lang$svg$Svg_Attributes$dy = _elm_lang$virtual_dom$VirtualDom$attribute('dy');
var _elm_lang$svg$Svg_Attributes$dx = _elm_lang$virtual_dom$VirtualDom$attribute('dx');
var _elm_lang$svg$Svg_Attributes$dur = _elm_lang$virtual_dom$VirtualDom$attribute('dur');
var _elm_lang$svg$Svg_Attributes$divisor = _elm_lang$virtual_dom$VirtualDom$attribute('divisor');
var _elm_lang$svg$Svg_Attributes$diffuseConstant = _elm_lang$virtual_dom$VirtualDom$attribute('diffuseConstant');
var _elm_lang$svg$Svg_Attributes$descent = _elm_lang$virtual_dom$VirtualDom$attribute('descent');
var _elm_lang$svg$Svg_Attributes$decelerate = _elm_lang$virtual_dom$VirtualDom$attribute('decelerate');
var _elm_lang$svg$Svg_Attributes$d = _elm_lang$virtual_dom$VirtualDom$attribute('d');
var _elm_lang$svg$Svg_Attributes$cy = _elm_lang$virtual_dom$VirtualDom$attribute('cy');
var _elm_lang$svg$Svg_Attributes$cx = _elm_lang$virtual_dom$VirtualDom$attribute('cx');
var _elm_lang$svg$Svg_Attributes$contentStyleType = _elm_lang$virtual_dom$VirtualDom$attribute('contentStyleType');
var _elm_lang$svg$Svg_Attributes$contentScriptType = _elm_lang$virtual_dom$VirtualDom$attribute('contentScriptType');
var _elm_lang$svg$Svg_Attributes$clipPathUnits = _elm_lang$virtual_dom$VirtualDom$attribute('clipPathUnits');
var _elm_lang$svg$Svg_Attributes$class = _elm_lang$virtual_dom$VirtualDom$attribute('class');
var _elm_lang$svg$Svg_Attributes$capHeight = _elm_lang$virtual_dom$VirtualDom$attribute('cap-height');
var _elm_lang$svg$Svg_Attributes$calcMode = _elm_lang$virtual_dom$VirtualDom$attribute('calcMode');
var _elm_lang$svg$Svg_Attributes$by = _elm_lang$virtual_dom$VirtualDom$attribute('by');
var _elm_lang$svg$Svg_Attributes$bias = _elm_lang$virtual_dom$VirtualDom$attribute('bias');
var _elm_lang$svg$Svg_Attributes$begin = _elm_lang$virtual_dom$VirtualDom$attribute('begin');
var _elm_lang$svg$Svg_Attributes$bbox = _elm_lang$virtual_dom$VirtualDom$attribute('bbox');
var _elm_lang$svg$Svg_Attributes$baseProfile = _elm_lang$virtual_dom$VirtualDom$attribute('baseProfile');
var _elm_lang$svg$Svg_Attributes$baseFrequency = _elm_lang$virtual_dom$VirtualDom$attribute('baseFrequency');
var _elm_lang$svg$Svg_Attributes$azimuth = _elm_lang$virtual_dom$VirtualDom$attribute('azimuth');
var _elm_lang$svg$Svg_Attributes$autoReverse = _elm_lang$virtual_dom$VirtualDom$attribute('autoReverse');
var _elm_lang$svg$Svg_Attributes$attributeType = _elm_lang$virtual_dom$VirtualDom$attribute('attributeType');
var _elm_lang$svg$Svg_Attributes$attributeName = _elm_lang$virtual_dom$VirtualDom$attribute('attributeName');
var _elm_lang$svg$Svg_Attributes$ascent = _elm_lang$virtual_dom$VirtualDom$attribute('ascent');
var _elm_lang$svg$Svg_Attributes$arabicForm = _elm_lang$virtual_dom$VirtualDom$attribute('arabic-form');
var _elm_lang$svg$Svg_Attributes$amplitude = _elm_lang$virtual_dom$VirtualDom$attribute('amplitude');
var _elm_lang$svg$Svg_Attributes$allowReorder = _elm_lang$virtual_dom$VirtualDom$attribute('allowReorder');
var _elm_lang$svg$Svg_Attributes$alphabetic = _elm_lang$virtual_dom$VirtualDom$attribute('alphabetic');
var _elm_lang$svg$Svg_Attributes$additive = _elm_lang$virtual_dom$VirtualDom$attribute('additive');
var _elm_lang$svg$Svg_Attributes$accumulate = _elm_lang$virtual_dom$VirtualDom$attribute('accumulate');
var _elm_lang$svg$Svg_Attributes$accelerate = _elm_lang$virtual_dom$VirtualDom$attribute('accelerate');
var _elm_lang$svg$Svg_Attributes$accentHeight = _elm_lang$virtual_dom$VirtualDom$attribute('accent-height');

var _capitalist$elm_octicons$Octicons_Internal$iconSVG = F5(
	function (viewBox, name, options, attributes, children) {
		var margin = function () {
			var _p0 = options.margin;
			if (_p0.ctor === 'Nothing') {
				return {ctor: '[]'};
			} else {
				return {
					ctor: '::',
					_0: A2(_elm_lang$core$Basics_ops['++'], 'margin: ', _p0._0),
					_1: {ctor: '[]'}
				};
			}
		}();
		var style = function () {
			var _p1 = options.style;
			if (_p1.ctor === 'Nothing') {
				return {ctor: '[]'};
			} else {
				return {
					ctor: '::',
					_0: _p1._0,
					_1: {ctor: '[]'}
				};
			}
		}();
		var styles = function () {
			var _p2 = _elm_lang$core$List$concat(
				{
					ctor: '::',
					_0: style,
					_1: {
						ctor: '::',
						_0: margin,
						_1: {ctor: '[]'}
					}
				});
			if (_p2.ctor === '[]') {
				return {ctor: '[]'};
			} else {
				return {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$style(
						A2(_elm_lang$core$String$join, ';', _p2)),
					_1: {ctor: '[]'}
				};
			}
		}();
		return A2(
			_elm_lang$svg$Svg$svg,
			_elm_lang$core$List$concat(
				{
					ctor: '::',
					_0: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$version('1.1'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$class(
								A2(_elm_lang$core$Basics_ops['++'], 'octicon ', name)),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$width(
									_elm_lang$core$Basics$toString(options.width)),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$height(
										_elm_lang$core$Basics$toString(options.height)),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$viewBox(viewBox),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					},
					_1: {
						ctor: '::',
						_0: attributes,
						_1: {
							ctor: '::',
							_0: styles,
							_1: {ctor: '[]'}
						}
					}
				}),
			children);
	});
var _capitalist$elm_octicons$Octicons_Internal$Options = F6(
	function (a, b, c, d, e, f) {
		return {color: a, width: b, height: c, fillRule: d, margin: e, style: f};
	});

var _capitalist$elm_octicons$Octicons$zapPolygon = '10 7 6 7 9 0 0 9 4 9 1 16';
var _capitalist$elm_octicons$Octicons$xPolygon = '7.48 8 11.23 11.75 9.75 13.23 6 9.48 2.25 13.23 0.77 11.75 4.52 8 0.77 4.25 2.25 2.77 6 6.52 9.75 2.77 11.23 4.25';
var _capitalist$elm_octicons$Octicons$watchPath = 'M6,8 L8,8 L8,9 L5,9 L5,5 L6,5 L6,8 L6,8 Z M12,8 C12,10.22 10.8,12.16 9,13.19 L9,15 C9,15.55 8.55,16 8,16 L4,16 C3.45,16 3,15.55 3,15 L3,13.19 C1.2,12.16 0,10.22 0,8 C0,5.78 1.2,3.84 3,2.81 L3,1 C3,0.45 3.45,0 4,0 L8,0 C8.55,0 9,0.45 9,1 L9,2.81 C10.8,3.84 12,5.78 12,8 L12,8 Z M11,8 C11,5.23 8.77,3 6,3 C3.23,3 1,5.23 1,8 C1,10.77 3.23,13 6,13 C8.77,13 11,10.77 11,8 L11,8 Z';
var _capitalist$elm_octicons$Octicons$versionsPath = 'M13,3 L7,3 C6.45,3 6,3.45 6,4 L6,12 C6,12.55 6.45,13 7,13 L13,13 C13.55,13 14,12.55 14,12 L14,4 C14,3.45 13.55,3 13,3 L13,3 Z M12,11 L8,11 L8,5 L12,5 L12,11 L12,11 Z M4,4 L5,4 L5,5 L4,5 L4,11 L5,11 L5,12 L4,12 C3.45,12 3,11.55 3,11 L3,5 C3,4.45 3.45,4 4,4 L4,4 Z M1,5 L2,5 L2,6 L1,6 L1,10 L2,10 L2,11 L1,11 C0.45,11 0,10.55 0,10 L0,6 C0,5.45 0.45,5 1,5 L1,5 Z';
var _capitalist$elm_octicons$Octicons$verifiedPath = 'M15.67,7.06 L14.59,5.72 C14.42,5.5 14.31,5.24 14.28,4.95 L14.09,3.25 C14.01,2.55 13.46,2 12.76,1.92 L11.06,1.73 C10.76,1.7 10.5,1.57 10.28,1.4 L8.94,0.32 C8.39,-0.12 7.61,-0.12 7.06,0.32 L5.72,1.4 C5.5,1.57 5.24,1.68 4.95,1.71 L3.25,1.9 C2.55,1.98 2,2.53 1.92,3.23 L1.73,4.93 C1.7,5.23 1.57,5.49 1.4,5.71 L0.32,7.05 C-0.12,7.6 -0.12,8.38 0.32,8.93 L1.4,10.27 C1.57,10.49 1.68,10.75 1.71,11.04 L1.9,12.74 C1.98,13.44 2.53,13.99 3.23,14.07 L4.93,14.26 C5.23,14.29 5.49,14.42 5.71,14.59 L7.05,15.67 C7.6,16.11 8.38,16.11 8.93,15.67 L10.27,14.59 C10.49,14.42 10.75,14.31 11.04,14.28 L12.74,14.09 C13.44,14.01 13.99,13.46 14.07,12.76 L14.26,11.06 C14.29,10.76 14.42,10.5 14.59,10.28 L15.67,8.94 C16.11,8.39 16.11,7.61 15.67,7.06 L15.67,7.06 Z M6.5,12 L3,8.5 L4.5,7 L6.5,9 L11.5,4 L13,5.55 L6.5,12 L6.5,12 Z';
var _capitalist$elm_octicons$Octicons$unverifiedPath = 'M15.67,7.06 L14.59,5.72 C14.42,5.5 14.31,5.24 14.28,4.95 L14.09,3.25 C14.01,2.55 13.46,2 12.76,1.92 L11.06,1.73 C10.76,1.7 10.5,1.57 10.28,1.4 L8.94,0.32 C8.39,-0.12 7.61,-0.12 7.06,0.32 L5.72,1.4 C5.5,1.57 5.24,1.68 4.95,1.71 L3.25,1.9 C2.55,1.98 2,2.53 1.92,3.23 L1.73,4.93 C1.7,5.23 1.57,5.49 1.4,5.71 L0.32,7.05 C-0.12,7.6 -0.12,8.38 0.32,8.93 L1.4,10.27 C1.57,10.49 1.68,10.75 1.71,11.04 L1.9,12.74 C1.98,13.44 2.53,13.99 3.23,14.07 L4.93,14.26 C5.23,14.29 5.49,14.42 5.71,14.59 L7.05,15.67 C7.6,16.11 8.38,16.11 8.93,15.67 L10.27,14.59 C10.49,14.42 10.75,14.31 11.04,14.28 L12.74,14.09 C13.44,14.01 13.99,13.46 14.07,12.76 L14.26,11.06 C14.29,10.76 14.42,10.5 14.59,10.28 L15.67,8.94 C16.11,8.39 16.11,7.61 15.67,7.06 L15.67,7.06 Z M9,11.5 C9,11.78 8.78,12 8.5,12 L7.5,12 C7.23,12 7,11.78 7,11.5 L7,10.5 C7,10.22 7.23,10 7.5,10 L8.5,10 C8.78,10 9,10.22 9,10.5 L9,11.5 L9,11.5 Z M10.56,6.61 C10.5,6.78 10.39,6.94 10.26,7.08 C10.13,7.24 10.12,7.27 9.93,7.46 C9.77,7.63 9.62,7.76 9.41,7.91 C9.3,8 9.21,8.1 9.13,8.18 C9.05,8.26 8.99,8.35 8.94,8.45 C8.89,8.55 8.86,8.64 8.83,8.75 C8.8,8.86 8.8,8.88 8.8,9 L7.13,9 C7.13,8.78 7.13,8.69 7.16,8.52 C7.19,8.33 7.24,8.16 7.3,8 C7.36,7.86 7.44,7.72 7.55,7.58 C7.66,7.45 7.78,7.33 7.96,7.2 C8.23,7.01 8.32,6.9 8.44,6.68 C8.56,6.46 8.64,6.3 8.64,6.09 C8.64,5.82 8.58,5.64 8.44,5.51 C8.31,5.38 8.13,5.32 7.86,5.32 C7.77,5.32 7.67,5.34 7.56,5.37 C7.45,5.4 7.39,5.46 7.31,5.53 C7.23,5.6 7.17,5.64 7.11,5.73 C7.05,5.82 7.02,5.87 7.02,6.01 L5.02,6.01 C5.02,5.63 5.15,5.45 5.29,5.18 C5.45,4.91 5.65,4.68 5.9,4.51 C6.15,4.34 6.45,4.21 6.78,4.13 C7.11,4.05 7.48,4 7.87,4 C8.31,4 8.7,4.05 9.04,4.13 C9.38,4.22 9.67,4.35 9.92,4.52 C10.15,4.69 10.33,4.9 10.47,5.15 C10.6,5.4 10.66,5.7 10.66,6.03 C10.66,6.25 10.66,6.45 10.58,6.62 L10.56,6.61 Z';
var _capitalist$elm_octicons$Octicons$unmutePath = 'M12,8.02 C12,9.11 11.55,10.11 10.83,10.85 L10.16,10.18 C10.71,9.62 11.05,8.87 11.05,8.02 C11.05,7.17 10.71,6.41 10.16,5.86 L10.83,5.19 C11.55,5.91 12,6.91 12,8.02 L12,8.02 Z M7.72,2.28 L4,6 L2,6 C1.45,6 1,6.45 1,7 L1,9 C1,9.55 1.45,10 2,10 L4,10 L7.72,13.72 C8.19,14.19 9,13.86 9,13.19 L9,2.81 C9,2.14 8.19,1.81 7.72,2.28 L7.72,2.28 Z M13.66,2.36 L12.99,3.03 C14.27,4.31 15.05,6.06 15.05,8.01 C15.05,9.95 14.27,11.71 12.99,12.99 L13.66,13.66 C15.11,12.21 16,10.21 16,8 C16,5.78 15.11,3.78 13.66,2.34 L13.66,2.36 Z M12.25,3.77 L11.56,4.44 C12.48,5.36 13.04,6.63 13.04,8.02 C13.04,9.41 12.48,10.68 11.56,11.58 L12.25,12.25 C13.33,11.17 14,9.67 14,8.02 C14,6.37 13.33,4.86 12.25,3.77 L12.25,3.77 Z';
var _capitalist$elm_octicons$Octicons$unfoldPath = 'M11.5,7.5 L14,10 C14,10.55 13.55,11 13,11 L9,11 L9,10 L12.5,10 L10.5,8 L3.5,8 L1.5,10 L5,10 L5,11 L1,11 C0.45,11 0,10.55 0,10 L2.5,7.5 L0,5 C0,4.45 0.45,4 1,4 L5,4 L5,5 L1.5,5 L3.5,7 L10.5,7 L12.5,5 L9,5 L9,4 L13,4 C13.55,4 14,4.45 14,5 L11.5,7.5 L11.5,7.5 Z M6,6 L8,6 L8,3 L10,3 L7,0 L4,3 L6,3 L6,6 L6,6 Z M8,9 L6,9 L6,12 L4,12 L7,15 L10,12 L8,12 L8,9 L8,9 Z';
var _capitalist$elm_octicons$Octicons$triangleUpPolygon = '12 11 6 5 0 11';
var _capitalist$elm_octicons$Octicons$triangleRightPolygon = '0 14 6 8 0 2';
var _capitalist$elm_octicons$Octicons$triangleLeftPolygon = '6 2 0 8 6 14';
var _capitalist$elm_octicons$Octicons$triangleDownPolygon = '0 5 6 11 12 5';
var _capitalist$elm_octicons$Octicons$trashcanPath = 'M11,2 L9,2 C9,1.45 8.55,1 8,1 L5,1 C4.45,1 4,1.45 4,2 L2,2 C1.45,2 1,2.45 1,3 L1,4 C1,4.55 1.45,5 2,5 L2,14 C2,14.55 2.45,15 3,15 L10,15 C10.55,15 11,14.55 11,14 L11,5 C11.55,5 12,4.55 12,4 L12,3 C12,2.45 11.55,2 11,2 L11,2 Z M10,14 L3,14 L3,5 L4,5 L4,13 L5,13 L5,5 L6,5 L6,13 L7,13 L7,5 L8,5 L8,13 L9,13 L9,5 L10,5 L10,14 L10,14 Z M11,4 L2,4 L2,3 L11,3 L11,4 L11,4 Z';
var _capitalist$elm_octicons$Octicons$toolsPath = 'M4.48,7.27 C4.74,7.53 5.76,8.6 5.76,8.6 L6.32,8.02 L5.44,7.11 L7.13,5.31 C7.13,5.31 6.37,4.57 6.7,4.86 C7.02,3.67 6.73,2.35 5.83,1.42 C4.93,0.5 3.66,0.2 2.52,0.51 L4.45,2.51 L3.94,4.47 L2.05,4.99 L0.12,2.99 C-0.19,4.17 0.1,5.48 1,6.4 C1.94,7.38 3.29,7.66 4.48,7.27 L4.48,7.27 Z M10.92,9.21 L8.59,11.51 L12.43,15.49 C12.74,15.82 13.16,15.98 13.57,15.98 C13.98,15.98 14.39,15.82 14.71,15.49 C15.34,14.84 15.34,13.79 14.71,13.14 L10.92,9.21 L10.92,9.21 Z M16,2.53 L13.55,0 L6.33,7.46 L7.21,8.37 L2.9,12.83 L1.91,13.36 L0.52,15.63 L0.87,16 L3.07,14.56 L3.58,13.54 L7.9,9.08 L8.78,9.99 L16,2.53 L16,2.53 Z';
var _capitalist$elm_octicons$Octicons$thumbsupPath = 'M14,14 C13.95,14.69 12.73,15 12,15 L5.67,15 L4,14 L4,8 C5.36,8 6.11,7.25 7.13,6.12 C8.36,4.76 8.27,3.56 8.01,1.99 C7.93,1.49 8.51,0.99 9.01,0.99 C9.84,0.99 11.01,3.72 11.01,4.99 L10.99,6.02 C10.99,6.71 11.32,6.99 12.01,6.99 L14.01,6.99 C14.64,6.99 14.99,7.35 15.01,7.99 L14.01,13.99 L14,14 Z M14,6 L12,6 L11.98,6 L12,5.02 C12,3.72 10.83,0 9,0 C8.42,0 7.83,0.3 7.44,0.77 C7.08,1.18 6.94,1.68 7.02,2.18 C7.27,3.66 7.3,4.46 6.39,5.46 C5.39,6.55 4.91,7.01 4,7.01 L2,7.01 C0.94,7 0,7.94 0,9 L0,13 C0,14.06 0.94,15 2,15 L3.72,15 L5.16,15.86 C5.32,15.95 5.49,16 5.68,16 L12.01,16 C13.14,16 14.85,15.5 15.01,14.12 L15.99,8.17 C16.01,8.09 16.01,8.03 16.01,7.97 C15.98,6.8 15.17,6 14.01,6 L14,6 Z';
var _capitalist$elm_octicons$Octicons$thumbsdownPath = 'M15.98,7.83 L15.01,1.88 C14.84,0.5 13.13,0 12,0 L5.69,0 C5.49,0 5.31,0.05 5.16,0.14 L3.72,1 L2,1 C0.94,1 0,1.94 0,3 L0,7 C0,8.06 0.94,9.02 2,9 L4,9 C4.91,9 5.39,9.45 6.39,10.55 C7.3,11.55 7.27,12.35 7.02,13.82 C6.94,14.32 7.08,14.82 7.44,15.24 C7.83,15.71 8.42,16.01 9,16.01 C10.83,16.01 12,12.29 12,10.99 L11.98,10.01 L12,10.01 L14.02,10.01 C15.18,10.01 15.97,9.21 16,8.04 C16,7.98 16.02,7.91 15.98,7.84 L15.98,7.83 Z M14.01,9.02 L12.02,9.02 C11.32,9.02 10.99,9.3 10.99,9.99 L11.02,11.02 C11.02,12.29 9.85,15.02 9.02,15.02 C8.52,15.02 7.94,14.52 8.02,14.02 C8.27,12.44 8.36,11.24 7.13,9.88 C6.11,8.75 5.36,8 4,8 L4,2 L5.67,1 L12,1 C12.73,1 13.95,1.31 14,2 L14.02,2.02 L15.02,8.02 C14.99,8.66 14.64,9.02 14.02,9.02 L14.01,9.02 Z';
var _capitalist$elm_octicons$Octicons$threeBarsPath = 'M11.41,9 L0.59,9 C0,9 0,8.59 0,8 C0,7.41 0,7 0.59,7 L11.4,7 C11.99,7 11.99,7.41 11.99,8 C11.99,8.59 11.99,9 11.4,9 L11.41,9 Z M11.41,5 L0.59,5 C0,5 0,4.59 0,4 C0,3.41 0,3 0.59,3 L11.4,3 C11.99,3 11.99,3.41 11.99,4 C11.99,4.59 11.99,5 11.4,5 L11.41,5 Z M0.59,11 L11.4,11 C11.99,11 11.99,11.41 11.99,12 C11.99,12.59 11.99,13 11.4,13 L0.59,13 C0,13 0,12.59 0,12 C0,11.41 0,11 0.59,11 L0.59,11 Z';
var _capitalist$elm_octicons$Octicons$textSizePath = 'M13.62,9.08 L12.1,3.66 L12.04,3.66 L10.54,9.08 L13.62,9.08 Z M5.7,10.13 C5.7,10.13 4.68,6.52 4.53,6.02 L4.45,6.02 L3.32,10.13 L5.7,10.13 Z M17.31,14 L15.06,14 L14.11,10.75 L10.04,10.75 L9.09,14 L6.84,14 L6.15,11.67 L2.87,11.67 L2.17,14 L0,14 L3.3,4.41 L5.8,4.41 L7.97,10.75 L10.86,2 L13.38,2 L17.32,14 L17.31,14 Z';
var _capitalist$elm_octicons$Octicons$terminalPath = 'M7,10 L11,10 L11,11 L7,11 L7,10 L7,10 Z M4,11 L7,8 L4,5 L3.25,5.75 L5.5,8 L3.25,10.25 L4,11 L4,11 Z M14,3 L14,13 C14,13.55 13.55,14 13,14 L1,14 C0.45,14 0,13.55 0,13 L0,3 C0,2.45 0.45,2 1,2 L13,2 C13.55,2 14,2.45 14,3 L14,3 Z M13,3 L1,3 L1,13 L13,13 L13,3 L13,3 Z';
var _capitalist$elm_octicons$Octicons$telescopePath = 'M8,9 L11,15 L10,15 L8,11 L8,16 L7,16 L7,10 L5,15 L4,15 L6,10 L8,9 L8,9 Z M7,0 L6,0 L6,1 L7,1 L7,0 L7,0 Z M5,3 L4,3 L4,4 L5,4 L5,3 L5,3 Z M2,1 L1,1 L1,2 L2,2 L2,1 L2,1 Z M0.63,9 C0.41,9.16 0.35,9.44 0.47,9.67 L1.02,10.59 C1.15,10.82 1.43,10.9 1.66,10.79 L3.05,10.13 L1.89,8.13 L0.62,8.99 L0.63,9 Z M8.52,3.61 L2.72,7.56 L3.95,9.7 L10.28,6.67 L8.51,3.61 L8.52,3.61 Z M12.74,4.89 L11.27,2.37 C11.13,2.12 10.8,2.04 10.55,2.2 L9.35,3.03 L11.19,6.23 L12.52,5.59 C12.79,5.46 12.88,5.15 12.74,4.89 L12.74,4.89 Z';
var _capitalist$elm_octicons$Octicons$tasklistPath = 'M15.41,9 L7.59,9 C7,9 7,8.59 7,8 C7,7.41 7,7 7.59,7 L15.4,7 C15.99,7 15.99,7.41 15.99,8 C15.99,8.59 15.99,9 15.4,9 L15.41,9 Z M9.59,4 C9,4 9,3.59 9,3 C9,2.41 9,2 9.59,2 L15.4,2 C15.99,2 15.99,2.41 15.99,3 C15.99,3.59 15.99,4 15.4,4 L9.59,4 L9.59,4 Z M0,3.91 L1.41,2.61 L3,4.2 L7.09,0 L8.5,1.41 L3,6.91 L0,3.91 L0,3.91 Z M7.59,12 L15.4,12 C15.99,12 15.99,12.41 15.99,13 C15.99,13.59 15.99,14 15.4,14 L7.59,14 C7,14 7,13.59 7,13 C7,12.41 7,12 7.59,12 L7.59,12 Z';
var _capitalist$elm_octicons$Octicons$tagPath = 'M7.73,1.73 C7.26,1.26 6.62,1 5.96,1 L3.5,1 C2.13,1 1,2.13 1,3.5 L1,5.97 C1,6.63 1.27,7.27 1.73,7.74 L7.79,13.8 C8.18,14.19 8.81,14.19 9.2,13.8 L13.79,9.21 C14.18,8.82 14.18,8.19 13.79,7.8 L7.73,1.73 L7.73,1.73 Z M2.38,7.09 C2.07,6.79 1.91,6.39 1.91,5.96 L1.91,3.5 C1.91,2.62 2.63,1.91 3.5,1.91 L5.97,1.91 C6.39,1.91 6.8,2.07 7.1,2.38 L13.24,8.51 L8.51,13.24 L2.38,7.09 L2.38,7.09 Z M3.01,3 L5.01,3 L5.01,5 L3,5 L3,3 L3.01,3 Z';
var _capitalist$elm_octicons$Octicons$syncPath = 'M10.24,7.4 C10.43,8.68 10.04,10.02 9.04,11 C7.57,12.45 5.3,12.63 3.63,11.54 L4.8,10.4 L0.5,9.8 L1.1,14 L2.41,12.74 C4.77,14.48 8.11,14.31 10.25,12.2 C11.49,10.97 12.06,9.35 11.99,7.74 L10.24,7.4 L10.24,7.4 Z M2.96,5 C4.43,3.55 6.7,3.37 8.37,4.46 L7.2,5.6 L11.5,6.2 L10.9,2 L9.59,3.26 C7.23,1.52 3.89,1.69 1.74,3.8 C0.5,5.03 -0.06,6.65 0.01,8.26 L1.76,8.61 C1.57,7.33 1.96,5.98 2.96,5 L2.96,5 Z';
var _capitalist$elm_octicons$Octicons$stopPath = 'M10,1 L4,1 L0,5 L0,11 L4,15 L10,15 L14,11 L14,5 L10,1 L10,1 Z M13,10.5 L9.5,14 L4.5,14 L1,10.5 L1,5.5 L4.5,2 L9.5,2 L13,5.5 L13,10.5 L13,10.5 Z M6,4 L8,4 L8,9 L6,9 L6,4 L6,4 Z M6,10 L8,10 L8,12 L6,12 L6,10 L6,10 Z';
var _capitalist$elm_octicons$Octicons$starPolygon = '14 6 9.1 5.36 7 1 4.9 5.36 0 6 3.6 9.26 2.67 14 7 11.67 11.33 14 10.4 9.26';
var _capitalist$elm_octicons$Octicons$squirrelPath = 'M12,1 C9.79,1 8,2.31 8,3.92 C8,5.86 8.5,6.95 8,10 C8,5.5 5.23,3.66 4,3.66 C4.05,3.16 3.52,3 3.52,3 C3.52,3 3.3,3.11 3.22,3.34 C2.95,3.03 2.66,3.07 2.66,3.07 L2.53,3.65 C2.53,3.65 0.7,4.29 0.68,6.87 C0.88,7.2 2.21,7.47 3.15,7.3 C4.04,7.35 3.82,8.09 3.62,8.29 C2.78,9.13 2,8 1,8 C0,8 0,9 1,9 C2,9 2,10 4,10 C0.91,11.2 4,14 4,14 L3,14 C2,14 2,15 2,15 L8,15 C11,15 13,14 13,11.53 C13,10.68 12.57,9.74 12,9 C10.89,7.54 12.23,6.32 13,7 C13.77,7.68 16,8 16,5 C16,2.79 14.21,1 12,1 L12,1 Z M2.5,6 C2.22,6 2,5.78 2,5.5 C2,5.22 2.22,5 2.5,5 C2.78,5 3,5.22 3,5.5 C3,5.78 2.78,6 2.5,6 L2.5,6 Z';
var _capitalist$elm_octicons$Octicons$smileyPath = 'M8,0 C3.58,0 0,3.58 0,8 C0,12.42 3.58,16 8,16 C12.42,16 16,12.42 16,8 C16,3.58 12.42,0 8,0 L8,0 Z M12.81,12.81 C12.18,13.44 11.45,13.92 10.64,14.26 C9.81,14.62 8.92,14.79 8,14.79 C7.08,14.79 6.19,14.62 5.36,14.26 C4.55,13.92 3.81,13.43 3.19,12.81 C2.57,12.19 2.08,11.45 1.74,10.64 C1.38,9.81 1.21,8.92 1.21,8 C1.21,7.08 1.38,6.19 1.74,5.36 C2.08,4.55 2.57,3.81 3.19,3.19 C3.81,2.57 4.55,2.08 5.36,1.74 C6.19,1.38 7.08,1.21 8,1.21 C8.92,1.21 9.81,1.38 10.64,1.74 C11.45,2.08 12.19,2.57 12.81,3.19 C13.43,3.81 13.92,4.55 14.26,5.36 C14.62,6.19 14.79,7.08 14.79,8 C14.79,8.92 14.62,9.81 14.26,10.64 C13.92,11.45 13.43,12.19 12.81,12.81 L12.81,12.81 Z M4,6.8 L4,6.21 C4,5.55 4.53,5.02 5.2,5.02 L5.79,5.02 C6.45,5.02 6.98,5.55 6.98,6.21 L6.98,6.8 C6.98,7.47 6.45,8 5.79,8 L5.2,8 C4.53,8 4,7.47 4,6.8 L4,6.8 Z M9,6.8 L9,6.21 C9,5.55 9.53,5.02 10.2,5.02 L10.79,5.02 C11.45,5.02 11.98,5.55 11.98,6.21 L11.98,6.8 C11.98,7.47 11.45,8 10.79,8 L10.2,8 C9.53,8 9,7.47 9,6.8 L9,6.8 Z M13,10 C12.28,11.88 10.09,13 8,13 C5.91,13 3.72,11.87 3,10 C2.86,9.61 3.23,9 3.66,9 L12.25,9 C12.66,9 13.14,9.61 13,10 L13,10 Z';
var _capitalist$elm_octicons$Octicons$signOutPath = 'M12,9 L12,7 L8,7 L8,5 L12,5 L12,3 L16,6 L12,9 L12,9 Z M10,12 L6,12 L6,3 L2,1 L10,1 L10,4 L11,4 L11,1 C11,0.45 10.55,0 10,0 L1,0 C0.45,0 0,0.45 0,1 L0,12.38 C0,12.77 0.22,13.11 0.55,13.29 L6,16.01 L6,13 L10,13 C10.55,13 11,12.55 11,12 L11,8 L10,8 L10,12 L10,12 Z';
var _capitalist$elm_octicons$Octicons$signInPath = 'M7,6.75 L7,12 L11,12 L11,8 L12,8 L12,12 C12,12.55 11.55,13 11,13 L7,13 L7,16 L1.55,13.28 C1.22,13.11 1,12.76 1,12.37 L1,1 C1,0.45 1.45,0 2,0 L11,0 C11.55,0 12,0.45 12,1 L12,4 L11,4 L11,1 L3,1 L7,3 L7,5.25 L10,3 L10,5 L14,5 L14,7 L10,7 L10,9 L7,6.75 L7,6.75 Z';
var _capitalist$elm_octicons$Octicons$shieldPath = 'M7,0 L0,2 L0,8.02 C0,12.69 5.31,16 7,16 C8.69,16 14,12.69 14,8.02 L14,2 L7,0 L7,0 Z M5,11 L6.14,8.2 C6.19,7.97 6.08,7.73 5.89,7.61 C5.33,7.25 5,6.66 5,6 C5,4.91 5.89,4 6.98,4 C8.06,4 9,4.91 9,6 C9,6.66 8.67,7.25 8.11,7.61 C7.92,7.74 7.81,7.97 7.86,8.2 L9,11 L5,11 L5,11 Z';
var _capitalist$elm_octicons$Octicons$settingsPath = 'M4,7 L3,7 L3,2 L4,2 L4,7 L4,7 Z M3,14 L4,14 L4,11 L3,11 L3,14 L3,14 Z M8,14 L9,14 L9,8 L8,8 L8,14 L8,14 Z M13,14 L14,14 L14,12 L13,12 L13,14 L13,14 Z M14,2 L13,2 L13,8 L14,8 L14,2 L14,2 Z M9,2 L8,2 L8,4 L9,4 L9,2 L9,2 Z M5,8 L2,8 C1.45,8 1,8.45 1,9 C1,9.55 1.45,10 2,10 L5,10 C5.55,10 6,9.55 6,9 C6,8.45 5.55,8 5,8 L5,8 Z M10,5 L7,5 C6.45,5 6,5.45 6,6 C6,6.55 6.45,7 7,7 L10,7 C10.55,7 11,6.55 11,6 C11,5.45 10.55,5 10,5 L10,5 Z M15,9 L12,9 C11.45,9 11,9.45 11,10 C11,10.55 11.45,11 12,11 L15,11 C15.55,11 16,10.55 16,10 C16,9.45 15.55,9 15,9 L15,9 Z';
var _capitalist$elm_octicons$Octicons$serverPath = 'M11,6 L1,6 C0.45,6 0,6.45 0,7 L0,9 C0,9.55 0.45,10 1,10 L11,10 C11.55,10 12,9.55 12,9 L12,7 C12,6.45 11.55,6 11,6 L11,6 Z M2,9 L1,9 L1,7 L2,7 L2,9 L2,9 Z M4,9 L3,9 L3,7 L4,7 L4,9 L4,9 Z M6,9 L5,9 L5,7 L6,7 L6,9 L6,9 Z M8,9 L7,9 L7,7 L8,7 L8,9 L8,9 Z M11,1 L1,1 C0.45,1 0,1.45 0,2 L0,4 C0,4.55 0.45,5 1,5 L11,5 C11.55,5 12,4.55 12,4 L12,2 C12,1.45 11.55,1 11,1 L11,1 Z M2,4 L1,4 L1,2 L2,2 L2,4 L2,4 Z M4,4 L3,4 L3,2 L4,2 L4,4 L4,4 Z M6,4 L5,4 L5,2 L6,2 L6,4 L6,4 Z M8,4 L7,4 L7,2 L8,2 L8,4 L8,4 Z M11,3 L10,3 L10,2 L11,2 L11,3 L11,3 Z M11,11 L1,11 C0.45,11 0,11.45 0,12 L0,14 C0,14.55 0.45,15 1,15 L11,15 C11.55,15 12,14.55 12,14 L12,12 C12,11.45 11.55,11 11,11 L11,11 Z M2,14 L1,14 L1,12 L2,12 L2,14 L2,14 Z M4,14 L3,14 L3,12 L4,12 L4,14 L4,14 Z M6,14 L5,14 L5,12 L6,12 L6,14 L6,14 Z M8,14 L7,14 L7,12 L8,12 L8,14 L8,14 Z';
var _capitalist$elm_octicons$Octicons$searchPath = 'M15.7,13.3 L11.89,9.47 C12.59,8.49 13,7.3 13,6 C13,2.69 10.31,0 7,0 C3.69,0 1,2.69 1,6 C1,9.31 3.69,12 7,12 C8.3,12 9.48,11.59 10.47,10.89 L14.3,14.7 C14.49,14.9 14.75,15 15,15 C15.25,15 15.52,14.91 15.7,14.7 C16.09,14.31 16.09,13.68 15.7,13.29 L15.7,13.3 Z M7,10.7 C4.41,10.7 2.3,8.59 2.3,6 C2.3,3.41 4.41,1.3 7,1.3 C9.59,1.3 11.7,3.41 11.7,6 C11.7,8.59 9.59,10.7 7,10.7 L7,10.7 Z';
var _capitalist$elm_octicons$Octicons$screenNormalPath = 'M2,4 L0,4 L0,3 L2,3 L2,1 L3,1 L3,3 C3,3.546875 2.546875,4 2,4 L2,4 L2,4 Z M2,12 L0,12 L0,13 L2,13 L2,15 L3,15 L3,13 C3,12.453125 2.546875,12 2,12 L2,12 L2,12 Z M11,10 C11,10.546875 10.546875,11 10,11 L4,11 C3.453125,11 3,10.546875 3,10 L3,6 C3,5.453125 3.453125,5 4,5 L10,5 C10.546875,5 11,5.453125 11,6 L11,10 L11,10 L11,10 Z M9,7 L5,7 L5,9 L9,9 L9,7 L9,7 L9,7 Z M11,13 L11,15 L12,15 L12,13 L14,13 L14,12 L12,12 C11.453125,12 11,12.453125 11,13 L11,13 L11,13 Z M12,3 L12,1 L11,1 L11,3 C11,3.546875 11.453125,4 12,4 L14,4 L14,3 L12,3 L12,3 L12,3 Z';
var _capitalist$elm_octicons$Octicons$screenFullPath = 'M13,10 L14,10 L14,13 C14,13.546875 13.546875,14 13,14 L10,14 L10,13 L13,13 L13,10 L13,10 L13,10 Z M1,10 L0,10 L0,13 C0,13.546875 0.453125,14 1,14 L4,14 L4,13 L1,13 L1,10 L1,10 L1,10 Z M1,3 L4,3 L4,2 L1,2 C0.453125,2 0,2.453125 0,3 L0,6 L1,6 L1,3 L1,3 L1,3 Z M2,4 L12,4 L12,12 L2,12 L2,4 L2,4 L2,4 Z M4,10 L10,10 L10,6 L4,6 L4,10 L4,10 L4,10 Z M10,2 L10,3 L13,3 L13,6 L14,6 L14,3 C14,2.453125 13.546875,2 13,2 L10,2 L10,2 Z';
var _capitalist$elm_octicons$Octicons$rubyPath = 'M13,6 L8,11 L8,4 L11,4 L13,6 L13,6 Z M16,6 L8,14 L0,6 L4,2 L12,2 L16,6 L16,6 Z M8,12.5 L14.5,6 L11.5,3 L4.5,3 L1.5,6 L8,12.5 L8,12.5 Z';
var _capitalist$elm_octicons$Octicons$rssPath = 'M2,13 L0,13 L0,11 C1.11,11 2,11.89 2,13 L2,13 Z M0,3 L0,4 C4.97,4 9,8.03 9,13 L10,13 C10,7.48 5.52,3 0,3 L0,3 Z M0,7 L0,8 C2.75,8 5,10.25 5,13 L6,13 C6,9.69 3.31,7 0,7 L0,7 Z';
var _capitalist$elm_octicons$Octicons$rocketPath = 'M12.17,3.83 C11.9,3.56 11.7,3.28 11.54,2.95 C11.38,2.64 11.27,2.29 11.2,1.93 C10.62,2.26 10.04,2.63 9.47,3.06 C8.89,3.5 8.33,4 7.78,4.54 C7.08,5.24 6.45,6.35 6,6.99 L3,6.99 L0,10 L3,10 L5,8 C4.66,8.77 3.98,10.98 4,11 L5,12 C5.02,12.02 7.23,11.36 8,11 L6,13 L6,16 L9,13 L9,10 C9.64,9.55 10.75,8.91 11.45,8.22 C12,7.67 12.5,7.09 12.92,6.52 C13.36,5.94 13.73,5.36 14.06,4.8 C13.7,4.72 13.36,4.61 13.03,4.46 C12.72,4.3 12.44,4.1 12.17,3.83 M16,0 C16,0 15.91,0.38 15.7,1.06 C15.5,1.76 15.15,2.64 14.64,3.72 C13.94,3.64 13.37,3.39 12.98,3 C12.59,2.61 12.35,2.06 12.28,1.36 C13.36,0.84 14.23,0.48 14.92,0.28 C15.62,0.08 16,0 16,0';
var _capitalist$elm_octicons$Octicons$repoPath = 'M4,9 L3,9 L3,8 L4,8 L4,9 L4,9 Z M4,6 L3,6 L3,7 L4,7 L4,6 L4,6 Z M4,4 L3,4 L3,5 L4,5 L4,4 L4,4 Z M4,2 L3,2 L3,3 L4,3 L4,2 L4,2 Z M12,1 L12,13 C12,13.55 11.55,14 11,14 L6,14 L6,16 L4.5,14.5 L3,16 L3,14 L1,14 C0.45,14 0,13.55 0,13 L0,1 C0,0.45 0.45,0 1,0 L11,0 C11.55,0 12,0.45 12,1 L12,1 Z M11,11 L1,11 L1,13 L3,13 L3,12 L6,12 L6,13 L11,13 L11,11 L11,11 Z M11,1 L2,1 L2,10 L11,10 L11,1 L11,1 Z';
var _capitalist$elm_octicons$Octicons$repoPushPath = 'M4,3 L3,3 L3,2 L4,2 L4,3 L4,3 Z M3,5 L4,5 L4,4 L3,4 L3,5 L3,5 Z M7,5 L4,9 L6,9 L6,16 L8,16 L8,9 L10,9 L7,5 L7,5 Z M11,0 L1,0 C0.45,0 0,0.45 0,1 L0,13 C0,13.55 0.45,14 1,14 L5,14 L5,13 L1,13 L1,11 L5,11 L5,10 L2,10 L2,1 L11.02,1 L11,10 L9,10 L9,11 L11,11 L11,13 L9,13 L9,14 L11,14 C11.55,14 12,13.55 12,13 L12,1 C12,0.45 11.55,0 11,0 L11,0 Z';
var _capitalist$elm_octicons$Octicons$repoPullPath = 'M13,8 L13,6 L7,6 L7,4 L13,4 L13,2 L16,5 L13,8 L13,8 Z M4,2 L3,2 L3,3 L4,3 L4,2 L4,2 Z M11,7 L12,7 L12,13 C12,13.55 11.55,14 11,14 L6,14 L6,16 L4.5,14.5 L3,16 L3,14 L1,14 C0.45,14 0,13.55 0,13 L0,1 C0,0.45 0.45,0 1,0 L11,0 C11.55,0 12,0.45 12,1 L12,3 L11,3 L11,1 L2,1 L2,10 L11,10 L11,7 L11,7 Z M11,11 L1,11 L1,13 L3,13 L3,12 L6,12 L6,13 L11,13 L11,11 L11,11 Z M4,6 L3,6 L3,7 L4,7 L4,6 L4,6 Z M4,4 L3,4 L3,5 L4,5 L4,4 L4,4 Z M3,9 L4,9 L4,8 L3,8 L3,9 L3,9 Z';
var _capitalist$elm_octicons$Octicons$repoForkedPath = 'M8,1 C6.89,1 6,1.89 6,3 C6,3.73 6.41,4.38 7,4.72 L7,6 L5,8 L3,6 L3,4.72 C3.59,4.38 4,3.74 4,3 C4,1.89 3.11,1 2,1 C0.89,1 0,1.89 0,3 C0,3.73 0.41,4.38 1,4.72 L1,6.5 L4,9.5 L4,11.28 C3.41,11.62 3,12.26 3,13 C3,14.11 3.89,15 5,15 C6.11,15 7,14.11 7,13 C7,12.27 6.59,11.62 6,11.28 L6,9.5 L9,6.5 L9,4.72 C9.59,4.38 10,3.74 10,3 C10,1.89 9.11,1 8,1 L8,1 Z M2,4.2 C1.34,4.2 0.8,3.65 0.8,3 C0.8,2.35 1.35,1.8 2,1.8 C2.65,1.8 3.2,2.35 3.2,3 C3.2,3.65 2.65,4.2 2,4.2 L2,4.2 Z M5,14.2 C4.34,14.2 3.8,13.65 3.8,13 C3.8,12.35 4.35,11.8 5,11.8 C5.65,11.8 6.2,12.35 6.2,13 C6.2,13.65 5.65,14.2 5,14.2 L5,14.2 Z M8,4.2 C7.34,4.2 6.8,3.65 6.8,3 C6.8,2.35 7.35,1.8 8,1.8 C8.65,1.8 9.2,2.35 9.2,3 C9.2,3.65 8.65,4.2 8,4.2 L8,4.2 Z';
var _capitalist$elm_octicons$Octicons$repoForcePushPath = 'M10,9 L8,9 L8,16 L6,16 L6,9 L4,9 L6.25,6 L4,6 L7,2 L10,6 L7.75,6 L10,9 L10,9 Z M11,0 L1,0 C0.45,0 0,0.45 0,1 L0,13 C0,13.55 0.45,14 1,14 L5,14 L5,13 L1,13 L1,11 L5,11 L5,10 L2,10 L2,1 L11,1 L11,10 L9,10 L9,11 L11,11 L11,13 L9,13 L9,14 L11,14 C11.55,14 12,13.55 12,13 L12,1 C12,0.45 11.55,0 11,0 L11,0 Z';
var _capitalist$elm_octicons$Octicons$repoClonePath = 'M15,0 L9,0 L9,7 C9,7.55 9.45,8 10,8 L11,8 L11,9 L12,9 L12,8 L15,8 C15.55,8 16,7.55 16,7 L16,1 C16,0.45 15.55,0 15,0 L15,0 Z M11,7 L10,7 L10,6 L11,6 L11,7 L11,7 Z M15,7 L12,7 L12,6 L15,6 L15,7 L15,7 Z M15,5 L11,5 L11,1 L15,1 L15,5 L15,5 Z M4,5 L3,5 L3,4 L4,4 L4,5 L4,5 Z M4,3 L3,3 L3,2 L4,2 L4,3 L4,3 Z M2,1 L8,1 L8,0 L1,0 C0.45,0 0,0.45 0,1 L0,13 C0,13.55 0.45,14 1,14 L3,14 L3,16 L4.5,14.5 L6,16 L6,14 L11,14 C11.55,14 12,13.55 12,13 L12,10 L2,10 L2,1 L2,1 Z M11,11 L11,13 L6,13 L6,12 L3,12 L3,13 L1,13 L1,11 L11,11 L11,11 Z M3,8 L4,8 L4,9 L3,9 L3,8 L3,8 Z M4,7 L3,7 L3,6 L4,6 L4,7 L4,7 Z';
var _capitalist$elm_octicons$Octicons$replyPath = 'M6,3.5 C9.92,3.94 14,6.625 14,13.5 C11.688,8.438 9.25,7.5 6,7.5 L6,11 L0.5,5.5 L6,0 L6,3.5 Z';
var _capitalist$elm_octicons$Octicons$radioTowerPath = 'M4.79,6.11 C5.04,5.86 5.04,5.44 4.79,5.19 C4.47,4.86 4.31,4.43 4.31,4 C4.31,3.57 4.47,3.14 4.79,2.81 C5.04,2.55 5.04,2.14 4.79,1.89 C4.67,1.76 4.5,1.7 4.34,1.7 C4.18,1.7 4.01,1.76 3.89,1.89 C3.32,2.47 3.04,3.24 3.04,4 C3.04,4.76 3.33,5.53 3.89,6.11 C4.14,6.36 4.55,6.36 4.79,6.11 L4.79,6.11 Z M2.33,0.52 C2.2,0.39 2.04,0.33 1.87,0.33 C1.71,0.33 1.54,0.39 1.41,0.52 C0.48,1.48 0.01,2.74 0.01,3.99 C0.01,5.25 0.48,6.51 1.41,7.47 C1.66,7.73 2.07,7.73 2.32,7.47 C2.57,7.21 2.57,6.79 2.32,6.53 C1.64,5.83 1.3,4.91 1.3,3.99 C1.3,3.07 1.64,2.15 2.32,1.45 C2.58,1.2 2.58,0.78 2.33,0.52 L2.33,0.52 Z M8.02,5.62 C8.92,5.62 9.64,4.89 9.64,4 C9.64,3.1 8.91,2.38 8.02,2.38 C7.12,2.38 6.4,3.11 6.4,4 C6.39,4.89 7.12,5.62 8.02,5.62 L8.02,5.62 Z M14.59,0.53 C14.34,0.27 13.93,0.27 13.68,0.53 C13.43,0.79 13.43,1.21 13.68,1.47 C14.36,2.17 14.7,3.09 14.7,4.01 C14.7,4.93 14.36,5.84 13.68,6.55 C13.43,6.81 13.43,7.23 13.68,7.49 C13.81,7.62 13.97,7.68 14.14,7.68 C14.3,7.68 14.47,7.62 14.6,7.49 C15.53,6.53 16,5.27 16,4.01 C15.99,2.75 15.52,1.49 14.59,0.53 L14.59,0.53 Z M8.02,6.92 L8.02,6.92 C7.61,6.92 7.19,6.82 6.82,6.62 L3.67,14.99 L5.16,14.99 L6.02,13.99 L10.02,13.99 L10.86,14.99 L12.35,14.99 L9.21,6.62 C8.83,6.82 8.43,6.92 8.02,6.92 L8.02,6.92 Z M8.01,7.4 L9.02,11 L7.02,11 L8.01,7.4 L8.01,7.4 Z M6.02,12.99 L7.02,11.99 L9.02,11.99 L10.02,12.99 L6.02,12.99 L6.02,12.99 Z M11.21,1.89 C10.96,2.14 10.96,2.56 11.21,2.81 C11.53,3.14 11.69,3.57 11.69,4 C11.69,4.43 11.53,4.86 11.21,5.19 C10.96,5.45 10.96,5.86 11.21,6.11 C11.33,6.24 11.5,6.3 11.66,6.3 C11.82,6.3 11.98,6.24 12.11,6.11 C12.68,5.53 12.96,4.76 12.96,4 C12.96,3.24 12.68,2.47 12.11,1.89 C11.86,1.64 11.45,1.64 11.21,1.89 L11.21,1.89 Z';
var _capitalist$elm_octicons$Octicons$quotePath = 'M6.16,3.50000004 C3.73,5.06000004 2.55,6.67000004 2.55,9.36000004 C2.71,9.31000004 2.85,9.31000004 2.99,9.31000004 C4.26,9.31000004 5.49,10.17 5.49,11.72 C5.49,13.33 4.46,14.33 2.99,14.33 C1.09,14.33 0,12.81 0,10.08 C0,6.28000004 1.75,3.55000004 5.02,1.66000004 L6.16,3.50000004 L6.16,3.50000004 Z M13.16,3.50000004 C10.73,5.06000004 9.55,6.67000004 9.55,9.36000004 C9.71,9.31000004 9.85,9.31000004 9.99,9.31000004 C11.26,9.31000004 12.49,10.17 12.49,11.72 C12.49,13.33 11.46,14.33 9.99,14.33 C8.1,14.33 7.01,12.81 7.01,10.08 C7.01,6.28000004 8.76,3.55000004 12.03,1.66000004 L13.17,3.50000004 L13.16,3.50000004 Z';
var _capitalist$elm_octicons$Octicons$questionPath = 'M6,10 L8,10 L8,12 L6,12 L6,10 L6,10 Z M10,6.5 C10,8.64 8,9 8,9 L6,9 C6,8.45 6.45,8 7,8 L7.5,8 C7.78,8 8,7.78 8,7.5 L8,6.5 C8,6.22 7.78,6 7.5,6 L6.5,6 C6.22,6 6,6.22 6,6.5 L6,7 L4,7 C4,5.5 5.5,4 7,4 C8.5,4 10,5 10,6.5 L10,6.5 Z M7,2.3 C10.14,2.3 12.7,4.86 12.7,8 C12.7,11.14 10.14,13.7 7,13.7 C3.86,13.7 1.3,11.14 1.3,8 C1.3,4.86 3.86,2.3 7,2.3 L7,2.3 Z M7,1 C3.14,1 0,4.14 0,8 C0,11.86 3.14,15 7,15 C10.86,15 14,11.86 14,8 C14,4.14 10.86,1 7,1 L7,1 Z';
var _capitalist$elm_octicons$Octicons$pulsePolygon = '11.5 8 8.8 5.4 6.6 8.5 5.5 1.6 2.38 8 0 8 0 10 3.6 10 4.5 8.2 5.4 13.6 9 8.5 10.6 10 14 10 14 8';
var _capitalist$elm_octicons$Octicons$projectPath = 'M10,12 L13,12 L13,2 L10,2 L10,12 L10,12 Z M6,10 L9,10 L9,2 L6,2 L6,10 L6,10 Z M2,14 L5,14 L5,2 L2,2 L2,14 L2,14 Z M1,15 L14,15 L14,1 L1,1 L1,15 L1,15 Z M14,0 L1,0 C0.448,0 0,0.448 0,1 L0,15 C0,15.552 0.448,16 1,16 L14,16 C14.552,16 15,15.552 15,15 L15,1 C15,0.448 14.552,0 14,0 L14,0 L14,0 Z';
var _capitalist$elm_octicons$Octicons$primitiveSquarePolygon = '8 12 0 12 0 4 8 4';
var _capitalist$elm_octicons$Octicons$primitiveDotPath = 'M0,8 C0,5.8 1.8,4 4,4 C6.2,4 8,5.8 8,8 C8,10.2 6.2,12 4,12 C1.8,12 0,10.2 0,8 L0,8 Z';
var _capitalist$elm_octicons$Octicons$plusPolygon = '12 9 7 9 7 14 5 14 5 9 0 9 0 7 5 7 5 2 7 2 7 7 12 7';
var _capitalist$elm_octicons$Octicons$plusSmallPath = 'M4,7 L4,4 L3,4 L3,7 L0,7 L0,8 L3,8 L3,11 L4,11 L4,8 L7,8 L7,7 L4,7 Z';
var _capitalist$elm_octicons$Octicons$plugPath = 'M14,6 L14,5 L10,5 L10,3 L8,3 L8,4 L6,4 C4.97,4 4.23,4.81 4,6 L3,7 C1.34,7 0,8.34 0,10 L0,12 L1,12 L1,10 C1,8.89 1.89,8 3,8 L4,9 C4.25,10.16 4.98,11 6,11 L8,11 L8,12 L10,12 L10,10 L14,10 L14,9 L10,9 L10,6 L14,6 L14,6 Z';
var _capitalist$elm_octicons$Octicons$pinPath = 'M10,1.2 L10,2 L10.5,3 L6,6 L2.2,6 C1.76,6 1.53,6.53 1.86,6.86 L5,10 L1,15 L6,11 L9.14,14.14 C9.47,14.47 10,14.23 10,13.8 L10,10 L13,5.5 L14,6 L14.8,6 C15.24,6 15.47,5.47 15.14,5.14 L10.86,0.86 C10.53,0.53 10,0.77 10,1.2 L10,1.2 Z';
var _capitalist$elm_octicons$Octicons$personPath = 'M12,14.002 C12,14.553 11.553,15 11.002,15 L1.001,15 C0.448,15 0,14.552 0,13.999 L0,13 C0,10.367 4,9 4,9 C4,9 4.229,8.591 4,8 C3.159,7.38 3.056,6.41 3,4 C3.173,1.587 4.867,1 6,1 C7.133,1 8.827,1.586 9,4 C8.944,6.41 8.841,7.38 8,8 C7.771,8.59 8,9 8,9 C8,9 12,10.367 12,13 L12,14.002 Z';
var _capitalist$elm_octicons$Octicons$pencilPath = 'M0,12 L0,15 L3,15 L11,7 L8,4 L0,12 L0,12 Z M3,14 L1,14 L1,12 L2,12 L2,13 L3,13 L3,14 L3,14 Z M13.3,4.7 L12,6 L9,3 L10.3,1.7 C10.69,1.31 11.32,1.31 11.71,1.7 L13.3,3.29 C13.69,3.68 13.69,4.31 13.3,4.7 L13.3,4.7 Z';
var _capitalist$elm_octicons$Octicons$paintcanPath = 'M6,0 C2.69,0 0,2.69 0,6 L0,7 C0,7.55 0.45,8 1,8 L1,13 C1,14.1 3.24,15 6,15 C8.76,15 11,14.1 11,13 L11,8 C11.55,8 12,7.55 12,7 L12,6 C12,2.69 9.31,0 6,0 L6,0 Z M9,10 L9,10.5 C9,10.78 8.78,11 8.5,11 C8.22,11 8,10.78 8,10.5 L8,10 C8,9.72 7.78,9.5 7.5,9.5 C7.22,9.5 7,9.72 7,10 L7,12.5 C7,12.78 6.78,13 6.5,13 C6.22,13 6,12.78 6,12.5 L6,10.5 C6,10.22 5.78,10 5.5,10 C5.22,10 5,10.22 5,10.5 L5,11 C5,11.55 4.55,12 4,12 C3.45,12 3,11.55 3,11 L3,10 C2.45,10 2,9.55 2,9 L2,7.2 C2.91,7.69 4.36,8 6,8 C7.64,8 9.09,7.69 10,7.2 L10,9 C10,9.55 9.55,10 9,10 L9,10 Z M6,7 C4.32,7 2.88,6.59 2.29,6 C2.88,5.41 4.32,5 6,5 C7.68,5 9.12,5.41 9.71,6 C9.12,6.59 7.68,7 6,7 L6,7 Z M6,4 C3.24,4 1,4.89 1,6 L1,6 C1,3.24 3.24,1 6,1 C8.76,1 11,3.24 11,6 C11,4.9 8.76,4 6,4 L6,4 Z';
var _capitalist$elm_octicons$Octicons$packagePath = 'M1,4.27 L1,11.74 C1,12.19 1.3,12.58 1.75,12.71 L8.25,14.44 C8.41,14.49 8.59,14.49 8.75,14.44 L15.25,12.71 C15.7,12.58 16,12.19 16,11.74 L16,4.27 C16,3.82 15.7,3.43 15.25,3.3 L8.75,1.56 C8.59,1.53 8.41,1.53 8.25,1.56 L1.75,3.3 C1.3,3.43 1,3.82 1,4.27 L1,4.27 Z M8,13.36 L2,11.77 L2,5 L8,6.61 L8,13.36 L8,13.36 Z M2,4 L4.5,3.33 L11,5.06 L8.5,5.73 L2,4 L2,4 Z M15,11.77 L9,13.36 L9,6.61 L11,6.06 L11,8.5 L13,7.97 L13,5.53 L15,5 L15,11.77 L15,11.77 Z M13,4.53 L6.5,2.8 L8.5,2.27 L15,4 L13,4.53 L13,4.53 Z';
var _capitalist$elm_octicons$Octicons$organizationPath = 'M16,12.999 C16,13.438 15.55,13.999 15,13.999 L7.995,13.999 C7.456,13.999 7.001,13.552 7,13 L1,13 C0.46,13 0,12.439 0,12 C0,9.366 3,8 3,8 C3,8 3.229,7.591 3,7 C2.159,6.379 1.942,6.41 2,4 C2.058,1.581 3.367,1 4.5,1 C5.633,1 6.942,1.58 7,4 C7.058,6.41 6.841,6.379 6,7 C5.771,7.59 6,8 6,8 C6,8 7.549,8.711 8.42,10.088 C9.196,9.369 10,8.999 10,8.999 C10,8.999 10.229,8.59 10,7.999 C9.159,7.379 8.942,7.409 9,4.999 C9.058,2.58 10.367,1.999 11.5,1.999 C12.633,1.999 13.937,2.58 13.995,4.999 C14.054,7.409 13.837,7.379 12.995,7.999 C12.766,8.589 12.995,8.999 12.995,8.999 C12.995,8.999 16,10.365 16,12.999';
var _capitalist$elm_octicons$Octicons$octofacePath = 'M14.7,5.34 C14.83,5.02 15.25,3.75 14.57,2.03 C14.57,2.03 13.52,1.7 11.13,3.33 C10.13,3.05 9.06,3.01 8,3.01 C6.94,3.01 5.87,3.05 4.87,3.33 C2.48,1.69 1.43,2.03 1.43,2.03 C0.75,3.75 1.17,5.02 1.3,5.34 C0.49,6.21 0,7.33 0,8.69 C0,13.84 3.33,15 7.98,15 C12.63,15 16,13.84 16,8.69 C16,7.33 15.51,6.21 14.7,5.34 L14.7,5.34 Z M8,14.02 C4.7,14.02 2.02,13.87 2.02,10.67 C2.02,9.91 2.4,9.19 3.04,8.6 C4.11,7.62 5.94,8.14 8,8.14 C10.07,8.14 11.88,7.62 12.96,8.6 C13.61,9.19 13.98,9.9 13.98,10.67 C13.98,13.86 11.3,14.02 8,14.02 L8,14.02 Z M5.49,9.01 C4.83,9.01 4.29,9.81 4.29,10.79 C4.29,11.77 4.83,12.58 5.49,12.58 C6.15,12.58 6.69,11.78 6.69,10.79 C6.69,9.8 6.15,9.01 5.49,9.01 L5.49,9.01 Z M10.51,9.01 C9.85,9.01 9.31,9.8 9.31,10.79 C9.31,11.78 9.85,12.58 10.51,12.58 C11.17,12.58 11.71,11.78 11.71,10.79 C11.71,9.8 11.18,9.01 10.51,9.01 L10.51,9.01 Z';
var _capitalist$elm_octicons$Octicons$notePath = 'M3,10 L7,10 L7,9 L3,9 L3,10 L3,10 Z M3,8 L9,8 L9,7 L3,7 L3,8 L3,8 Z M3,6 L11,6 L11,5 L3,5 L3,6 L3,6 Z M13,12 L1,12 L1,3 L13,3 L13,12 L13,12 Z M1,2 C0.45,2 0,2.45 0,3 L0,12 C0,12.55 0.45,13 1,13 L13,13 C13.55,13 14,12.55 14,12 L14,3 C14,2.45 13.55,2 13,2 L1,2 L1,2 Z';
var _capitalist$elm_octicons$Octicons$noNewlinePath = 'M16,5 L16,8 C16,8.55 15.55,9 15,9 L12,9 L12,11 L9,8 L12,5 L12,7 L14,7 L14,5 L16,5 L16,5 Z M8,8 C8,10.2 6.2,12 4,12 C1.8,12 0,10.2 0,8 C0,5.8 1.8,4 4,4 C6.2,4 8,5.8 8,8 L8,8 Z M1.5,9.66 L5.66,5.5 C5.18,5.19 4.61,5 4,5 C2.34,5 1,6.34 1,8 C1,8.61 1.19,9.17 1.5,9.66 L1.5,9.66 Z M7,8 C7,7.39 6.81,6.83 6.5,6.34 L2.34,10.5 C2.82,10.81 3.39,11 4,11 C5.66,11 7,9.66 7,8 L7,8 Z';
var _capitalist$elm_octicons$Octicons$mutePath = 'M8,2.81 L8,13.19 C8,13.86 7.19,14.19 6.72,13.72 L3,10 L1,10 C0.45,10 0,9.55 0,9 L0,7 C0,6.45 0.45,6 1,6 L3,6 L6.72,2.28 C7.19,1.81 8,2.14 8,2.81 L8,2.81 Z M15.53,6.03 L14.47,4.97 L12.5,6.94 L10.53,4.97 L9.47,6.03 L11.44,8 L9.47,9.97 L10.53,11.03 L12.5,9.06 L14.47,11.03 L15.53,9.97 L13.56,8 L15.53,6.03 L15.53,6.03 Z';
var _capitalist$elm_octicons$Octicons$mortarBoardPath = 'M7.83,9.19 L4,8 C8.8817842e-16,1.33226763e-15 4,9.5 4,10.5 C4,11.5 5.8,12 8,12 C10.2,12 12,11.5 12,10.5 L12,8 L8.17,9.19 C8.06,9.22 7.94,9.22 7.81,9.19 L7.83,9.19 L7.83,9.19 Z M8.11,2.8 C8.05,2.78 7.97,2.78 7.91,2.8 L0.27,5.18 C-0.06,5.29 -0.06,5.74 0.27,5.85 L2,6.4 L2,8.17 C1.7,8.34 1.5,8.67 1.5,9.03 C1.5,9.22 1.55,9.39 1.64,9.53 C1.56,9.67 1.5,9.84 1.5,10.03 L1.5,12.61 C1.5,13.16 3.5,13.16 3.5,12.61 L3.5,10.03 C3.5,9.84 3.45,9.67 3.36,9.53 C3.44,9.39 3.5,9.22 3.5,9.03 C3.5,8.65 3.3,8.34 3,8.17 L3,6.72 L7.89,8.25 C7.95,8.27 8.03,8.27 8.09,8.25 L15.73,5.87 C16.06,5.76 16.06,5.31 15.73,5.2 L8.1,2.81 L8.11,2.8 Z M8.02,6 C7.47,6 7.02,5.78 7.02,5.5 C7.02,5.22 7.47,5 8.02,5 C8.57,5 9.02,5.22 9.02,5.5 C9.02,5.78 8.57,6 8.02,6 L8.02,6 Z';
var _capitalist$elm_octicons$Octicons$mirrorPath = 'M15.5,4.7 L8.5,0 L1.5,4.7 C1.2,4.89 1,5.15 1,5.5 L1,16 L8.5,12 L16,16 L16,5.5 C16,5.16 15.8,4.89 15.5,4.7 L15.5,4.7 Z M15,14.5 L9,11.25 L9,10 L8,10 L8,11.25 L2,14.5 L2,5.5 L8,1.5 L8,6 L9,6 L9,1.5 L15,5.5 L15,14.5 L15,14.5 Z M6,7 L11,7 L11,5 L14,8 L11,11 L11,9 L6,9 L6,11 L3,8 L6,5 L6,7 L6,7 Z';
var _capitalist$elm_octicons$Octicons$milestonePath = 'M8,2 L6,2 L6,0 L8,0 L8,2 L8,2 Z M12,7 L2,7 C1.45,7 1,6.55 1,6 L1,4 C1,3.45 1.45,3 2,3 L12,3 L14,5 L12,7 L12,7 Z M8,4 L6,4 L6,6 L8,6 L8,4 L8,4 Z M6,16 L8,16 L8,8 L6,8 L6,16 L6,16 Z';
var _capitalist$elm_octicons$Octicons$mentionPath = 'M6.58,15 C7.83,15 9.1,14.69 10.14,14.06 L9.72,13.12 C8.88,13.64 7.83,13.95 6.69,13.95 C3.46,13.95 1.05,11.87 1.05,8.23 C1.05,3.86 4.28,1.05 7.63,1.05 C11.08,1.05 12.85,3.24 12.85,6.25 C12.85,8.64 11.51,10.11 10.35,10.11 C9.3,10.11 8.99,9.38 9.3,7.92 L10.03,4.17 L8.98,4.17 L8.87,4.89 C8.46,4.26 7.93,4.06 7.31,4.06 C5.12,4.06 3.65,6.45 3.65,8.44 C3.65,10.11 4.59,11.05 5.95,11.05 C6.79,11.05 7.62,10.52 8.25,9.8 C8.36,10.74 9.19,11.25 10.23,11.25 C11.9,11.25 14,9.58 14,6.25 C14,2.61 11.59,0 7.83,0 C3.66,0 0,3.33 0,8.33 C0,12.71 2.92,15 6.58,15 L6.58,15 Z M6.27,10 C5.54,10 4.91,9.48 4.91,8.33 C4.91,6.88 5.85,5.11 7.32,5.11 C7.84,5.11 8.16,5.31 8.57,5.94 L8.05,8.96 C7.42,9.69 6.8,10.01 6.27,10.01 L6.27,10 Z';
var _capitalist$elm_octicons$Octicons$megaphonePath = 'M10,1 C9.83,1 9.64,1.05 9.48,1.14 C8.04,2.02 4.5,4.58 3,5 C1.62,5 0,5.67 0,7.5 C0,9.33 1.63,10 3,10 C3.3,10.08 3.64,10.23 4,10.41 L4,15 L6,15 L6,11.55 C7.34,12.41 8.69,13.38 9.48,13.86 C9.64,13.95 9.82,14 10,14 C10.52,14 11,13.58 11,13 L11,2 C11,1.42 10.52,1 10,1 L10,1 Z M10,13 C9.62,12.77 9.11,12.42 8.5,12 C8.34,11.89 8.17,11.78 8,11.66 L8,3.31 C8.16,3.2 8.31,3.11 8.47,3 C9.08,2.59 9.63,2.23 10,2 L10,13 L10,13 Z M12,7 L16,7 L16,8 L12,8 L12,7 L12,7 Z M12,9 L16,11 L16,12 L12,10 L12,9 L12,9 Z M16,3 L16,4 L12,6 L12,5 L16,3 L16,3 Z';
var _capitalist$elm_octicons$Octicons$markdownPath = 'M14.85,3 L1.15,3 C0.52,3 0,3.52 0,4.15 L0,11.84 C0,12.48 0.52,13 1.15,13 L14.84,13 C15.48,13 15.99,12.48 15.99,11.85 L15.99,4.15 C16,3.52 15.48,3 14.85,3 L14.85,3 Z M9,11 L7,11 L7,8 L5.5,9.92 L4,8 L4,11 L2,11 L2,5 L4,5 L5.5,7 L7,5 L9,5 L9,11 L9,11 Z M11.99,11.5 L9.5,8 L11,8 L11,5 L13,5 L13,8 L14.5,8 L11.99,11.5 L11.99,11.5 Z';
var _capitalist$elm_octicons$Octicons$markTwitterPath = 'M16 32c8.8366 0 16-7.1634 16-16S24.8366 0 16 0 0 7.1634 0 16s7.1634 16 16 16zm9.2903-21.735c.974-.5842 1.722-1.509 2.0742-2.6104-.9116.541-1.921.9333-2.9964 1.1447-.86-.9168-2.086-1.4898-3.443-1.4898-2.606 0-4.718 2.1124-4.718 4.7183 0 .37.0414.7302.122 1.0753-3.9214-.196-7.3982-2.075-9.7254-4.93-.4062.697-.639 1.507-.639 2.372 0 1.638.8328 3.082 2.099 3.928-.7732-.024-1.501-.236-2.137-.59-.0008.02-.0008.04-.0008.059 0 2.287 1.627 4.193 3.785 4.627-.3954.108-.812.165-1.2425.165-.3043 0-.5994-.029-.888-.084.601 1.8748 2.343 3.239 4.4083 3.277-1.6167 1.2657-3.651 2.0197-5.8617 2.0197-.3807 0-.7566-.0222-1.126-.0655C7.089 25.219 9.569 26 12.234 26c8.6788 0 13.4242-7.1896 13.4242-13.4254 0-.2044-.0047-.4075-.0132-.61.9215-.6657 1.7213-1.4965 2.3543-2.443-.8444.3754-1.754.629-2.7083.7434z';
var _capitalist$elm_octicons$Octicons$markTorPath = 'm8,0c-4.418 0-8 3.582-8 8-1e-6 4.418 3.582 8 8 8 4.418 0 8-3.582 8-8 1e-6 -4.418-3.582-8-8-8zm1.274 1c-0.7039 0.8177-0.04023 1.3-0.4336 2.118 0.6625-0.9316 2.203-1.252 3.207-1.594-1.319 1.176-2.363 2.728-3.667 3.897l0.8145 0.2617c-0.2691 0.8902 0.1563 1.222 0.415 1.367 0.5797 0.3209 1.138 0.652 1.583 1.056 0.8385 0.766 1.315 1.842 1.315 2.98 0 1.128-0.5182 2.216-1.388 2.94-0.8177 0.6832-1.946 0.9727-3.043 0.9727-0.6832 0-1.294-0.0306-1.956-0.248-1.511-0.5072-2.64-1.802-2.733-3.354-0.08284-1.211 0.1869-2.132 1.129-3.095 0.4864-0.5072 1.121-1.203 1.794-1.669 0.3313-0.2278 0.4902-0.5214-0.1826-1.732l0.5605-0.4707 0.7598 0.5225c-0.2142-1.82-0.6682-1.969 1.825-3.953zm-2.392 4.139c0.07246 0.1035 0.521 0.3372 0.5625 0.4717 0.09315 0.383-0.08415 0.7749-0.167 0.9404-0.4244 0.766-0.8139 0.9959-1.342 1.431-0.9316 0.766-1.869 1.242-1.755 3.343 0.05177 1.035 0.6269 2.317 1.838 2.907 0.2319 0.1124 0.451 0.2018 0.6699 0.2812-0.2116-0.1294-0.3974-0.2823-0.5557-0.4912 0-0.0103-0.06543-0.0684-0.06543-0.0684-0.3799-0.4969-0.7677-1.22-0.8848-1.989-0.06332-0.3106-0.03325-0.5872 0.03906-0.9082 0.3075-1.263 0.6185-1.792 1.2-2.426 0.1538-0.1138 0.2938-0.2946 0.4385-0.4775 0.1574-0.219 0.4313-0.7946 0.626-1.318v-1.618zm1.043 0.1553v9.287c0.2341-0.2521 0.3678-0.5496 0.4541-0.9072 0.2071-0.7965 0.5061-1.649 0.3818-2.147-0.03108-0.1138-0.08121-0.5398-0.2676-0.96-0.2691-0.6039-0.3717-1.109-0.4131-1.223-0.1449-0.3326-0.1371-1.206-0.1475-1.661 0.02069 0.5426 0.3677 1.286 0.4609 1.47 0.05169 0.1138 0.4065 0.6713 0.6963 1.258 0.1967 0.3852 0.2684 0.7767 0.2891 0.8818 0.1552 1.085-0.09449 1.557-0.4258 2.537-0.1458 0.4282-0.5277 0.7958-0.8086 0.9619 0.06345-6e-5 0.1266 6e-5 0.1973-6e-3 1.292-0.9776 1.906-2.875 1.419-5.031-0.2002-0.8509-0.757-1.703-1.308-2.574-0.2129-0.5372-0.1815-1.046-0.1748-1.549-0.141-0.1482-0.2463-0.2403-0.3535-0.3369zm-0.4385 2.416c-0.06122 0.3239-0.1381 0.6324-0.2412 0.8066-0.1441 0.2402-0.181 0.3544-0.3438 0.4785-0.4772 0.6717-0.6342 0.7707-0.9326 1.992-0.06332 0.2588-0.1676 0.6631-0.1133 0.9219 0.1628 0.7452 0.2886 1.258 0.5752 1.796 0 0 0.05566 0.0535 0.05566 0.0742 0.2741 0.3707 0.3102 0.464 1 0.8799z';
var _capitalist$elm_octicons$Octicons$markGithubPath = 'M8,0 C3.58,0 0,3.58 0,8 C0,11.54 2.29,14.53 5.47,15.59 C5.87,15.66 6.02,15.42 6.02,15.21 C6.02,15.02 6.01,14.39 6.01,13.72 C4,14.09 3.48,13.23 3.32,12.78 C3.23,12.55 2.84,11.84 2.5,11.65 C2.22,11.5 1.82,11.13 2.49,11.12 C3.12,11.11 3.57,11.7 3.72,11.94 C4.44,13.15 5.59,12.81 6.05,12.6 C6.12,12.08 6.33,11.73 6.56,11.53 C4.78,11.33 2.92,10.64 2.92,7.58 C2.92,6.71 3.23,5.99 3.74,5.43 C3.66,5.23 3.38,4.41 3.82,3.31 C3.82,3.31 4.49,3.1 6.02,4.13 C6.66,3.95 7.34,3.86 8.02,3.86 C8.7,3.86 9.38,3.95 10.02,4.13 C11.55,3.09 12.22,3.31 12.22,3.31 C12.66,4.41 12.38,5.23 12.3,5.43 C12.81,5.99 13.12,6.7 13.12,7.58 C13.12,10.65 11.25,11.33 9.47,11.53 C9.76,11.78 10.01,12.26 10.01,13.01 C10.01,14.08 10,14.94 10,15.21 C10,15.42 10.15,15.67 10.55,15.59 C13.71,14.53 16,11.53 16,8 C16,3.58 12.42,0 8,0 L8,0 Z';
var _capitalist$elm_octicons$Octicons$mailPath = 'M0,4 L0,12 C0,12.55 0.45,13 1,13 L13,13 C13.55,13 14,12.55 14,12 L14,4 C14,3.45 13.55,3 13,3 L1,3 C0.45,3 0,3.45 0,4 L0,4 Z M13,4 L7,9 L1,4 L13,4 L13,4 Z M1,5.5 L5,8.5 L1,11.5 L1,5.5 L1,5.5 Z M2,12 L5.5,9 L7,10.5 L8.5,9 L12,12 L2,12 L2,12 Z M13,11.5 L9,8.5 L13,5.5 L13,11.5 L13,11.5 Z';
var _capitalist$elm_octicons$Octicons$mailReplyPath = 'M6,2.5 L0,7 L6,11.5 L6,8.5 C7.73,8.5 11.14,9.45 12,12.88 C12,8.33 8.94,5.83 6,5.5 L6,2.5 L6,2.5 Z';
var _capitalist$elm_octicons$Octicons$mailReadPath = 'M6,5 L4,5 L4,4 L6,4 L6,5 L6,5 Z M9,6 L4,6 L4,7 L9,7 L9,6 L9,6 Z M14,5.52 L14,14 C14,14.55 13.55,15 13,15 L1,15 C0.45,15 0,14.55 0,14 L0,5.52 C0,5.19 0.16,4.89 0.42,4.71 L2,3.58 L2,3 C2,2.45 2.45,2 3,2 L4.2,2 L7,0 L9.8,2 L11,2 C11.55,2 12,2.45 12,3 L12,3.58 L13.58,4.71 C13.85,4.9 14,5.19 14,5.52 L14,5.52 Z M3,7.5 L7,10 L11,7.5 L11,3 L3,3 L3,7.5 L3,7.5 Z M1,13.5 L5.5,10.5 L1,7.5 L1,13.5 L1,13.5 Z M12,14 L7,11 L2,14 L12,14 L12,14 Z M13,7.5 L8.5,10.5 L13,13.5 L13,7.5 L13,7.5 Z';
var _capitalist$elm_octicons$Octicons$logoGithubPath = 'M18.53 12.03h-.02c.009 0 .015.01.024.011h.006l-.01-.01zm.004.011c-.093.001-.327.05-.574.05-.78 0-1.05-.36-1.05-.83V8.13h1.59c.09 0 .16-.08.16-.19v-1.7c0-.09-.08-.17-.16-.17h-1.59V3.96c0-.08-.05-.13-.14-.13h-2.16c-.09 0-.14.05-.14.13v2.17s-1.09.27-1.16.28c-.08.02-.13.09-.13.17v1.36c0 .11.08.19.17.19h1.11v3.28c0 2.44 1.7 2.69 2.86 2.69.53 0 1.17-.17 1.27-.22.06-.02.09-.09.09-.16v-1.5a.177.177 0 0 0-.146-.18zm23.696-2.2c0-1.81-.73-2.05-1.5-1.97-.6.04-1.08.34-1.08.34v3.52s.49.34 1.22.36c1.03.03 1.36-.34 1.36-2.25zm2.43-.16c0 3.43-1.11 4.41-3.05 4.41-1.64 0-2.52-.83-2.52-.83s-.04.46-.09.52c-.03.06-.08.08-.14.08h-1.48c-.1 0-.19-.08-.19-.17l.02-11.11c0-.09.08-.17.17-.17h2.13c.09 0 .17.08.17.17v3.77s.82-.53 2.02-.53l-.01-.02c1.2 0 2.97.45 2.97 3.88zm-8.72-3.61H33.84c-.11 0-.17.08-.17.19v5.44s-.55.39-1.3.39-.97-.34-.97-1.09V6.25c0-.09-.08-.17-.17-.17h-2.14c-.09 0-.17.08-.17.17v5.11c0 2.2 1.23 2.75 2.92 2.75 1.39 0 2.52-.77 2.52-.77s.05.39.08.45c.02.05.09.09.16.09h1.34c.11 0 .17-.08.17-.17l.02-7.47c0-.09-.08-.17-.19-.17zm-23.7-.01h-2.13c-.09 0-.17.09-.17.2v7.34c0 .2.13.27.3.27h1.92c.2 0 .25-.09.25-.27V6.23c0-.09-.08-.17-.17-.17zm-1.05-3.38c-.77 0-1.38.61-1.38 1.38 0 .77.61 1.38 1.38 1.38.75 0 1.36-.61 1.36-1.38 0-.77-.61-1.38-1.36-1.38zm16.49-.25h-2.11c-.09 0-.17.08-.17.17v4.09h-3.31V2.6c0-.09-.08-.17-.17-.17h-2.13c-.09 0-.17.08-.17.17v11.11c0 .09.09.17.17.17h2.13c.09 0 .17-.08.17-.17V8.96h3.31l-.02 4.75c0 .09.08.17.17.17h2.13c.09 0 .17-.08.17-.17V2.6c0-.09-.08-.17-.17-.17zM8.81 7.35v5.74c0 .04-.01.11-.06.13 0 0-1.25.89-3.31.89-2.49 0-5.44-.78-5.44-5.92S2.58 1.99 5.1 2c2.18 0 3.06.49 3.2.58.04.05.06.09.06.14L7.94 4.5c0 .09-.09.2-.2.17-.36-.11-.9-.33-2.17-.33-1.47 0-3.05.42-3.05 3.73s1.5 3.7 2.58 3.7c.92 0 1.25-.11 1.25-.11v-2.3H4.88c-.11 0-.19-.08-.19-.17V7.35c0-.09.08-.17.19-.17h3.74c.11 0 .19.08.19.17z';
var _capitalist$elm_octicons$Octicons$logoGistPath = 'M4.7,8.73 L7.15,8.73 L7.15,12.75 C6.6,13.02 5.51,13.09 4.62,13.09 C2.06,13.09 1.15,10.89 1.15,8.04 C1.15,5.19 2.06,2.98 4.63,2.98 C5.91,2.98 6.69,3.21 7.91,3.71 L7.91,2.66 C7.27,2.33 6.25,2 4.63,2 C1.13,2 0,4.69 0,8.03 C0,11.37 1.11,14.06 4.63,14.06 C6.27,14.06 7.44,13.79 8.22,13.42 L8.22,7.73 L4.7,7.73 L4.7,8.73 L4.7,8.73 Z M11.09,12.45 L11.09,6.06 L10.04,6.06 L10.04,12.34 C10.04,13.59 10.62,14.06 11.76,14.06 L11.76,13.17 C11.28,13.17 11.09,13.01 11.09,12.47 L11.09,12.45 L11.09,12.45 Z M11.34,3.73 C11.34,3.29 11.01,2.95 10.56,2.95 C10.11,2.95 9.79,3.29 9.79,3.73 C9.79,4.17 10.12,4.51 10.56,4.51 C11,4.51 11.34,4.17 11.34,3.73 L11.34,3.73 Z M15.68,9.42 C14.18,9.29 13.9,8.94 13.9,8.25 C13.9,7.48 14.23,6.91 15.78,6.91 C16.83,6.91 17.44,7.07 18.05,7.27 L18.05,6.33 C17.36,6.03 16.53,5.94 15.8,5.94 C13.6,5.94 12.88,7.14 12.88,8.25 C12.88,9.33 13.35,10.13 15.61,10.33 C17.16,10.46 17.38,10.96 17.38,11.67 C17.38,12.4 16.94,13.09 15.32,13.09 C14.21,13.09 13.46,12.9 12.99,12.73 L12.99,13.67 C13.49,13.87 14.57,14.06 15.32,14.06 C17.7,14.06 18.46,12.86 18.46,11.65 C18.46,10.37 17.93,9.62 15.71,9.42 L15.69,9.42 L15.68,9.42 Z M24.26,6.95 L24.26,6.09 L21.84,6.09 L21.84,3.59 L20.76,3.9 L20.76,6.01 L19.2,6.45 L19.2,6.93 L20.76,6.93 L20.76,11.93 C20.76,13.46 21.95,14.06 23.26,14.06 C23.45,14.06 23.78,14.04 23.95,14.01 L23.95,13.12 C23.76,13.15 23.54,13.15 23.34,13.15 C22.37,13.15 21.84,12.76 21.84,11.81 L21.84,6.94 L24.26,6.94 L24.26,6.96 L24.26,6.95 Z';
var _capitalist$elm_octicons$Octicons$lockPath = 'M4,13 L3,13 L3,12 L4,12 L4,13 L4,13 Z M12,7 L12,14 C12,14.55 11.55,15 11,15 L1,15 C0.45,15 0,14.55 0,14 L0,7 C0,6.45 0.45,6 1,6 L2,6 L2,4 C2,1.8 3.8,0 6,0 C8.2,0 10,1.8 10,4 L10,6 L11,6 C11.55,6 12,6.45 12,7 L12,7 Z M3.8,6 L8.21,6 L8.21,4 C8.21,2.78 7.23,1.8 6.01,1.8 C4.79,1.8 3.81,2.78 3.81,4 L3.81,6 L3.8,6 Z M11,7 L2,7 L2,14 L11,14 L11,7 L11,7 Z M4,8 L3,8 L3,9 L4,9 L4,8 L4,8 Z M4,10 L3,10 L3,11 L4,11 L4,10 L4,10 Z';
var _capitalist$elm_octicons$Octicons$locationPath = 'M6,0 C2.69,0 0,2.5 0,5.5 C0,10.02 6,16 6,16 C6,16 12,10.02 12,5.5 C12,2.5 9.31,0 6,0 L6,0 Z M6,14.55 C4.14,12.52 1,8.44 1,5.5 C1,3.02 3.25,1 6,1 C7.34,1 8.61,1.48 9.56,2.36 C10.48,3.22 11,4.33 11,5.5 C11,8.44 7.86,12.52 6,14.55 L6,14.55 Z M8,5.5 C8,6.61 7.11,7.5 6,7.5 C4.89,7.5 4,6.61 4,5.5 C4,4.39 4.89,3.5 6,3.5 C7.11,3.5 8,4.39 8,5.5 L8,5.5 Z';
var _capitalist$elm_octicons$Octicons$listUnorderedPath = 'M2,13 C2,13.59 2,14 1.41,14 L0.59,14 C0,14 0,13.59 0,13 C0,12.41 0,12 0.59,12 L1.4,12 C1.99,12 1.99,12.41 1.99,13 L2,13 Z M4.59,4 L11.4,4 C11.99,4 11.99,3.59 11.99,3 C11.99,2.41 11.99,2 11.4,2 L4.59,2 C4,2 4,2.41 4,3 C4,3.59 4,4 4.59,4 L4.59,4 Z M1.41,7 L0.59,7 C0,7 0,7.41 0,8 C0,8.59 0,9 0.59,9 L1.4,9 C1.99,9 1.99,8.59 1.99,8 C1.99,7.41 1.99,7 1.4,7 L1.41,7 Z M1.41,2 L0.59,2 C0,2 0,2.41 0,3 C0,3.59 0,4 0.59,4 L1.4,4 C1.99,4 1.99,3.59 1.99,3 C1.99,2.41 1.99,2 1.4,2 L1.41,2 Z M11.41,7 L4.59,7 C4,7 4,7.41 4,8 C4,8.59 4,9 4.59,9 L11.4,9 C11.99,9 11.99,8.59 11.99,8 C11.99,7.41 11.99,7 11.4,7 L11.41,7 Z M11.41,12 L4.59,12 C4,12 4,12.41 4,13 C4,13.59 4,14 4.59,14 L11.4,14 C11.99,14 11.99,13.59 11.99,13 C11.99,12.41 11.99,12 11.4,12 L11.41,12 Z';
var _capitalist$elm_octicons$Octicons$listOrderedPath = 'M12,13 C12,13.59 12,14 11.41,14 L4.59,14 C4,14 4,13.59 4,13 C4,12.41 4,12 4.59,12 L11.4,12 C11.99,12 11.99,12.41 11.99,13 L12,13 Z M4.59,4 L11.4,4 C11.99,4 11.99,3.59 11.99,3 C11.99,2.41 11.99,2 11.4,2 L4.59,2 C4,2 4,2.41 4,3 C4,3.59 4,4 4.59,4 L4.59,4 Z M11.4,7 L4.59,7 C4,7 4,7.41 4,8 C4,8.59 4,9 4.59,9 L11.4,9 C11.99,9 11.99,8.59 11.99,8 C11.99,7.41 11.99,7 11.4,7 L11.4,7 Z M2,1 L1.28,1 C0.98,1.19 0.7,1.25 0.25,1.34 L0.25,2 L1,2 L1,4.14 L0.16,4.14 L0.16,5 L3,5 L3,4.14 L2,4.14 L2,1 L2,1 Z M2.25,9.13 C2.08,9.13 1.8,9.16 1.59,9.19 C2.12,8.63 2.73,7.94 2.73,7.3 C2.71,6.52 2.17,6 1.37,6 C0.78,6 0.4,6.2 -0.01,6.64 L0.57,7.22 C0.76,7.03 0.95,6.84 1.21,6.84 C1.49,6.84 1.69,7 1.69,7.36 C1.69,7.89 0.92,8.56 -0.01,9.42 L-0.01,10 L2.99,10 L2.9,9.12 L2.24,9.12 L2.25,9.13 Z M2.17,12.91 L2.17,12.88 C2.61,12.69 2.81,12.41 2.81,12.02 C2.81,11.32 2.25,10.91 1.37,10.91 C0.89,10.91 0.48,11.1 0.09,11.43 L0.64,12.07 C0.89,11.87 1.08,11.76 1.33,11.76 C1.6,11.76 1.75,11.89 1.75,12.12 C1.75,12.39 1.55,12.56 0.89,12.56 L0.89,13.31 C1.72,13.31 1.87,13.48 1.87,13.78 C1.87,14.03 1.64,14.16 1.29,14.16 C1.01,14.16 0.73,14.02 0.48,13.78 L-2.22044605e-16,14.44 C0.3,14.8 0.77,15 1.41,15 C2.24,15 2.94,14.59 2.94,13.84 C2.94,13.34 2.63,13.03 2.17,12.9 L2.17,12.91 Z';
var _capitalist$elm_octicons$Octicons$linkPath = 'M4,9 L5,9 L5,10 L4,10 C2.5,10 1,8.31 1,6.5 C1,4.69 2.55,3 4,3 L8,3 C9.45,3 11,4.69 11,6.5 C11,7.91 10.09,9.22 9,9.75 L9,8.59 C9.58,8.14 10,7.32 10,6.5 C10,5.22 8.98,4 8,4 L4,4 C3.02,4 2,5.22 2,6.5 C2,7.78 3,9 4,9 L4,9 Z M13,6 L12,6 L12,7 L13,7 C14,7 15,8.22 15,9.5 C15,10.78 13.98,12 13,12 L9,12 C8.02,12 7,10.78 7,9.5 C7,8.67 7.42,7.86 8,7.41 L8,6.25 C6.91,6.78 6,8.09 6,9.5 C6,11.31 7.55,13 9,13 L13,13 C14.45,13 16,11.31 16,9.5 C16,7.69 14.5,6 13,6 L13,6 Z';
var _capitalist$elm_octicons$Octicons$linkExternalPath = 'M11,10 L12,10 L12,13 C12,13.55 11.55,14 11,14 L1,14 C0.45,14 0,13.55 0,13 L0,3 C0,2.45 0.45,2 1,2 L4,2 L4,3 L1,3 L1,13 L11,13 L11,10 L11,10 Z M6,2 L8.25,4.25 L5,7.5 L6.5,9 L9.75,5.75 L12,8 L12,2 L6,2 L6,2 Z';
var _capitalist$elm_octicons$Octicons$lightBulbPath = 'M6.5,0 C3.48,0 1,2.19 1,5 C1,5.92 1.55,7.25 2,8 C3.34,10.25 3.78,10.78 4,12 L4,13 L9,13 L9,12 C9.22,10.78 9.66,10.25 11,8 C11.45,7.25 12,5.92 12,5 C12,2.19 9.52,0 6.5,0 L6.5,0 Z M10.14,7.48 C9.89,7.92 9.67,8.28 9.47,8.59 C8.61,10 8.22,10.65 8.02,11.82 C8,11.87 8,11.93 8,11.99 L5,11.99 C5,11.93 5,11.86 4.98,11.82 C4.78,10.65 4.39,9.99 3.53,8.59 C3.33,8.28 3.11,7.92 2.86,7.48 C2.44,6.78 2,5.65 2,5 C2,2.8 4.02,1 6.5,1 C7.72,1 8.86,1.42 9.72,2.19 C10.55,2.94 11,3.94 11,5 C11,5.66 10.56,6.78 10.14,7.48 L10.14,7.48 Z M4,14 L9,14 C8.77,15.14 7.7,16 6.5,16 C5.3,16 4.23,15.14 4,14 L4,14 Z';
var _capitalist$elm_octicons$Octicons$lawPath = 'M7,4 C6.17,4 5.5,3.33 5.5,2.5 C5.5,1.67 6.17,1 7,1 C7.83,1 8.5,1.67 8.5,2.5 C8.5,3.33 7.83,4 7,4 L7,4 Z M14,10 C14,11.11 13.11,12 12,12 L11,12 C9.89,12 9,11.11 9,10 L11,6 L10,6 C9.45,6 9,5.55 9,5 L8,5 L8,13 C8.42,13 9,13.45 9,14 L10,14 C10.42,14 11,14.45 11,15 L3,15 C3,14.45 3.58,14 4,14 L5,14 C5,13.45 5.58,13 6,13 L6.03,13 L6,5 L5,5 C5,5.55 4.55,6 4,6 L3,6 L5,10 C5,11.11 4.11,12 3,12 L2,12 C0.89,12 0,11.11 0,10 L2,6 L1,6 L1,5 L4,5 C4,4.45 4.45,4 5,4 L9,4 C9.55,4 10,4.45 10,5 L13,5 L13,6 L12,6 L14,10 L14,10 Z M2.5,7 L1,10 L4,10 L2.5,7 L2.5,7 Z M13,10 L11.5,7 L10,10 L13,10 L13,10 Z';
var _capitalist$elm_octicons$Octicons$keyboardPath = 'M10,5 L9,5 L9,4 L10,4 L10,5 L10,5 Z M3,6 L2,6 L2,7 L3,7 L3,6 L3,6 Z M8,4 L7,4 L7,5 L8,5 L8,4 L8,4 Z M4,4 L2,4 L2,5 L4,5 L4,4 L4,4 Z M12,11 L14,11 L14,10 L12,10 L12,11 L12,11 Z M8,7 L9,7 L9,6 L8,6 L8,7 L8,7 Z M4,10 L2,10 L2,11 L4,11 L4,10 L4,10 Z M12,4 L11,4 L11,5 L12,5 L12,4 L12,4 Z M14,4 L13,4 L13,5 L14,5 L14,4 L14,4 Z M12,9 L14,9 L14,6 L12,6 L12,9 L12,9 Z M16,3 L16,12 C16,12.55 15.55,13 15,13 L1,13 C0.45,13 0,12.55 0,12 L0,3 C0,2.45 0.45,2 1,2 L15,2 C15.55,2 16,2.45 16,3 L16,3 Z M15,3 L1,3 L1,12 L15,12 L15,3 L15,3 Z M6,7 L7,7 L7,6 L6,6 L6,7 L6,7 Z M6,4 L5,4 L5,5 L6,5 L6,4 L6,4 Z M4,7 L5,7 L5,6 L4,6 L4,7 L4,7 Z M5,11 L11,11 L11,10 L5,10 L5,11 L5,11 Z M10,7 L11,7 L11,6 L10,6 L10,7 L10,7 Z M3,8 L2,8 L2,9 L3,9 L3,8 L3,8 Z M8,8 L8,9 L9,9 L9,8 L8,8 L8,8 Z M6,8 L6,9 L7,9 L7,8 L6,8 L6,8 Z M5,8 L4,8 L4,9 L5,9 L5,8 L5,8 Z M10,9 L11,9 L11,8 L10,8 L10,9 L10,9 Z';
var _capitalist$elm_octicons$Octicons$keyPath = 'M12.83,2.17 C12.08,1.42 11.14,1.03 10,1 C8.87,1.03 7.92,1.42 7.17,2.17 C6.42,2.92 6.04,3.86 6.01,5 C6.01,5.3 6.04,5.59 6.1,5.89 L0,12 L0,13 L1,14 L3,14 L4,13 L4,12 L5,12 L5,11 L6,11 L6,10 L8,10 L9.09,8.89 C9.39,8.97 9.68,9 10,9 C11.14,8.97 12.08,8.58 12.83,7.83 C13.58,7.08 13.97,6.14 14,5 C13.97,3.86 13.58,2.92 12.83,2.17 L12.83,2.17 Z M11,5.38 C10.23,5.38 9.62,4.77 9.62,4 C9.62,3.23 10.23,2.62 11,2.62 C11.77,2.62 12.38,3.23 12.38,4 C12.38,4.77 11.77,5.38 11,5.38 L11,5.38 Z';
var _capitalist$elm_octicons$Octicons$jerseyPath = 'M4.5,6 L4,6.5 L4,11.5 L4.5,12 L6.5,12 L7,11.5 L7,6.5 L6.5,6 L4.5,6 L4.5,6 Z M6,11 L5,11 L5,7 L6,7 L6,11 L6,11 Z M12.27,3.75 C12.05,2.37 11.96,1.12 12,0 L9.02,0 C9.02,0.27 8.89,0.48 8.63,0.69 C8.38,0.89 8,0.99 7.5,0.99 C7,0.99 6.62,0.9 6.37,0.69 C6.14,0.49 6.01,0.27 6.01,0 L3,0 C3.05,1.13 2.97,2.38 2.75,3.75 C2.55,5.13 1.95,5.88 1,6 L1,15 C1.02,15.27 1.11,15.48 1.31,15.69 C1.51,15.9 1.73,15.99 2,16 L13,16 C13.27,15.98 13.48,15.89 13.69,15.69 C13.9,15.49 13.99,15.27 14,15 L14,6 C13.05,5.87 12.47,5.12 12.25,3.75 L12.27,3.75 Z M13,15 L2,15 L2,7 C2.89,6.5 3.48,5.75 3.72,4.75 C3.96,3.75 4.03,2.5 4,1 L5,1 C4.98,1.78 5.16,2.47 5.52,3.06 C5.88,3.64 6.54,3.95 7.52,4 C8.5,3.98 9.16,3.67 9.52,3.06 C9.88,2.47 10.02,1.78 10,1 L11,1 C11.02,2.42 11.13,3.55 11.33,4.38 C11.53,5.19 12.02,6.38 13,7.01 L13,15.01 L13,15 Z M8.5,6 L8,6.5 L8,11.5 L8.5,12 L10.5,12 L11,11.5 L11,6.5 L10.5,6 L8.5,6 L8.5,6 Z M10,11 L9,11 L9,7 L10,7 L10,11 L10,11 Z';
var _capitalist$elm_octicons$Octicons$italicPath = 'M2.81,5 L4.79,5 L3,14 L1,14 L2.81,5 L2.81,5 Z M3.17,2.3 C3.17,1.6 3.75,1 4.5,1 C5.06,1 5.63,1.38 5.63,2.03 C5.63,2.78 5.04,3.33 4.3,3.33 C3.72,3.33 3.17,2.95 3.17,2.3 L3.17,2.3 Z';
var _capitalist$elm_octicons$Octicons$issueReopenedPath = 'M8,9 L6,9 L6,4 L8,4 L8,9 L8,9 Z M6,12 L8,12 L8,10 L6,10 L6,12 L6,12 Z M12.33,10 L10,10 L11.5,11.5 C10.45,12.83 8.83,13.7 7,13.7 C3.86,13.7 1.3,11.14 1.3,8 C1.3,7.66 1.33,7.33 1.39,7 L0.08,7 C0.03,7.33 0,7.66 0,8 C0,11.86 3.14,15 7,15 C9.19,15 11.13,13.98 12.41,12.41 L14,14 L14,10 L12.33,10 L12.33,10 Z M1.67,6 L4,6 L2.5,4.5 C3.55,3.17 5.17,2.3 7,2.3 C10.14,2.3 12.7,4.86 12.7,8 C12.7,8.34 12.67,8.67 12.61,9 L13.92,9 C13.97,8.67 14,8.34 14,8 C14,4.14 10.86,1 7,1 C4.81,1 2.87,2.02 1.59,3.59 L0,2 L0,6 L1.67,6 L1.67,6 Z';
var _capitalist$elm_octicons$Octicons$issueOpenedPath = 'M7,2.3 C10.14,2.3 12.7,4.86 12.7,8 C12.7,11.14 10.14,13.7 7,13.7 C3.86,13.7 1.3,11.14 1.3,8 C1.3,4.86 3.86,2.3 7,2.3 L7,2.3 Z M7,1 C3.14,1 0,4.14 0,8 C0,11.86 3.14,15 7,15 C10.86,15 14,11.86 14,8 C14,4.14 10.86,1 7,1 L7,1 Z M8,4 L6,4 L6,9 L8,9 L8,4 L8,4 Z M8,10 L6,10 L6,12 L8,12 L8,10 L8,10 Z';
var _capitalist$elm_octicons$Octicons$issueClosedPath = 'M7,10 L9,10 L9,12 L7,12 L7,10 L7,10 Z M9,4 L7,4 L7,9 L9,9 L9,4 L9,4 Z M10.5,5.5 L9.5,6.5 L12,9 L16,4.5 L15,3.5 L12,7 L10.5,5.5 L10.5,5.5 Z M8,13.7 C4.86,13.7 2.3,11.14 2.3,8 C2.3,4.86 4.86,2.3 8,2.3 C9.83,2.3 11.45,3.18 12.5,4.5 L13.42,3.58 C12.14,2 10.19,1 8,1 C4.14,1 1,4.14 1,8 C1,11.86 4.14,15 8,15 C11.86,15 15,11.86 15,8 L13.48,9.52 C12.82,11.93 10.62,13.71 8,13.71 L8,13.7 Z';
var _capitalist$elm_octicons$Octicons$infoPath = 'M6.3,5.69 C6.11,5.5 6.02,5.27 6.02,4.99 C6.02,4.71 6.11,4.47 6.3,4.29 C6.49,4.11 6.72,4.01 7,4.01 C7.28,4.01 7.52,4.1 7.7,4.29 C7.88,4.48 7.98,4.71 7.98,4.99 C7.98,5.27 7.89,5.51 7.7,5.69 C7.51,5.87 7.28,5.99 7,5.99 C6.72,5.99 6.48,5.88 6.3,5.69 L6.3,5.69 Z M8,7.99 C7.98,7.74 7.89,7.51 7.69,7.3 C7.49,7.11 7.27,7 7,6.99 L6,6.99 C5.73,7.01 5.52,7.12 5.31,7.3 C5.11,7.5 5.01,7.74 5,7.99 L6,7.99 L6,10.99 C6.02,11.26 6.11,11.49 6.31,11.68 C6.51,11.88 6.73,11.99 7,11.99 L8,11.99 C8.27,11.99 8.48,11.88 8.69,11.68 C8.89,11.49 8.99,11.26 9,10.99 L8,10.99 L8,7.98 L8,7.99 Z M7,2.3 C3.86,2.3 1.3,4.84 1.3,7.98 C1.3,11.12 3.86,13.68 7,13.68 C10.14,13.68 12.7,11.13 12.7,7.98 C12.7,4.83 10.14,2.29 7,2.29 L7,2.3 Z M7,0.98 C10.86,0.98 14,4.12 14,7.98 C14,11.84 10.86,14.98 7,14.98 C3.14,14.98 0,11.86 0,7.98 C0,4.1 3.14,0.98 7,0.98 L7,0.98 Z';
var _capitalist$elm_octicons$Octicons$inboxPath = 'M14,9 L12.87,1.86 C12.79,1.38 12.37,1 11.87,1 L2.13,1 C1.63,1 1.21,1.38 1.13,1.86 L0,9 L0,14 C0,14.55 0.45,15 1,15 L13,15 C13.55,15 14,14.55 14,14 L14,9 L14,9 Z M10.72,9.55 L10.28,10.44 C10.11,10.78 9.76,11 9.37,11 L4.61,11 C4.23,11 3.89,10.78 3.72,10.45 L3.28,9.54 C3.11,9.21 2.76,8.99 2.39,8.99 L1,8.99 L2,1.99 L12,1.99 L13,8.99 L11.62,8.99 C11.23,8.99 10.89,9.21 10.71,9.54 L10.72,9.55 Z';
var _capitalist$elm_octicons$Octicons$hubotPath = 'M3,6 C2.45,6 2,6.45 2,7 L2,9 C2,9.55 2.45,10 3,10 L11,10 C11.55,10 12,9.55 12,9 L12,7 C12,6.45 11.55,6 11,6 L3,6 L3,6 Z M11,7.75 L9.75,9 L8.25,9 L7,7.75 L5.75,9 L4.25,9 L3,7.75 L3,7 L3.75,7 L5,8.25 L6.25,7 L7.75,7 L9,8.25 L10.25,7 L11,7 L11,7.75 L11,7.75 Z M5,11 L9,11 L9,12 L5,12 L5,11 L5,11 Z M7,2 C3.14,2 0,4.91 0,8.5 L0,13 C0,13.55 0.45,14 1,14 L13,14 C13.55,14 14,13.55 14,13 L14,8.5 C14,4.91 10.86,2 7,2 L7,2 Z M13,13 L1,13 L1,8.5 C1,5.41 3.64,2.91 7,2.91 C10.36,2.91 13,5.41 13,8.5 L13,13 L13,13 Z';
var _capitalist$elm_octicons$Octicons$horizontalRulePath = 'M1,7 L3,7 L3,9 L4,9 L4,3 L3,3 L3,6 L1,6 L1,3 L0,3 L0,9 L1,9 L1,7 L1,7 Z M10,9 L10,7 L9,7 L9,9 L10,9 L10,9 Z M10,6 L10,4 L9,4 L9,6 L10,6 L10,6 Z M7,6 L7,4 L9,4 L9,3 L6,3 L6,9 L7,9 L7,7 L9,7 L9,6 L7,6 L7,6 Z M0,13 L10,13 L10,11 L0,11 L0,13 L0,13 Z';
var _capitalist$elm_octicons$Octicons$homePath = 'M16,9 L13,6 L13,2 L11,2 L11,4 L8,1 L0,9 L2,9 L3,14 C3,14.55 3.45,15 4,15 L12,15 C12.55,15 13,14.55 13,14 L14,9 L16,9 L16,9 Z M12,14 L9,14 L9,10 L7,10 L7,14 L4,14 L2.81,7.69 L8,2.5 L13.19,7.69 L12,14 L12,14 Z';
var _capitalist$elm_octicons$Octicons$historyPath = 'M8,13 L6,13 L6,6 L11,6 L11,8 L8,8 L8,13 L8,13 Z M7,1 C4.81,1 2.87,2.02 1.59,3.59 L0,2 L0,6 L4,6 L2.5,4.5 C3.55,3.17 5.17,2.3 7,2.3 C10.14,2.3 12.7,4.86 12.7,8 C12.7,11.14 10.14,13.7 7,13.7 C3.86,13.7 1.3,11.14 1.3,8 C1.3,7.66 1.33,7.33 1.39,7 L0.08,7 C0.03,7.33 0,7.66 0,8 C0,11.86 3.14,15 7,15 C10.86,15 14,11.86 14,8 C14,4.14 10.86,1 7,1 L7,1 Z';
var _capitalist$elm_octicons$Octicons$heartPath = 'M11.2,3 C10.68,2.37 9.95,2.05 9,2 C8.03,2 7.31,2.42 6.8,3 C6.29,3.58 6.02,3.92 6,4 C5.98,3.92 5.72,3.58 5.2,3 C4.68,2.42 4.03,2 3,2 C2.05,2.05 1.31,2.38 0.8,3 C0.28,3.61 0.02,4.28 0,5 C0,5.52 0.09,6.52 0.67,7.67 C1.25,8.82 3.01,10.61 6,13 C8.98,10.61 10.77,8.83 11.34,7.67 C11.91,6.51 12,5.5 12,5 C11.98,4.28 11.72,3.61 11.2,2.98 L11.2,3 Z';
var _capitalist$elm_octicons$Octicons$graphPath = 'M16,14 L16,15 L0,15 L0,0 L1,0 L1,14 L16,14 L16,14 Z M5,13 L3,13 L3,8 L5,8 L5,13 L5,13 Z M9,13 L7,13 L7,3 L9,3 L9,13 L9,13 Z M13,13 L11,13 L11,6 L13,6 L13,13 L13,13 Z';
var _capitalist$elm_octicons$Octicons$grabberPath = 'M8,4 L8,5 L0,5 L0,4 L8,4 L8,4 Z M0,8 L8,8 L8,7 L0,7 L0,8 L0,8 Z M0,11 L8,11 L8,10 L0,10 L0,11 L0,11 Z';
var _capitalist$elm_octicons$Octicons$globePath = 'M7,1 C3.14,1 0,4.14 0,8 C0,11.86 3.14,15 7,15 C7.48,15 7.94,14.95 8.38,14.86 C8.21,14.78 8.18,14.13 8.36,13.77 C8.55,13.36 9.17,12.32 8.56,11.97 C7.95,11.62 8.12,11.47 7.75,11.06 C7.38,10.65 7.53,10.59 7.5,10.48 C7.42,10.14 7.86,9.59 7.89,9.54 C7.91,9.48 7.91,9.27 7.89,9.21 C7.89,9.13 7.62,8.99 7.55,8.98 C7.49,8.98 7.44,9.09 7.35,9.11 C7.26,9.13 6.85,8.86 6.76,8.78 C6.67,8.7 6.62,8.55 6.49,8.44 C6.36,8.31 6.35,8.41 6.16,8.33 C5.97,8.25 5.36,8.02 4.88,7.85 C4.4,7.66 4.36,7.38 4.36,7.19 C4.34,6.99 4.06,6.72 3.94,6.52 C3.8,6.32 3.78,6.05 3.74,6.11 C3.7,6.17 3.99,6.89 3.94,6.92 C3.89,6.94 3.78,6.72 3.64,6.54 C3.5,6.35 3.78,6.45 3.34,5.59 C2.9,4.73 3.48,4.29 3.51,3.84 C3.54,3.39 3.89,4.01 3.7,3.71 C3.51,3.41 3.7,2.82 3.56,2.6 C3.43,2.38 2.68,2.85 2.68,2.85 C2.7,2.63 3.37,2.27 3.84,1.93 C4.31,1.59 4.62,1.87 5,1.98 C5.39,2.11 5.41,2.07 5.28,1.93 C5.15,1.8 5.34,1.76 5.64,1.8 C5.92,1.85 6.02,2.21 6.47,2.16 C6.94,2.13 6.52,2.25 6.58,2.38 C6.64,2.51 6.52,2.49 6.2,2.68 C5.9,2.88 6.22,2.9 6.75,3.29 C7.28,3.68 7.13,3.04 7.06,2.74 C6.99,2.44 7.45,2.68 7.45,2.68 C7.78,2.9 7.72,2.7 7.95,2.76 C8.18,2.82 8.86,3.4 8.86,3.4 C8.03,3.84 8.55,3.88 8.69,3.99 C8.83,4.1 8.41,4.29 8.41,4.29 C8.24,4.12 8.22,4.31 8.11,4.37 C8,4.43 8.09,4.59 8.09,4.59 C7.53,4.68 7.65,5.28 7.67,5.42 C7.67,5.56 7.29,5.78 7.2,6 C7.11,6.2 7.45,6.64 7.26,6.66 C7.07,6.69 6.92,6 5.95,6.25 C5.65,6.33 5.01,6.66 5.36,7.33 C5.72,8.02 6.28,7.14 6.47,7.24 C6.66,7.34 6.41,7.77 6.45,7.79 C6.49,7.81 6.98,7.81 7.01,8.4 C7.04,8.99 7.78,8.93 7.93,8.95 C8.1,8.95 8.63,8.51 8.7,8.5 C8.76,8.47 9.08,8.22 9.73,8.59 C10.39,8.95 10.71,8.9 10.93,9.06 C11.15,9.22 11.01,9.53 11.21,9.64 C11.41,9.75 12.27,9.61 12.49,9.95 C12.71,10.29 11.61,12.04 11.27,12.23 C10.93,12.42 10.79,12.87 10.43,13.15 C10.07,13.43 9.62,13.79 9.16,14.06 C8.75,14.29 8.69,14.72 8.5,14.86 C11.64,14.16 13.98,11.36 13.98,8.02 C13.98,4.16 10.84,1.02 6.98,1.02 L7,1 Z M8.64,7.56 C8.55,7.59 8.36,7.78 7.86,7.48 C7.38,7.18 7.05,7.25 7,7.2 C7,7.2 6.95,7.09 7.17,7.06 C7.61,7.01 8.15,7.47 8.28,7.47 C8.41,7.47 8.47,7.34 8.69,7.42 C8.91,7.5 8.74,7.55 8.64,7.56 L8.64,7.56 Z M6.34,1.7 C6.29,1.67 6.37,1.62 6.43,1.56 C6.46,1.53 6.45,1.45 6.48,1.42 C6.59,1.31 7.09,1.17 7,1.45 C6.89,1.72 6.42,1.75 6.34,1.7 L6.34,1.7 Z M7.57,2.59 C7.38,2.57 6.99,2.54 7.05,2.45 C7.35,2.17 6.96,2.07 6.71,2.07 C6.46,2.05 6.37,1.91 6.49,1.88 C6.61,1.85 7.1,1.9 7.19,1.96 C7.27,2.02 7.71,2.21 7.74,2.34 C7.76,2.47 7.74,2.59 7.57,2.59 L7.57,2.59 Z M9.04,2.54 C8.9,2.63 8.21,2.13 8.09,2.02 C7.53,1.54 7.2,1.71 7.09,1.61 C6.98,1.51 7.01,1.42 7.2,1.27 C7.39,1.12 7.89,1.33 8.2,1.36 C8.5,1.39 8.86,1.63 8.86,1.91 C8.88,2.16 9.19,2.41 9.05,2.54 L9.04,2.54 Z';
var _capitalist$elm_octicons$Octicons$gitPullRequestPath = 'M11,11.28 L11,5 C10.97,4.22 10.66,3.53 10.06,2.94 C9.46,2.35 8.78,2.03 8,2 L7,2 L7,0 L4,3 L7,6 L7,4 L8,4 C8.27,4.02 8.48,4.11 8.69,4.31 C8.9,4.51 8.99,4.73 9,5 L9,11.28 C8.41,11.62 8,12.26 8,13 C8,14.11 8.89,15 10,15 C11.11,15 12,14.11 12,13 C12,12.27 11.59,11.62 11,11.28 L11,11.28 Z M10,14.2 C9.34,14.2 8.8,13.65 8.8,13 C8.8,12.35 9.35,11.8 10,11.8 C10.65,11.8 11.2,12.35 11.2,13 C11.2,13.65 10.65,14.2 10,14.2 L10,14.2 Z M4,3 C4,1.89 3.11,1 2,1 C0.89,1 0,1.89 0,3 C0,3.73 0.41,4.38 1,4.72 L1,11.28 C0.41,11.62 0,12.26 0,13 C0,14.11 0.89,15 2,15 C3.11,15 4,14.11 4,13 C4,12.27 3.59,11.62 3,11.28 L3,4.72 C3.59,4.38 4,3.74 4,3 L4,3 Z M3.2,13 C3.2,13.66 2.65,14.2 2,14.2 C1.35,14.2 0.8,13.65 0.8,13 C0.8,12.35 1.35,11.8 2,11.8 C2.65,11.8 3.2,12.35 3.2,13 L3.2,13 Z M2,4.2 C1.34,4.2 0.8,3.65 0.8,3 C0.8,2.35 1.35,1.8 2,1.8 C2.65,1.8 3.2,2.35 3.2,3 C3.2,3.65 2.65,4.2 2,4.2 L2,4.2 Z';
var _capitalist$elm_octicons$Octicons$gitMergePath = 'M10,7 C9.27,7 8.62,7.41 8.27,8.02 L8.27,8 C7.22,7.98 6,7.64 5.14,6.98 C4.39,6.4 3.64,5.37 3.25,4.54 C3.7,4.18 4,3.62 4,2.99 C4,1.88 3.11,0.99 2,0.99 C0.89,0.99 0,1.89 0,3 C0,3.73 0.41,4.38 1,4.72 L1,11.28 C0.41,11.63 0,12.27 0,13 C0,14.11 0.89,15 2,15 C3.11,15 4,14.11 4,13 C4,12.27 3.59,11.62 3,11.28 L3,7.67 C3.67,8.37 4.44,8.94 5.3,9.36 C6.16,9.78 7.33,9.99 8.27,10 L8.27,9.98 C8.63,10.59 9.27,11 10,11 C11.11,11 12,10.11 12,9 C12,7.89 11.11,7 10,7 L10,7 Z M3.2,13 C3.2,13.66 2.65,14.2 2,14.2 C1.35,14.2 0.8,13.65 0.8,13 C0.8,12.35 1.35,11.8 2,11.8 C2.65,11.8 3.2,12.35 3.2,13 L3.2,13 Z M2,4.2 C1.34,4.2 0.8,3.65 0.8,3 C0.8,2.35 1.35,1.8 2,1.8 C2.65,1.8 3.2,2.35 3.2,3 C3.2,3.65 2.65,4.2 2,4.2 L2,4.2 Z M10,10.2 C9.34,10.2 8.8,9.65 8.8,9 C8.8,8.35 9.35,7.8 10,7.8 C10.65,7.8 11.2,8.35 11.2,9 C11.2,9.65 10.65,10.2 10,10.2 L10,10.2 Z';
var _capitalist$elm_octicons$Octicons$gitComparePath = 'M5,12 L4,12 C3.73,11.98 3.52,11.89 3.31,11.69 C3.1,11.49 3.01,11.27 3,11 L3,4.72 C3.59,4.38 4,3.74 4,3 C4,1.89 3.11,1 2,1 C0.89,1 0,1.89 0,3 C0,3.73 0.41,4.38 1,4.72 L1,11 C1.03,11.78 1.34,12.47 1.94,13.06 C2.54,13.65 3.22,13.97 4,14 L5,14 L5,16 L8,13 L5,10 L5,12 L5,12 Z M2,1.8 C2.66,1.8 3.2,2.35 3.2,3 C3.2,3.65 2.65,4.2 2,4.2 C1.35,4.2 0.8,3.65 0.8,3 C0.8,2.35 1.35,1.8 2,1.8 L2,1.8 Z M13,11.28 L13,5 C12.97,4.22 12.66,3.53 12.06,2.94 C11.46,2.35 10.78,2.03 10,2 L9,2 L9,0 L6,3 L9,6 L9,4 L10,4 C10.27,4.02 10.48,4.11 10.69,4.31 C10.9,4.51 10.99,4.73 11,5 L11,11.28 C10.41,11.62 10,12.26 10,13 C10,14.11 10.89,15 12,15 C13.11,15 14,14.11 14,13 C14,12.27 13.59,11.62 13,11.28 L13,11.28 Z M12,14.2 C11.34,14.2 10.8,13.65 10.8,13 C10.8,12.35 11.35,11.8 12,11.8 C12.65,11.8 13.2,12.35 13.2,13 C13.2,13.65 12.65,14.2 12,14.2 L12,14.2 Z';
var _capitalist$elm_octicons$Octicons$gitCommitPath = 'M10.86,7 C10.41,5.28 8.86,4 7,4 C5.14,4 3.59,5.28 3.14,7 L0,7 L0,9 L3.14,9 C3.59,10.72 5.14,12 7,12 C8.86,12 10.41,10.72 10.86,9 L14,9 L14,7 L10.86,7 L10.86,7 Z M7,10.2 C5.78,10.2 4.8,9.22 4.8,8 C4.8,6.78 5.78,5.8 7,5.8 C8.22,5.8 9.2,6.78 9.2,8 C9.2,9.22 8.22,10.2 7,10.2 L7,10.2 Z';
var _capitalist$elm_octicons$Octicons$gitBranchPath = 'M10,5 C10,3.89 9.11,3 8,3 C6.89,3 6,3.89 6,5 C6,5.73 6.41,6.38 7,6.72 L7,7.02 C6.98,7.54 6.77,8 6.37,8.4 C5.97,8.8 5.51,9.01 4.99,9.03 C4.16,9.05 3.51,9.19 2.99,9.48 L2.99,4.72 C3.58,4.38 3.99,3.74 3.99,3 C3.99,1.89 3.1,1 1.99,1 C0.88,1 0,1.89 0,3 C0,3.73 0.41,4.38 1,4.72 L1,11.28 C0.41,11.63 0,12.27 0,13 C0,14.11 0.89,15 2,15 C3.11,15 4,14.11 4,13 C4,12.47 3.8,12 3.47,11.64 C3.56,11.58 3.95,11.23 4.06,11.17 C4.31,11.06 4.62,11 5,11 C6.05,10.95 6.95,10.55 7.75,9.75 C8.55,8.95 8.95,7.77 9,6.73 L8.98,6.73 C9.59,6.37 10,5.73 10,5 L10,5 Z M2,1.8 C2.66,1.8 3.2,2.35 3.2,3 C3.2,3.65 2.65,4.2 2,4.2 C1.35,4.2 0.8,3.65 0.8,3 C0.8,2.35 1.35,1.8 2,1.8 L2,1.8 Z M2,14.21 C1.34,14.21 0.8,13.66 0.8,13.01 C0.8,12.36 1.35,11.81 2,11.81 C2.65,11.81 3.2,12.36 3.2,13.01 C3.2,13.66 2.65,14.21 2,14.21 L2,14.21 Z M8,6.21 C7.34,6.21 6.8,5.66 6.8,5.01 C6.8,4.36 7.35,3.81 8,3.81 C8.65,3.81 9.2,4.36 9.2,5.01 C9.2,5.66 8.65,6.21 8,6.21 L8,6.21 Z';
var _capitalist$elm_octicons$Octicons$gistPath = 'M7.5,5 L10,7.5 L7.5,10 L6.75,9.25 L8.5,7.5 L6.75,5.75 L7.5,5 L7.5,5 Z M4.5,5 L2,7.5 L4.5,10 L5.25,9.25 L3.5,7.5 L5.25,5.75 L4.5,5 L4.5,5 Z M0,13 L0,2 C0,1.45 0.45,1 1,1 L11,1 C11.55,1 12,1.45 12,2 L12,13 C12,13.55 11.55,14 11,14 L1,14 C0.45,14 0,13.55 0,13 L0,13 Z M1,13 L11,13 L11,2 L1,2 L1,13 L1,13 Z';
var _capitalist$elm_octicons$Octicons$gistSecretPath = 'M8,10.5 L9,14 L5,14 L6,10.5 L5.25,9 L8.75,9 L8,10.5 L8,10.5 Z M10,6 L4,6 L2,7 L12,7 L10,6 L10,6 Z M9,2 L7,3 L5,2 L4,5 L10,5 L9,2 L9,2 Z M13.03,9.75 L10,9 L11,11 L9,14 L12.22,14 C12.67,14 13.08,13.69 13.19,13.25 L13.75,10.97 C13.89,10.44 13.56,9.89 13.03,9.75 L13.03,9.75 Z M4,9 L0.97,9.75 C0.44,9.89 0.11,10.44 0.25,10.97 L0.81,13.25 C0.92,13.69 1.33,14 1.78,14 L5,14 L3,11 L4,9 L4,9 Z';
var _capitalist$elm_octicons$Octicons$giftPath = 'M13,4 L11.62,4 C11.81,3.67 11.95,3.33 11.98,3.09 C12.04,2.42 11.87,1.87 11.46,1.48 C11.1,1.1 10.65,1 10.1,1 L9.99,1 C9.46,1.02 8.88,1.25 8.46,1.58 C8.04,1.91 7.73,2.3 7.49,2.78 C7.26,2.3 6.94,1.9 6.52,1.58 C6.1,1.26 5.52,1 4.99,1 L4.96,1 C4.4,1 3.9,1.09 3.52,1.48 C3.11,1.87 2.94,2.42 3,3.09 C3.03,3.32 3.17,3.67 3.36,4 L1.98,4 C1.43,4 0.98,4.45 0.98,5 L0.98,8 L1.98,8 L1.98,13 C1.98,13.55 2.43,14 2.98,14 L11.98,14 C12.53,14 12.98,13.55 12.98,13 L12.98,8 L13.98,8 L13.98,5 C13.98,4.45 13.53,4 12.98,4 L13,4 Z M8.22,3.12 C8.39,2.76 8.64,2.45 8.97,2.2 C9.27,1.97 9.69,1.81 10.02,1.79 L10.11,1.79 C10.56,1.79 10.77,1.9 10.91,2.04 C11.05,2.18 11.24,2.43 11.21,2.99 C11.16,3.18 10.96,3.6 10.71,3.99 L7.81,3.99 L8.22,3.11 L8.22,3.12 Z M4.09,2.04 C4.22,1.91 4.4,1.79 5,1.79 C5.31,1.79 5.72,1.96 6.03,2.2 C6.36,2.45 6.61,2.75 6.78,3.12 L7.2,4 L4.3,4 C4.05,3.61 3.85,3.19 3.8,3 C3.77,2.44 3.96,2.19 4.1,2.05 L4.09,2.04 Z M7,12.99 L3,12.99 L3,8 L7,8 L7,13 L7,12.99 Z M7,6.99 L2,6.99 L2,5 L7,5 L7,7 L7,6.99 Z M12,12.99 L8,12.99 L8,8 L12,8 L12,13 L12,12.99 Z M13,6.99 L8,6.99 L8,5 L13,5 L13,7 L13,6.99 Z';
var _capitalist$elm_octicons$Octicons$gearPath = 'M14,8.77 L14,7.17 L12.06,6.53 L11.61,5.44 L12.49,3.6 L11.36,2.47 L9.55,3.38 L8.46,2.93 L7.77,1.01 L6.17,1.01 L5.54,2.95 L4.43,3.4 L2.59,2.52 L1.46,3.65 L2.37,5.46 L1.92,6.55 L0,7.23 L0,8.82 L1.94,9.46 L2.39,10.55 L1.51,12.39 L2.64,13.52 L4.45,12.61 L5.54,13.06 L6.23,14.98 L7.82,14.98 L8.45,13.04 L9.56,12.59 L11.4,13.47 L12.53,12.34 L11.61,10.53 L12.08,9.44 L14,8.75 L14,8.77 Z M7,11 C5.34,11 4,9.66 4,8 C4,6.34 5.34,5 7,5 C8.66,5 10,6.34 10,8 C10,9.66 8.66,11 7,11 L7,11 Z';
var _capitalist$elm_octicons$Octicons$foldPath = 'M7,9 L10,12 L8,12 L8,15 L6,15 L6,12 L4,12 L7,9 L7,9 Z M10,3 L8,3 L8,0 L6,0 L6,3 L4,3 L7,6 L10,3 L10,3 Z M14,5 C14,4.45 13.55,4 13,4 L10.5,4 L9.5,5 L12.5,5 L10.5,7 L3.5,7 L1.5,5 L4.5,5 L3.5,4 L1,4 C0.45,4 0,4.45 0,5 L2.5,7.5 L0,10 C0,10.55 0.45,11 1,11 L3.5,11 L4.5,10 L1.5,10 L3.5,8 L10.5,8 L12.5,10 L9.5,10 L10.5,11 L13,11 C13.55,11 14,10.55 14,10 L11.5,7.5 L14,5 L14,5 Z';
var _capitalist$elm_octicons$Octicons$flamePath = 'M5.05,0.31 C5.86,2.48 5.46,3.69 4.53,4.62 C3.55,5.67 1.98,6.45 0.9,7.98 C-0.55,10.03 -0.8,14.51 4.43,15.68 C2.23,14.52 1.76,11.16 4.13,9.07 C3.52,11.1 4.66,12.4 6.07,11.93 C7.46,11.46 8.37,12.46 8.34,13.6 C8.32,14.38 8.03,15.04 7.21,15.41 C10.63,14.82 11.99,11.99 11.99,9.85 C11.99,7.01 9.46,6.63 10.74,4.24 C9.22,4.37 8.71,5.37 8.85,6.99 C8.94,8.07 7.83,8.79 6.99,8.32 C6.32,7.91 6.33,7.13 6.93,6.54 C8.18,5.31 8.68,2.45 5.05,0.32 L5.03,0.3 L5.05,0.31 Z';
var _capitalist$elm_octicons$Octicons$filePath = 'M6,5 L2,5 L2,4 L6,4 L6,5 L6,5 Z M2,8 L9,8 L9,7 L2,7 L2,8 L2,8 Z M2,10 L9,10 L9,9 L2,9 L2,10 L2,10 Z M2,12 L9,12 L9,11 L2,11 L2,12 L2,12 Z M12,4.5 L12,14 C12,14.55 11.55,15 11,15 L1,15 C0.45,15 0,14.55 0,14 L0,2 C0,1.45 0.45,1 1,1 L8.5,1 L12,4.5 L12,4.5 Z M11,5 L8,2 L1,2 L1,14 L11,14 L11,5 L11,5 Z';
var _capitalist$elm_octicons$Octicons$fileZipPath = 'M8.5,1 L1,1 C0.44771525,1 0,1.44771525 0,2 L0,14 C0,14.5522847 0.44771525,15 1,15 L11,15 C11.5522847,15 12,14.5522847 12,14 L12,4.5 L8.5,1 Z M11,14 L1,14 L1,2 L4,2 L4,3 L5,3 L5,2 L8,2 L11,5 L11,14 L11,14 Z M5,4 L5,3 L6,3 L6,4 L5,4 L5,4 Z M4,4 L5,4 L5,5 L4,5 L4,4 L4,4 Z M5,6 L5,5 L6,5 L6,6 L5,6 L5,6 Z M4,6 L5,6 L5,7 L4,7 L4,6 L4,6 Z M5,8 L5,7 L6,7 L6,8 L5,8 L5,8 Z M4,9.28 C3.38491093,9.63510459 3.00428692,10.2897779 3,11 L3,12 L7,12 L7,11 C7,9.8954305 6.1045695,9 5,9 L5,8 L4,8 L4,9.28 L4,9.28 Z M6,10 L6,11 L4,11 L4,10 L6,10 L6,10 Z';
var _capitalist$elm_octicons$Octicons$fileTextPath = 'M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z';
var _capitalist$elm_octicons$Octicons$fileSymlinkFilePath = 'M8.5,1 L1,1 C0.45,1 0,1.45 0,2 L0,14 C0,14.55 0.45,15 1,15 L11,15 C11.55,15 12,14.55 12,14 L12,4.5 L8.5,1 L8.5,1 Z M11,14 L1,14 L1,2 L8,2 L11,5 L11,14 L11,14 Z M6,4.5 L10,7.5 L6,10.5 L6,8.5 C5.02,8.48 4.16,8.72 3.45,9.2 C2.74,9.68 2.26,10.45 2,11.5 C2.02,9.86 2.39,8.62 3.13,7.77 C3.86,6.93 4.82,6.5 6.01,6.5 L6.01,4.5 L6,4.5 Z';
var _capitalist$elm_octicons$Octicons$fileSymlinkDirectoryPath = 'M13,4 L7,4 L7,3 C7,2.34 6.69,2 6,2 L1,2 C0.45,2 0,2.45 0,3 L0,13 C0,13.55 0.45,14 1,14 L13,14 C13.55,14 14,13.55 14,13 L14,5 C14,4.45 13.55,4 13,4 L13,4 Z M1,3 L6,3 L6,4 L1,4 L1,3 L1,3 Z M7,12 L7,10 C6.02,9.98 5.16,10.22 4.45,10.7 C3.74,11.18 3.26,11.95 3,13 C3.02,11.36 3.39,10.12 4.13,9.27 C4.86,8.43 5.82,8 7.01,8 L7.01,6 L11.01,9 L7.01,12 L7,12 Z';
var _capitalist$elm_octicons$Octicons$fileSubmodulePath = 'M10,7 L4,7 L4,14 L13,14 C13.55,14 14,13.55 14,13 L14,8 L10,8 L10,7 L10,7 Z M9,9 L5,9 L5,8 L9,8 L9,9 L9,9 Z M13,4 L7,4 L7,3 C7,2.34 6.69,2 6,2 L1,2 C0.45,2 0,2.45 0,3 L0,13 C0,13.55 0.45,14 1,14 L3,14 L3,7 C3,6.45 3.45,6 4,6 L10,6 C10.55,6 11,6.45 11,7 L14,7 L14,5 C14,4.45 13.55,4 13,4 L13,4 Z M6,4 L1,4 L1,3 L6,3 L6,4 L6,4 Z';
var _capitalist$elm_octicons$Octicons$filePdfPath = 'M8.5,1 L1,1 C0.44771525,1 0,1.44771525 0,2 L0,14 C0,14.5522847 0.44771525,15 1,15 L11,15 C11.5522847,15 12,14.5522847 12,14 L12,4.5 L8.5,1 Z M1,2 L5,2 C4.88021121,2.03682695 4.77292941,2.10604101 4.69,2.2 C4.57596619,2.33544491 4.49698141,2.4968486 4.46,2.67 C4.34406753,3.15093672 4.3136037,3.64851254 4.37,4.14 C4.42970074,4.74889969 4.54348307,5.35127671 4.71,5.94 C4.39913981,6.85020329 4.02832805,7.73881526 3.6,8.6 C3.1,9.6 2.8,10.26 2.69,10.44 C2.45490116,10.527838 2.22458325,10.6279762 2,10.74 C1.63797844,10.9047863 1.30126564,11.1202825 1,11.38 L1,2 L1,2 Z M5.42,6.8 C5.65615226,7.57227694 6.05511596,8.28495569 6.59,8.89 C6.8651023,9.12723152 7.18463148,9.30739159 7.53,9.42 C6.89,9.51 6.3,9.62 5.72,9.75 C5.10224214,9.89929979 4.49707287,10.0965649 3.91,10.34 C3.32292713,10.5834351 4.13,9.9 4.52,9.09 C4.8853939,8.349364 5.18973729,7.58014443 5.43,6.79 L5.43,6.79 L5.42,6.8 Z M11,14 L1.5,14 C1.44352149,14.0065306 1.38647851,14.0065306 1.33,14 C1.60061185,13.9042665 1.84896383,13.7545749 2.06,13.56 C2.76700578,12.8583965 3.36677981,12.0564515 3.84,11.18 C4.15,11.05 4.42,10.95 4.65,10.87 L5.07,10.73 C5.52,10.6 6.01,10.5 6.51,10.4 C7.01,10.3 7.51,10.24 7.99,10.2 C8.43725403,10.4162545 8.9023067,10.5935768 9.38,10.73 C9.78288787,10.8407498 10.1943157,10.9176835 10.61,10.96 L10.99,10.96 L10.99,14 L10.99,14 L11,14 Z M11,9.14 C10.7958695,9.02690387 10.5816018,8.93316173 10.36,8.86 C10.113806,8.8009088 9.86279363,8.76409365 9.61,8.75 C9.19880419,8.75303183 8.78812424,8.77974272 8.38,8.83 C8.0073597,8.68541471 7.66736947,8.46782096 7.38,8.19 C6.78281632,7.51840635 6.34221217,6.72258646 6.09,5.86 C6.20098287,5.19851127 6.26779732,4.53036675 6.29,3.86 C6.30923951,3.61037016 6.30923951,3.35962984 6.29,3.11 C6.35921678,2.80151577 6.28575056,2.47826438 6.09,2.23 C5.92718989,2.07232702 5.70638123,1.9890713 5.48,2 L8,2 L11,5 L11,9.13 L11,9.13 L11,9.14 Z';
var _capitalist$elm_octicons$Octicons$fileMediaPath = 'M6,5 L8,5 L8,7 L6,7 L6,5 L6,5 Z M12,4.5 L12,14 C12,14.55 11.55,15 11,15 L1,15 C0.45,15 0,14.55 0,14 L0,2 C0,1.45 0.45,1 1,1 L8.5,1 L12,4.5 L12,4.5 Z M11,5 L8,2 L1,2 L1,13 L4,8 L6,12 L8,10 L11,13 L11,5 L11,5 Z';
var _capitalist$elm_octicons$Octicons$fileDirectoryPath = 'M13,4 L7,4 L7,3 C7,2.34 6.69,2 6,2 L1,2 C0.45,2 0,2.45 0,3 L0,13 C0,13.55 0.45,14 1,14 L13,14 C13.55,14 14,13.55 14,13 L14,5 C14,4.45 13.55,4 13,4 L13,4 Z M6,4 L1,4 L1,3 L6,3 L6,4 L6,4 Z';
var _capitalist$elm_octicons$Octicons$fileCodePath = 'M8.5,1 L1,1 C0.45,1 0,1.45 0,2 L0,14 C0,14.55 0.45,15 1,15 L11,15 C11.55,15 12,14.55 12,14 L12,4.5 L8.5,1 L8.5,1 Z M11,14 L1,14 L1,2 L8,2 L11,5 L11,14 L11,14 Z M5,6.98 L3.5,8.5 L5,10 L4.5,11 L2,8.5 L4.5,6 L5,6.98 L5,6.98 Z M7.5,6 L10,8.5 L7.5,11 L7,10.02 L8.5,8.5 L7,7 L7.5,6 L7.5,6 Z';
var _capitalist$elm_octicons$Octicons$fileBinaryPath = 'M4,12 L5,12 L5,13 L2,13 L2,12 L3,12 L3,10 L2,10 L2,9 L4,9 L4,12 L4,12 Z M12,4.5 L12,14 C12,14.55 11.55,15 11,15 L1,15 C0.45,15 0,14.55 0,14 L0,2 C0,1.45 0.45,1 1,1 L8.5,1 L12,4.5 L12,4.5 Z M11,5 L8,2 L1,2 L1,14 L11,14 L11,5 L11,5 Z M8,4 L6,4 L6,5 L7,5 L7,7 L6,7 L6,8 L9,8 L9,7 L8,7 L8,4 L8,4 Z M2,4 L5,4 L5,8 L2,8 L2,4 L2,4 Z M3,7 L4,7 L4,5 L3,5 L3,7 L3,7 Z M6,9 L9,9 L9,13 L6,13 L6,9 L6,9 Z M7,12 L8,12 L8,10 L7,10 L7,12 L7,12 Z';
var _capitalist$elm_octicons$Octicons$eyePath = 'M8.06,2 C3,2 0,8 0,8 C0,8 3,14 8.06,14 C13,14 16,8 16,8 C16,8 13,2 8.06,2 L8.06,2 Z M8,12 C5.8,12 4,10.22 4,8 C4,5.8 5.8,4 8,4 C10.22,4 12,5.8 12,8 C12,10.22 10.22,12 8,12 L8,12 Z M10,8 C10,9.11 9.11,10 8,10 C6.89,10 6,9.11 6,8 C6,6.89 6.89,6 8,6 C9.11,6 10,6.89 10,8 L10,8 Z';
var _capitalist$elm_octicons$Octicons$ellipsisPath = 'M11 5H1c-0.55 0-1 0.45-1 1v4c0 0.55 0.45 1 1 1h10c0.55 0 1-0.45 1-1V6c0-0.55-0.45-1-1-1zM4 9H2V7h2v2z m3 0H5V7h2v2z m3 0H8V7h2v2z';
var _capitalist$elm_octicons$Octicons$ellipsesPath = 'M11,5 L1,5 C0.45,5 0,5.45 0,6 L0,10 C0,10.55 0.45,11 1,11 L11,11 C11.55,11 12,10.55 12,10 L12,6 C12,5.45 11.55,5 11,5 L11,5 Z M4,9 L2,9 L2,7 L4,7 L4,9 L4,9 Z M7,9 L5,9 L5,7 L7,7 L7,9 L7,9 Z M10,9 L8,9 L8,7 L10,7 L10,9 L10,9 Z';
var _capitalist$elm_octicons$Octicons$diffPath = 'M6,7 L8,7 L8,8 L6,8 L6,10 L5,10 L5,8 L3,8 L3,7 L5,7 L5,5 L6,5 L6,7 L6,7 Z M3,13 L8,13 L8,12 L3,12 L3,13 L3,13 Z M7.5,2 L11,5.5 L11,15 C11,15.55 10.55,16 10,16 L1,16 C0.45,16 0,15.55 0,15 L0,3 C0,2.45 0.45,2 1,2 L7.5,2 L7.5,2 Z M10,6 L7,3 L1,3 L1,15 L10,15 L10,6 L10,6 Z M8.5,0 L3,0 L3,1 L8,1 L12,5 L12,13 L13,13 L13,4.5 L8.5,0 L8.5,0 Z';
var _capitalist$elm_octicons$Octicons$diffRenamedPath = 'M6,9 L3,9 L3,7 L6,7 L6,4 L11,8 L6,12 L6,9 L6,9 Z M14,2 L14,14 C14,14.55 13.55,15 13,15 L1,15 C0.45,15 0,14.55 0,14 L0,2 C0,1.45 0.45,1 1,1 L13,1 C13.55,1 14,1.45 14,2 L14,2 Z M13,2 L1,2 L1,14 L13,14 L13,2 L13,2 Z';
var _capitalist$elm_octicons$Octicons$diffRemovedPath = 'M13,1 L1,1 C0.45,1 0,1.45 0,2 L0,14 C0,14.55 0.45,15 1,15 L13,15 C13.55,15 14,14.55 14,14 L14,2 C14,1.45 13.55,1 13,1 L13,1 Z M13,14 L1,14 L1,2 L13,2 L13,14 L13,14 Z M11,9 L3,9 L3,7 L11,7 L11,9 L11,9 Z';
var _capitalist$elm_octicons$Octicons$diffModifiedPath = 'M13,1 L1,1 C0.45,1 0,1.45 0,2 L0,14 C0,14.55 0.45,15 1,15 L13,15 C13.55,15 14,14.55 14,14 L14,2 C14,1.45 13.55,1 13,1 L13,1 Z M13,14 L1,14 L1,2 L13,2 L13,14 L13,14 Z M4,8 C4,6.34 5.34,5 7,5 C8.66,5 10,6.34 10,8 C10,9.66 8.66,11 7,11 C5.34,11 4,9.66 4,8 L4,8 Z';
var _capitalist$elm_octicons$Octicons$diffIgnoredPath = 'M13,1 L1,1 C0.45,1 0,1.45 0,2 L0,14 C0,14.55 0.45,15 1,15 L13,15 C13.55,15 14,14.55 14,14 L14,2 C14,1.45 13.55,1 13,1 L13,1 Z M13,14 L1,14 L1,2 L13,2 L13,14 L13,14 Z M4.5,12 L3,12 L3,10.5 L9.5,4 L11,4 L11,5.5 L4.5,12 L4.5,12 Z';
var _capitalist$elm_octicons$Octicons$diffAddedPath = 'M13,1 L1,1 C0.45,1 0,1.45 0,2 L0,14 C0,14.55 0.45,15 1,15 L13,15 C13.55,15 14,14.55 14,14 L14,2 C14,1.45 13.55,1 13,1 L13,1 Z M13,14 L1,14 L1,2 L13,2 L13,14 L13,14 Z M6,9 L3,9 L3,7 L6,7 L6,4 L8,4 L8,7 L11,7 L11,9 L8,9 L8,12 L6,12 L6,9 L6,9 Z';
var _capitalist$elm_octicons$Octicons$deviceMobilePath = 'M9,0 L1,0 C0.45,0 0,0.45 0,1 L0,15 C0,15.55 0.45,16 1,16 L9,16 C9.55,16 10,15.55 10,15 L10,1 C10,0.45 9.55,0 9,0 L9,0 Z M5,15.3 C4.28,15.3 3.7,14.72 3.7,14 C3.7,13.28 4.28,12.7 5,12.7 C5.72,12.7 6.3,13.28 6.3,14 C6.3,14.72 5.72,15.3 5,15.3 L5,15.3 Z M9,12 L1,12 L1,2 L9,2 L9,12 L9,12 Z';
var _capitalist$elm_octicons$Octicons$deviceDesktopPath = 'M15,2 L1,2 C0.45,2 0,2.45 0,3 L0,12 C0,12.55 0.45,13 1,13 L6.34,13 C6.09,13.61 5.48,14.39 4,15 L12,15 C10.52,14.39 9.91,13.61 9.66,13 L15,13 C15.55,13 16,12.55 16,12 L16,3 C16,2.45 15.55,2 15,2 L15,2 Z M15,11 L1,11 L1,3 L15,3 L15,11 L15,11 Z';
var _capitalist$elm_octicons$Octicons$deviceCameraPath = 'M15,3 L7,3 C7,2.45 6.55,2 6,2 L2,2 C1.45,2 1,2.45 1,3 C0.45,3 0,3.45 0,4 L0,13 C0,13.55 0.45,14 1,14 L15,14 C15.55,14 16,13.55 16,13 L16,4 C16,3.45 15.55,3 15,3 L15,3 Z M6,5 L2,5 L2,4 L6,4 L6,5 L6,5 Z M10.5,12 C8.56,12 7,10.44 7,8.5 C7,6.56 8.56,5 10.5,5 C12.44,5 14,6.56 14,8.5 C14,10.44 12.44,12 10.5,12 L10.5,12 Z M13,8.5 C13,9.88 11.87,11 10.5,11 C9.13,11 8,9.87 8,8.5 C8,7.13 9.13,6 10.5,6 C11.87,6 13,7.13 13,8.5 L13,8.5 Z';
var _capitalist$elm_octicons$Octicons$deviceCameraVideoPath = 'M15.2,2.09 L10,5.72 L10,3 C10,2.45 9.55,2 9,2 L1,2 C0.45,2 0,2.45 0,3 L0,12 C0,12.55 0.45,13 1,13 L9,13 C9.55,13 10,12.55 10,12 L10,9.28 L15.2,12.91 C15.53,13.14 16,12.91 16,12.5 L16,2.5 C16,2.09 15.53,1.86 15.2,2.09 L15.2,2.09 Z';
var _capitalist$elm_octicons$Octicons$desktopDownloadPath = 'M4,6 L7,6 L7,0 L9,0 L9,6 L12,6 L8,10 L4,6 L4,6 Z M15,2 L11,2 L11,3 L15,3 L15,11 L1,11 L1,3 L5,3 L5,2 L1,2 C0.45,2 0,2.45 0,3 L0,12 C0,12.55 0.45,13 1,13 L6.34,13 C6.09,13.61 5.48,14.39 4,15 L12,15 C10.52,14.39 9.91,13.61 9.66,13 L15,13 C15.55,13 16,12.55 16,12 L16,3 C16,2.45 15.55,2 15,2 L15,2 Z';
var _capitalist$elm_octicons$Octicons$databasePath = 'M6,15 C2.69,15 0,14.1 0,13 L0,11 C0,10.83 0.09,10.66 0.21,10.5 C0.88,11.36 3.21,12 6,12 C8.79,12 11.12,11.36 11.79,10.5 C11.92,10.66 12,10.83 12,11 L12,13 C12,14.1 9.31,15 6,15 L6,15 Z M6,11 C2.69,11 0,10.1 0,9 L0,7 C0,6.89 0.04,6.79 0.09,6.69 L0.09,6.69 C0.12,6.63 0.16,6.56 0.21,6.5 C0.88,7.36 3.21,8 6,8 C8.79,8 11.12,7.36 11.79,6.5 C11.84,6.56 11.88,6.63 11.91,6.69 L11.91,6.69 C11.96,6.79 12,6.9 12,7 L12,9 C12,10.1 9.31,11 6,11 L6,11 Z M6,7 C2.69,7 0,6.1 0,5 L0,4 L0,3 C0,1.9 2.69,1 6,1 C9.31,1 12,1.9 12,3 L12,4 L12,5 C12,6.1 9.31,7 6,7 L6,7 Z M6,2 C3.79,2 2,2.45 2,3 C2,3.55 3.79,4 6,4 C8.21,4 10,3.55 10,3 C10,2.45 8.21,2 6,2 L6,2 Z';
var _capitalist$elm_octicons$Octicons$dashboardPath = 'M9,5 L8,5 L8,4 L9,4 L9,5 L9,5 Z M13,8 L12,8 L12,9 L13,9 L13,8 L13,8 Z M6,5 L5,5 L5,6 L6,6 L6,5 L6,5 Z M5,8 L4,8 L4,9 L5,9 L5,8 L5,8 Z M16,2.5 L15.5,2 L9,7 C8.94,6.98 8,7 8,7 C7.45,7 7,7.45 7,8 L7,9 C7,9.55 7.45,10 8,10 L9,10 C9.55,10 10,9.55 10,9 L10,8.08 L16,2.5 L16,2.5 Z M14.41,6.59 C14.6,7.2 14.71,7.84 14.71,8.5 C14.71,11.92 11.93,14.7 8.51,14.7 C5.09,14.7 2.3,11.92 2.3,8.5 C2.3,5.08 5.08,2.3 8.5,2.3 C9.7,2.3 10.81,2.64 11.77,3.24 L12.71,2.3 C11.52,1.49 10.07,1 8.51,1 C4.36,1 1,4.36 1,8.5 C1,12.64 4.36,16 8.5,16 C12.64,16 16,12.64 16,8.5 C16,7.47 15.8,6.48 15.41,5.59 L14.41,6.59 L14.41,6.59 Z';
var _capitalist$elm_octicons$Octicons$dashPolygon = '0 7 0 9 8 9 8 7';
var _capitalist$elm_octicons$Octicons$creditCardPath = 'M12,9 L2,9 L2,8 L12,8 L12,9 L12,9 Z M16,3 L16,12 C16,12.55 15.55,13 15,13 L1,13 C0.45,13 0,12.55 0,12 L0,3 C0,2.45 0.45,2 1,2 L15,2 C15.55,2 16,2.45 16,3 L16,3 Z M15,6 L1,6 L1,12 L15,12 L15,6 L15,6 Z M15,3 L1,3 L1,4 L15,4 L15,3 L15,3 Z M6,10 L2,10 L2,11 L6,11 L6,10 L6,10 Z';
var _capitalist$elm_octicons$Octicons$commentPath = 'M14,1 L2,1 C1.45,1 1,1.45 1,2 L1,10 C1,10.55 1.45,11 2,11 L4,11 L4,14.5 L7.5,11 L14,11 C14.55,11 15,10.55 15,10 L15,2 C15,1.45 14.55,1 14,1 L14,1 Z M14,10 L7,10 L5,12 L5,10 L2,10 L2,2 L14,2 L14,10 L14,10 Z';
var _capitalist$elm_octicons$Octicons$commentDiscussionPath = 'M15,1 L6,1 C5.45,1 5,1.45 5,2 L5,4 L1,4 C0.45,4 0,4.45 0,5 L0,11 C0,11.55 0.45,12 1,12 L2,12 L2,15 L5,12 L9,12 C9.55,12 10,11.55 10,11 L10,9 L11,9 L14,12 L14,9 L15,9 C15.55,9 16,8.55 16,8 L16,2 C16,1.45 15.55,1 15,1 L15,1 Z M9,11 L4.5,11 L3,12.5 L3,11 L1,11 L1,5 L5,5 L5,8 C5,8.55 5.45,9 6,9 L9,9 L9,11 L9,11 Z M15,8 L13,8 L13,9.5 L11.5,8 L6,8 L6,2 L15,2 L15,8 L15,8 Z';
var _capitalist$elm_octicons$Octicons$codePath = 'M9.5,3 L8,4.5 L11.5,8 L8,11.5 L9.5,13 L14,8 L9.5,3 L9.5,3 Z M4.5,3 L0,8 L4.5,13 L6,11.5 L2.5,8 L6,4.5 L4.5,3 L4.5,3 Z';
var _capitalist$elm_octicons$Octicons$cloudUploadPath = 'M7,9 L5,9 L8,6 L11,9 L9,9 L9,14 L7,14 L7,9 L7,9 Z M12,5 C12,4.56 11.09,2 7.5,2 C5.08,2 3,3.92 3,6 C1.02,6 0,7.52 0,9 C0,10.53 1,12 3,12 L6,12 L6,10.7 L3,10.7 C1.38,10.7 1.3,9.28 1.3,9 C1.3,8.83 1.35,7.3 3,7.3 L4.3,7.3 L4.3,6 C4.3,4.61 5.86,3.3 7.5,3.3 C10.05,3.3 10.63,4.85 10.7,5.1 L10.7,6.3 L12,6.3 C12.81,6.3 14.7,6.52 14.7,8.5 C14.7,10.59 12.45,10.7 12,10.7 L10,10.7 L10,12 L12,12 C14.08,12 16,10.84 16,8.5 C16,6.06 14.08,5 12,5 L12,5 Z';
var _capitalist$elm_octicons$Octicons$cloudDownloadPath = 'M9,12 L11,12 L8,15 L5,12 L7,12 L7,7 L9,7 L9,12 L9,12 Z M12,4 C12,3.56 11.09,1 7.5,1 C5.08,1 3,2.92 3,5 C1.02,5 0,6.52 0,8 C0,9.53 1,11 3,11 L6,11 L6,9.7 L3,9.7 C1.38,9.7 1.3,8.28 1.3,8 C1.3,7.83 1.35,6.3 3,6.3 L4.3,6.3 L4.3,5 C4.3,3.61 5.86,2.3 7.5,2.3 C10.05,2.3 10.63,3.85 10.7,4.1 L10.7,5.3 L12,5.3 C12.81,5.3 14.7,5.52 14.7,7.5 C14.7,9.59 12.45,9.7 12,9.7 L10,9.7 L10,11 L12,11 C14.08,11 16,9.84 16,7.5 C16,5.06 14.08,4 12,4 L12,4 Z';
var _capitalist$elm_octicons$Octicons$clockPath = 'M8,8 L11,8 L11,10 L7,10 C6.45,10 6,9.55 6,9 L6,4 L8,4 L8,8 L8,8 Z M7,2.3 C10.14,2.3 12.7,4.86 12.7,8 C12.7,11.14 10.14,13.7 7,13.7 C3.86,13.7 1.3,11.14 1.3,8 C1.3,4.86 3.86,2.3 7,2.3 L7,2.3 Z M7,1 C3.14,1 0,4.14 0,8 C0,11.86 3.14,15 7,15 C10.86,15 14,11.86 14,8 C14,4.14 10.86,1 7,1 L7,1 Z';
var _capitalist$elm_octicons$Octicons$clippyPath = 'M2,13 L6,13 L6,14 L2,14 L2,13 L2,13 Z M7,7 L2,7 L2,8 L7,8 L7,7 L7,7 Z M9,10 L9,8 L6,11 L9,14 L9,12 L14,12 L14,10 L9,10 L9,10 Z M4.5,9 L2,9 L2,10 L4.5,10 L4.5,9 L4.5,9 Z M2,12 L4.5,12 L4.5,11 L2,11 L2,12 L2,12 Z M11,13 L12,13 L12,15 C11.98,15.28 11.89,15.52 11.7,15.7 C11.51,15.88 11.28,15.98 11,16 L1,16 C0.45,16 0,15.55 0,15 L0,4 C0,3.45 0.45,3 1,3 L4,3 C4,1.89 4.89,1 6,1 C7.11,1 8,1.89 8,3 L11,3 C11.55,3 12,3.45 12,4 L12,9 L11,9 L11,6 L1,6 L1,15 L11,15 L11,13 L11,13 Z M2,5 L10,5 C10,4.45 9.55,4 9,4 L8,4 C7.45,4 7,3.55 7,3 C7,2.45 6.55,2 6,2 C5.45,2 5,2.45 5,3 C5,3.55 4.55,4 4,4 L3,4 C2.45,4 2,4.45 2,5 L2,5 Z';
var _capitalist$elm_octicons$Octicons$circuitBoardPath = 'M3,5 C3,4.45 3.45,4 4,4 C4.55,4 5,4.45 5,5 C5,5.55 4.55,6 4,6 C3.45,6 3,5.55 3,5 L3,5 Z M11,5 C11,4.45 10.55,4 10,4 C9.45,4 9,4.45 9,5 C9,5.55 9.45,6 10,6 C10.55,6 11,5.55 11,5 L11,5 Z M11,11 C11,10.45 10.55,10 10,10 C9.45,10 9,10.45 9,11 C9,11.55 9.45,12 10,12 C10.55,12 11,11.55 11,11 L11,11 Z M13,1 L5,1 L5,3.17 C5.36,3.36 5.64,3.64 5.83,4 L8.17,4 C8.59,3.22 9.5,2.72 10.51,2.95 C11.26,3.14 11.87,3.75 12.04,4.5 C12.35,5.88 11.32,7.09 9.99,7.09 C9.19,7.09 8.51,6.65 8.16,6 L5.83,6 C5.41,6.8 4.5,7.28 3.49,7.03 C2.76,6.86 2.15,6.25 1.97,5.51 C1.72,4.49 2.2,3.59 3,3.17 L3,1 L1,1 C0.45,1 0,1.45 0,2 L0,14 C0,14.55 0.45,15 1,15 L6,10 L8.17,10 C8.59,9.22 9.5,8.72 10.51,8.95 C11.26,9.14 11.87,9.75 12.04,10.5 C12.35,11.88 11.32,13.09 9.99,13.09 C9.19,13.09 8.51,12.65 8.16,12 L6.99,12 L4,15 L13,15 C13.55,15 14,14.55 14,14 L14,2 C14,1.45 13.55,1 13,1 L13,1 Z';
var _capitalist$elm_octicons$Octicons$circleSlashPath = 'M7,1 C3.14,1 0,4.14 0,8 C0,11.86 3.14,15 7,15 C10.86,15 14,11.86 14,8 C14,4.14 10.86,1 7,1 L7,1 Z M7,2.3 C8.3,2.3 9.5,2.74 10.47,3.47 L2.47,11.47 C1.74,10.5 1.3,9.3 1.3,8 C1.3,4.86 3.86,2.3 7,2.3 L7,2.3 Z M7,13.71 C5.7,13.71 4.5,13.27 3.53,12.54 L11.53,4.54 C12.26,5.51 12.7,6.71 12.7,8.01 C12.7,11.15 10.14,13.71 7,13.71 L7,13.71 Z';
var _capitalist$elm_octicons$Octicons$chevronUpPolygon = '10 10 8.5 11.5 5 7.75 1.5 11.5 0 10 5 5';
var _capitalist$elm_octicons$Octicons$chevronRightPolygon = '7.5 8 2.5 13 1 11.5 4.75 8 1 4.5 2.5 3';
var _capitalist$elm_octicons$Octicons$chevronLeftPolygon = '5.5 3 7 4.5 3.25 8 7 11.5 5.5 13 0.5 8';
var _capitalist$elm_octicons$Octicons$chevronDownPolygon = '5 11 0 6 1.5 4.5 5 8.25 8.5 4.5 10 6';
var _capitalist$elm_octicons$Octicons$checklistPath = 'M16,8.5 L10,14.5 L7,11.5 L8.5,10 L10,11.5 L14.5,7 L16,8.5 L16,8.5 Z M5.7,12.2 L6.5,13 L2,13 C1.45,13 1,12.55 1,12 L1,3 C1,2.45 1.45,2 2,2 L9,2 C9.55,2 10,2.45 10,3 L10,9.5 L9.2,8.7 C8.81,8.31 8.17,8.31 7.78,8.7 L5.7,10.8 C5.31,11.19 5.31,11.82 5.7,12.21 L5.7,12.2 Z M4,4 L9,4 L9,3 L4,3 L4,4 L4,4 Z M4,6 L9,6 L9,5 L4,5 L4,6 L4,6 Z M4,8 L7,8 L7,7 L4,7 L4,8 L4,8 Z M3,9 L2,9 L2,10 L3,10 L3,9 L3,9 Z M3,7 L2,7 L2,8 L3,8 L3,7 L3,7 Z M3,5 L2,5 L2,6 L3,6 L3,5 L3,5 Z M3,3 L2,3 L2,4 L3,4 L3,3 L3,3 Z';
var _capitalist$elm_octicons$Octicons$checkPolygon = '12 5 4 13 0 9 1.5 7.5 4 10 10.5 3.5';
var _capitalist$elm_octicons$Octicons$calendarPath = 'M13,2 L12,2 L12,3.5 C12,3.78 11.78,4 11.5,4 L9.5,4 C9.22,4 9,3.78 9,3.5 L9,2 L6,2 L6,3.5 C6,3.78 5.78,4 5.5,4 L3.5,4 C3.22,4 3,3.78 3,3.5 L3,2 L2,2 C1.45,2 1,2.45 1,3 L1,14 C1,14.55 1.45,15 2,15 L13,15 C13.55,15 14,14.55 14,14 L14,3 C14,2.45 13.55,2 13,2 L13,2 Z M13,14 L2,14 L2,5 L13,5 L13,14 L13,14 Z M5,3 L4,3 L4,1 L5,1 L5,3 L5,3 Z M11,3 L10,3 L10,1 L11,1 L11,3 L11,3 Z M6,7 L5,7 L5,6 L6,6 L6,7 L6,7 Z M8,7 L7,7 L7,6 L8,6 L8,7 L8,7 Z M10,7 L9,7 L9,6 L10,6 L10,7 L10,7 Z M12,7 L11,7 L11,6 L12,6 L12,7 L12,7 Z M4,9 L3,9 L3,8 L4,8 L4,9 L4,9 Z M6,9 L5,9 L5,8 L6,8 L6,9 L6,9 Z M8,9 L7,9 L7,8 L8,8 L8,9 L8,9 Z M10,9 L9,9 L9,8 L10,8 L10,9 L10,9 Z M12,9 L11,9 L11,8 L12,8 L12,9 L12,9 Z M4,11 L3,11 L3,10 L4,10 L4,11 L4,11 Z M6,11 L5,11 L5,10 L6,10 L6,11 L6,11 Z M8,11 L7,11 L7,10 L8,10 L8,11 L8,11 Z M10,11 L9,11 L9,10 L10,10 L10,11 L10,11 Z M12,11 L11,11 L11,10 L12,10 L12,11 L12,11 Z M4,13 L3,13 L3,12 L4,12 L4,13 L4,13 Z M6,13 L5,13 L5,12 L6,12 L6,13 L6,13 Z M8,13 L7,13 L7,12 L8,12 L8,13 L8,13 Z M10,13 L9,13 L9,12 L10,12 L10,13 L10,13 Z';
var _capitalist$elm_octicons$Octicons$bugPath = 'M11,10 L14,10 L14,9 L11,9 L11,8 L14.17,6.97 L13.83,6.03 L11,7 L11,6 C11,5.45 10.55,5 9.99999998,5 L9.99999998,4 C9.99999998,3.52 9.63999998,3.12 9.16999998,3.03 L10.2,2 L12,2 L12,1 L9.79999998,1 L7.79999998,3 L7.20999998,3 L5.19999998,1 L2.99999998,1 L2.99999998,2 L4.79999998,2 L5.82999998,3.03 C5.35999998,3.12 4.99999998,3.51 4.99999998,4 L4.99999998,5 C4.44999998,5 3.99999998,5.45 3.99999998,6 L3.99999998,7 L1.16999998,6.03 L0.829999983,6.97 L3.99999998,8 L3.99999998,9 L0.999999983,9 L0.999999983,10 L3.99999998,10 L3.99999998,11 L0.829999983,12.03 L1.16999998,12.97 L3.99999998,12 L3.99999998,13 C3.99999998,13.55 4.44999998,14 4.99999998,14 L5.99999998,14 L6.99999998,13 L6.99999998,6 L7.99999998,6 L7.99999998,13 L8.99999998,14 L9.99999998,14 C10.55,14 11,13.55 11,13 L11,12 L13.83,12.97 L14.17,12.03 L11,11 L11,10 L11,10 Z M8.99999998,5 L5.99999998,5 L5.99999998,4 L8.99999998,4 L8.99999998,5 L8.99999998,5 Z';
var _capitalist$elm_octicons$Octicons$browserPath = 'M5,3 L6,3 L6,4 L5,4 L5,3 L5,3 Z M3,3 L4,3 L4,4 L3,4 L3,3 L3,3 Z M1,3 L2,3 L2,4 L1,4 L1,3 L1,3 Z M13,13 L1,13 L1,5 L13,5 L13,13 L13,13 Z M13,4 L7,4 L7,3 L13,3 L13,4 L13,4 Z M14,3 C14,2.45 13.55,2 13,2 L1,2 C0.45,2 0,2.45 0,3 L0,13 C0,13.55 0.45,14 1,14 L13,14 C13.55,14 14,13.55 14,13 L14,3 L14,3 Z';
var _capitalist$elm_octicons$Octicons$broadcastPath = 'M9,9 L8,9 C8.55,9 9,8.55 9,8 L9,7 C9,6.45 8.55,6 8,6 L7,6 C6.45,6 6,6.45 6,7 L6,8 C6,8.55 6.45,9 7,9 L6,9 C5.45,9 5,9.45 5,10 L5,12 L6,12 L6,15 C6,15.55 6.45,16 7,16 L8,16 C8.55,16 9,15.55 9,15 L9,12 L10,12 L10,10 C10,9.45 9.55,9 9,9 L9,9 Z M7,7 L8,7 L8,8 L7,8 L7,7 L7,7 Z M9,11 L8,11 L8,15 L7,15 L7,11 L6,11 L6,10 L9,10 L9,11 L9,11 Z M11.09,7.5 C11.09,5.52 9.48,3.91 7.5,3.91 C5.52,3.91 3.91,5.52 3.91,7.5 C3.91,7.78 3.94,8.05 4,8.31 L4,10.29 C3.39,9.52 3,8.56 3,7.49 C3,5.01 5.02,2.99 7.5,2.99 C9.98,2.99 12,5.01 12,7.49 C12,8.55 11.61,9.52 11,10.29 L11,8.31 C11.06,8.04 11.09,7.78 11.09,7.5 L11.09,7.5 Z M15,7.5 C15,10.38 13.37,12.88 11,14.13 L11,13.08 C12.86,11.92 14.09,9.86 14.09,7.5 C14.09,3.86 11.14,0.91 7.5,0.91 C3.86,0.91 0.91,3.86 0.91,7.5 C0.91,9.86 2.14,11.92 4,13.08 L4,14.13 C1.63,12.88 0,10.38 0,7.5 C0,3.36 3.36,0 7.5,0 C11.64,0 15,3.36 15,7.5 L15,7.5 Z';
var _capitalist$elm_octicons$Octicons$briefcasePath = 'M9,4 L9,3 C9,2.45 8.55,2 8,2 L6,2 C5.45,2 5,2.45 5,3 L5,4 L1,4 C0.45,4 0,4.45 0,5 L0,13 C0,13.55 0.45,14 1,14 L13,14 C13.55,14 14,13.55 14,13 L14,5 C14,4.45 13.55,4 13,4 L9,4 L9,4 Z M6,3 L8,3 L8,4 L6,4 L6,3 L6,3 Z M13,9 L8,9 L8,10 L6,10 L6,9 L1,9 L1,5 L2,5 L2,8 L12,8 L12,5 L13,5 L13,9 L13,9 Z';
var _capitalist$elm_octicons$Octicons$bookmarkPath = 'M9,0 L1,0 C0.27,0 0,0.27 0,1 L0,16 L5,12.91 L10,16 L10,1 C10,0.27 9.73,0 9,0 L9,0 Z M8.22,4.25 L6.36,5.61 L7.08,7.77 C7.14,7.99 7.06,8.05 6.88,7.94 L5,6.6 L3.12,7.94 C2.93,8.05 2.87,7.99 2.92,7.77 L3.64,5.61 L1.78,4.25 C1.61,4.09 1.64,4.02 1.87,4.02 L4.17,3.99 L4.87,1.83 L5.12,1.83 L5.82,3.99 L8.12,4.02 C8.35,4.02 8.39,4.1 8.21,4.25 L8.22,4.25 Z';
var _capitalist$elm_octicons$Octicons$bookPath = 'M3,5 L7,5 L7,6 L3,6 L3,5 L3,5 Z M3,8 L7,8 L7,7 L3,7 L3,8 L3,8 Z M3,10 L7,10 L7,9 L3,9 L3,10 L3,10 Z M14,5 L10,5 L10,6 L14,6 L14,5 L14,5 Z M14,7 L10,7 L10,8 L14,8 L14,7 L14,7 Z M14,9 L10,9 L10,10 L14,10 L14,9 L14,9 Z M16,3 L16,12 C16,12.55 15.55,13 15,13 L9.5,13 L8.5,14 L7.5,13 L2,13 C1.45,13 1,12.55 1,12 L1,3 C1,2.45 1.45,2 2,2 L7.5,2 L8.5,3 L9.5,2 L15,2 C15.55,2 16,2.45 16,3 L16,3 Z M8,3.5 L7.5,3 L2,3 L2,12 L8,12 L8,3.5 L8,3.5 Z M15,3 L9.5,3 L9,3.5 L9,12 L15,12 L15,3 L15,3 Z';
var _capitalist$elm_octicons$Octicons$boldPath = 'M1,2 L4.83,2 C7.31,2 9.13,2.75 9.13,4.95 C9.13,6.09 8.5,7.18 7.46,7.56 L7.46,7.62 C8.79,7.92 9.76,8.85 9.76,10.48 C9.76,12.87 7.79,14 5.15,14 L1,14 L1,2 L1,2 Z M4.66,6.95 C6.33,6.95 7.04,6.29 7.04,5.26 C7.04,4.09 6.26,3.65 4.7,3.65 L3.13,3.65 L3.13,6.95 L4.66,6.95 L4.66,6.95 Z M4.93,12.34 C6.7,12.34 7.68,11.7 7.68,10.36 C7.68,9.09 6.73,8.55 4.93,8.55 L3.13,8.55 L3.13,12.35 L4.93,12.35 L4.93,12.34 Z';
var _capitalist$elm_octicons$Octicons$bellPath = 'M14,12 L14,13 L0,13 L0,12 L0.73,11.42 C1.5,10.65 1.54,8.87 1.92,7 C2.69,3.23 6,2 6,2 C6,1.45 6.45,1 7,1 C7.55,1 8,1.45 8,2 C8,2 11.39,3.23 12.16,7 C12.54,8.88 12.58,10.66 13.35,11.42 L14.01,12 L14,12 Z M7,16 C8.11,16 9,15.11 9,14 L5,14 C5,15.11 5.89,16 7,16 L7,16 Z';
var _capitalist$elm_octicons$Octicons$beakerPath = 'M14.3797254,14.59 L10.9997254,7 L10.9997254,3 L11.9997254,3 L11.9997254,2 L2.99972539,2 L2.99972539,3 L3.99972539,3 L3.99972539,7 L0.62972539,14.59 C0.32972539,15.25 0.81972539,16 1.53972539,16 L13.4797254,16 C14.1997254,16 14.6797254,15.25 14.3897254,14.59 L14.3797254,14.59 Z M3.74972539,10 L4.99972539,7 L4.99972539,3 L9.99972539,3 L9.99972539,7 L11.2497254,10 L3.74972539,10 L3.74972539,10 Z M7.99972539,8 L8.99972539,8 L8.99972539,9 L7.99972539,9 L7.99972539,8 L7.99972539,8 Z M6.99972539,7 L5.99972539,7 L5.99972539,6 L6.99972539,6 L6.99972539,7 L6.99972539,7 Z M6.99972539,4 L7.99972539,4 L7.99972539,5 L6.99972539,5 L6.99972539,4 L6.99972539,4 Z M6.99972539,1 L5.99972539,1 L5.99972539,0 L6.99972539,0 L6.99972539,1 L6.99972539,1 Z';
var _capitalist$elm_octicons$Octicons$arrowUpPolygon = '5 3 0 9 3 9 3 13 7 13 7 9 10 9';
var _capitalist$elm_octicons$Octicons$arrowSmallUpPolygon = '3 5 0 9 2 9 2 11 4 11 4 9 6 9';
var _capitalist$elm_octicons$Octicons$arrowSmallRightPolygon = '6 8 2 5 2 7 0 7 0 9 2 9 2 11';
var _capitalist$elm_octicons$Octicons$arrowSmallLeftPolygon = '4 7 4 5 0 8 4 11 4 9 6 9 6 7';
var _capitalist$elm_octicons$Octicons$arrowSmallDownPolygon = '4 7 4 5 2 5 2 7 0 7 3 11 6 7';
var _capitalist$elm_octicons$Octicons$arrowRightPolygon = '10 8 4 3 4 6 0 6 0 10 4 10 4 13';
var _capitalist$elm_octicons$Octicons$arrowLeftPolygon = '6 3 0 8 6 13 6 10 10 10 10 6 6 6';
var _capitalist$elm_octicons$Octicons$arrowDownPolygon = '7 7 7 3 3 3 3 7 0 7 5 13 10 7';
var _capitalist$elm_octicons$Octicons$alertPath = 'M8.865,1.51999998 C8.685,1.20999998 8.355,1.01999998 7.995,1.01999998 C7.635,1.01999998 7.305,1.20999998 7.125,1.51999998 L0.275000001,13.5 C0.0950000006,13.81 0.0950000006,14.19 0.275000001,14.5 C0.465000001,14.81 0.795000001,15 1.145,15 L14.845,15 C15.205,15 15.535,14.81 15.705,14.5 C15.875,14.19 15.885,13.81 15.715,13.5 L8.865,1.51999998 Z M8.995,13 L6.995,13 L6.995,11 L8.995,11 L8.995,13 L8.995,13 Z M8.995,9.99999998 L6.995,9.99999998 L6.995,5.99999998 L8.995,5.99999998 L8.995,9.99999998 L8.995,9.99999998 Z';
var _capitalist$elm_octicons$Octicons$fillRule = F2(
	function (fillRule, options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{fillRule: fillRule});
	});
var _capitalist$elm_octicons$Octicons$height = F2(
	function (height, options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{height: height});
	});
var _capitalist$elm_octicons$Octicons$width = F2(
	function (width, options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{width: width});
	});
var _capitalist$elm_octicons$Octicons$color = F2(
	function (color, options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{color: color});
	});
var _capitalist$elm_octicons$Octicons$margin = F2(
	function (margin, options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{
				margin: _elm_lang$core$Maybe$Just(margin)
			});
	});
var _capitalist$elm_octicons$Octicons$style = F2(
	function (style, options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{
				style: _elm_lang$core$Maybe$Just(style)
			});
	});
var _capitalist$elm_octicons$Octicons$size = F2(
	function (size, options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{width: size, height: size});
	});
var _capitalist$elm_octicons$Octicons$defaultOptions = {color: 'black', width: 16, height: 16, fillRule: 'evenodd', margin: _elm_lang$core$Maybe$Nothing, style: _elm_lang$core$Maybe$Nothing};
var _capitalist$elm_octicons$Octicons$polygonIconWithOptions = F4(
	function (points, viewBox, octiconName, options) {
		return A5(
			_capitalist$elm_octicons$Octicons_Internal$iconSVG,
			viewBox,
			octiconName,
			options,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$polygon,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$points(points),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fillRule(options.fillRule),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(options.color),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			});
	});
var _capitalist$elm_octicons$Octicons$arrowDown = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$arrowDownPolygon, '0 0 10 16', 'arrowDown');
var _capitalist$elm_octicons$Octicons$arrowLeft = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$arrowLeftPolygon, '0 0 10 16', 'arrowLeft');
var _capitalist$elm_octicons$Octicons$arrowRight = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$arrowRightPolygon, '0 0 10 16', 'arrowRight');
var _capitalist$elm_octicons$Octicons$arrowSmallDown = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$arrowSmallDownPolygon, '0 0 6 16', 'arrowSmallDown');
var _capitalist$elm_octicons$Octicons$arrowSmallLeft = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$arrowSmallLeftPolygon, '0 0 6 16', 'arrowSmallLeft');
var _capitalist$elm_octicons$Octicons$arrowSmallRight = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$arrowSmallRightPolygon, '0 0 6 16', 'arrowSmallRight');
var _capitalist$elm_octicons$Octicons$arrowSmallUp = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$arrowSmallUpPolygon, '0 0 6 16', 'arrowSmallUp');
var _capitalist$elm_octicons$Octicons$arrowUp = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$arrowUpPolygon, '0 0 10 16', 'arrowUp');
var _capitalist$elm_octicons$Octicons$check = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$checkPolygon, '0 0 12 16', 'check');
var _capitalist$elm_octicons$Octicons$chevronDown = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$chevronDownPolygon, '0 0 10 16', 'chevronDown');
var _capitalist$elm_octicons$Octicons$chevronLeft = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$chevronLeftPolygon, '0 0 8 16', 'chevronLeft');
var _capitalist$elm_octicons$Octicons$chevronRight = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$chevronRightPolygon, '0 0 8 16', 'chevronRight');
var _capitalist$elm_octicons$Octicons$chevronUp = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$chevronUpPolygon, '0 0 10 16', 'chevronUp');
var _capitalist$elm_octicons$Octicons$dash = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$dashPolygon, '0 0 8 16', 'dash');
var _capitalist$elm_octicons$Octicons$plus = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$plusPolygon, '0 0 12 16', 'plus');
var _capitalist$elm_octicons$Octicons$primitiveSquare = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$primitiveSquarePolygon, '0 0 8 16', 'primitiveSquare');
var _capitalist$elm_octicons$Octicons$pulse = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$pulsePolygon, '0 0 14 16', 'pulse');
var _capitalist$elm_octicons$Octicons$star = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$starPolygon, '0 0 14 16', 'star');
var _capitalist$elm_octicons$Octicons$triangleDown = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$triangleDownPolygon, '0 0 12 16', 'triangleDown');
var _capitalist$elm_octicons$Octicons$triangleLeft = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$triangleLeftPolygon, '0 0 6 16', 'triangleLeft');
var _capitalist$elm_octicons$Octicons$triangleRight = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$triangleRightPolygon, '0 0 6 16', 'triangleRight');
var _capitalist$elm_octicons$Octicons$triangleUp = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$triangleUpPolygon, '0 0 12 16', 'triangleUp');
var _capitalist$elm_octicons$Octicons$x = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$xPolygon, '0 0 12 16', 'x');
var _capitalist$elm_octicons$Octicons$zap = A3(_capitalist$elm_octicons$Octicons$polygonIconWithOptions, _capitalist$elm_octicons$Octicons$zapPolygon, '0 0 10 16', 'zap');
var _capitalist$elm_octicons$Octicons$pathIconWithOptions = F4(
	function (path, viewBox, octiconName, options) {
		return A5(
			_capitalist$elm_octicons$Octicons_Internal$iconSVG,
			viewBox,
			octiconName,
			options,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d(path),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fillRule(options.fillRule),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(options.color),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			});
	});
var _capitalist$elm_octicons$Octicons$alert = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$alertPath, '0 0 16 16', 'alert');
var _capitalist$elm_octicons$Octicons$beaker = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$beakerPath, '0 0 16 16', 'beaker');
var _capitalist$elm_octicons$Octicons$bell = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$bellPath, '0 0 14 16', 'bell');
var _capitalist$elm_octicons$Octicons$bold = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$boldPath, '0 0 10 16', 'bold');
var _capitalist$elm_octicons$Octicons$book = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$bookPath, '0 0 16 16', 'book');
var _capitalist$elm_octicons$Octicons$bookmark = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$bookmarkPath, '0 0 10 16', 'bookmark');
var _capitalist$elm_octicons$Octicons$briefcase = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$briefcasePath, '0 0 14 16', 'briefcase');
var _capitalist$elm_octicons$Octicons$broadcast = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$broadcastPath, '0 0 16 16', 'broadcast');
var _capitalist$elm_octicons$Octicons$browser = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$browserPath, '0 0 14 16', 'browser');
var _capitalist$elm_octicons$Octicons$bug = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$bugPath, '0 0 16 16', 'bug');
var _capitalist$elm_octicons$Octicons$calendar = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$calendarPath, '0 0 14 16', 'calendar');
var _capitalist$elm_octicons$Octicons$checklist = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$checklistPath, '0 0 16 16', 'checklist');
var _capitalist$elm_octicons$Octicons$circleSlash = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$circleSlashPath, '0 0 14 16', 'circleSlash');
var _capitalist$elm_octicons$Octicons$circuitBoard = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$circuitBoardPath, '0 0 14 16', 'circuitBoard');
var _capitalist$elm_octicons$Octicons$clippy = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$clippyPath, '0 0 14 16', 'clippy');
var _capitalist$elm_octicons$Octicons$clock = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$clockPath, '0 0 14 16', 'clock');
var _capitalist$elm_octicons$Octicons$cloudDownload = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$cloudDownloadPath, '0 0 16 16', 'cloudDownload');
var _capitalist$elm_octicons$Octicons$cloudUpload = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$cloudUploadPath, '0 0 16 16', 'cloudUpload');
var _capitalist$elm_octicons$Octicons$code = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$codePath, '0 0 14 16', 'code');
var _capitalist$elm_octicons$Octicons$commentDiscussion = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$commentDiscussionPath, '0 0 16 16', 'commentDiscussion');
var _capitalist$elm_octicons$Octicons$comment = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$commentPath, '0 0 16 16', 'comment');
var _capitalist$elm_octicons$Octicons$creditCard = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$creditCardPath, '0 0 16 16', 'creditCard');
var _capitalist$elm_octicons$Octicons$dashboard = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$dashboardPath, '0 0 16 16', 'dashboard');
var _capitalist$elm_octicons$Octicons$database = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$databasePath, '0 0 12 16', 'database');
var _capitalist$elm_octicons$Octicons$desktopDownload = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$desktopDownloadPath, '0 0 16 16', 'desktopDownload');
var _capitalist$elm_octicons$Octicons$deviceCameraVideo = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$deviceCameraVideoPath, '0 0 16 16', 'deviceCameraVideo');
var _capitalist$elm_octicons$Octicons$deviceCamera = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$deviceCameraPath, '0 0 16 16', 'deviceCamera');
var _capitalist$elm_octicons$Octicons$deviceDesktop = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$deviceDesktopPath, '0 0 16 16', 'deviceDesktop');
var _capitalist$elm_octicons$Octicons$deviceMobile = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$deviceMobilePath, '0 0 10 16', 'deviceMobile');
var _capitalist$elm_octicons$Octicons$diffAdded = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$diffAddedPath, '0 0 14 16', 'diffAdded');
var _capitalist$elm_octicons$Octicons$diffIgnored = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$diffIgnoredPath, '0 0 14 16', 'diffIgnored');
var _capitalist$elm_octicons$Octicons$diffModified = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$diffModifiedPath, '0 0 14 16', 'diffModified');
var _capitalist$elm_octicons$Octicons$diffRemoved = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$diffRemovedPath, '0 0 14 16', 'diffRemoved');
var _capitalist$elm_octicons$Octicons$diffRenamed = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$diffRenamedPath, '0 0 14 16', 'diffRenamed');
var _capitalist$elm_octicons$Octicons$diff = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$diffPath, '0 0 13 16', 'diff');
var _capitalist$elm_octicons$Octicons$ellipses = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$ellipsesPath, '0 0 12 16', 'ellipses');
var _capitalist$elm_octicons$Octicons$ellipsis = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$ellipsisPath, '0 0 12 16', 'ellipsis');
var _capitalist$elm_octicons$Octicons$eye = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$eyePath, '0 0 16 16', 'eye');
var _capitalist$elm_octicons$Octicons$fileBinary = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$fileBinaryPath, '0 0 12 16', 'fileBinary');
var _capitalist$elm_octicons$Octicons$fileCode = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$fileCodePath, '0 0 12 16', 'fileCode');
var _capitalist$elm_octicons$Octicons$fileDirectory = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$fileDirectoryPath, '0 0 14 16', 'fileDirectory');
var _capitalist$elm_octicons$Octicons$fileMedia = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$fileMediaPath, '0 0 12 16', 'fileMedia');
var _capitalist$elm_octicons$Octicons$filePdf = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$filePdfPath, '0 0 12 16', 'filePdf');
var _capitalist$elm_octicons$Octicons$fileSubmodule = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$fileSubmodulePath, '0 0 14 16', 'fileSubmodule');
var _capitalist$elm_octicons$Octicons$fileSymlinkDirectory = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$fileSymlinkDirectoryPath, '0 0 14 16', 'fileSymlinkDirectory');
var _capitalist$elm_octicons$Octicons$fileSymlinkFile = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$fileSymlinkFilePath, '0 0 12 16', 'fileSymlinkFile');
var _capitalist$elm_octicons$Octicons$fileText = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$fileTextPath, '0 0 12 16', 'fileText');
var _capitalist$elm_octicons$Octicons$fileZip = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$fileZipPath, '0 0 12 16', 'fileZip');
var _capitalist$elm_octicons$Octicons$file = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$filePath, '0 0 12 16', 'file');
var _capitalist$elm_octicons$Octicons$flame = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$flamePath, '0 0 12 16', 'flame');
var _capitalist$elm_octicons$Octicons$fold = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$foldPath, '0 0 14 16', 'fold');
var _capitalist$elm_octicons$Octicons$gear = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$gearPath, '0 0 14 16', 'gear');
var _capitalist$elm_octicons$Octicons$gift = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$giftPath, '0 0 14 16', 'gift');
var _capitalist$elm_octicons$Octicons$gistSecret = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$gistSecretPath, '0 0 14 16', 'gistSecret');
var _capitalist$elm_octicons$Octicons$gist = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$gistPath, '0 0 12 16', 'gist');
var _capitalist$elm_octicons$Octicons$gitBranch = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$gitBranchPath, '0 0 10 16', 'gitBranch');
var _capitalist$elm_octicons$Octicons$gitCommit = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$gitCommitPath, '0 0 14 16', 'gitCommit');
var _capitalist$elm_octicons$Octicons$gitCompare = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$gitComparePath, '0 0 14 16', 'gitCompare');
var _capitalist$elm_octicons$Octicons$gitMerge = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$gitMergePath, '0 0 12 16', 'gitMerge');
var _capitalist$elm_octicons$Octicons$gitPullRequest = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$gitPullRequestPath, '0 0 12 16', 'gitPullRequest');
var _capitalist$elm_octicons$Octicons$globe = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$globePath, '0 0 14 16', 'globe');
var _capitalist$elm_octicons$Octicons$grabber = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$grabberPath, '0 0 8 16', 'grabber');
var _capitalist$elm_octicons$Octicons$graph = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$graphPath, '0 0 16 16', 'graph');
var _capitalist$elm_octicons$Octicons$heart = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$heartPath, '0 0 12 16', 'heart');
var _capitalist$elm_octicons$Octicons$history = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$historyPath, '0 0 14 16', 'history');
var _capitalist$elm_octicons$Octicons$home = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$homePath, '0 0 16 16', 'home');
var _capitalist$elm_octicons$Octicons$horizontalRule = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$horizontalRulePath, '0 0 10 16', 'horizontalRule');
var _capitalist$elm_octicons$Octicons$hubot = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$hubotPath, '0 0 14 16', 'hubot');
var _capitalist$elm_octicons$Octicons$inbox = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$inboxPath, '0 0 14 16', 'inbox');
var _capitalist$elm_octicons$Octicons$info = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$infoPath, '0 0 14 16', 'info');
var _capitalist$elm_octicons$Octicons$issueClosed = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$issueClosedPath, '0 0 16 16', 'issueClosed');
var _capitalist$elm_octicons$Octicons$issueOpened = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$issueOpenedPath, '0 0 14 16', 'issueOpened');
var _capitalist$elm_octicons$Octicons$issueReopened = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$issueReopenedPath, '0 0 14 16', 'issueReopened');
var _capitalist$elm_octicons$Octicons$italic = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$italicPath, '0 0 6 16', 'italic');
var _capitalist$elm_octicons$Octicons$jersey = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$jerseyPath, '0 0 14 16', 'jersey');
var _capitalist$elm_octicons$Octicons$key = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$keyPath, '0 0 14 16', 'key');
var _capitalist$elm_octicons$Octicons$keyboard = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$keyboardPath, '0 0 16 16', 'keyboard');
var _capitalist$elm_octicons$Octicons$law = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$lawPath, '0 0 14 16', 'law');
var _capitalist$elm_octicons$Octicons$lightBulb = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$lightBulbPath, '0 0 12 16', 'lightBulb');
var _capitalist$elm_octicons$Octicons$linkExternal = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$linkExternalPath, '0 0 12 16', 'linkExternal');
var _capitalist$elm_octicons$Octicons$link = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$linkPath, '0 0 16 16', 'link');
var _capitalist$elm_octicons$Octicons$listOrdered = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$listOrderedPath, '0 0 12 16', 'listOrdered');
var _capitalist$elm_octicons$Octicons$listUnordered = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$listUnorderedPath, '0 0 12 16', 'listUnordered');
var _capitalist$elm_octicons$Octicons$location = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$locationPath, '0 0 12 16', 'location');
var _capitalist$elm_octicons$Octicons$lock = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$lockPath, '0 0 12 16', 'lock');
var _capitalist$elm_octicons$Octicons$logoGist = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$logoGistPath, '0 0 25 16', 'logoGist');
var _capitalist$elm_octicons$Octicons$logoGithub = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$logoGithubPath, '0 0 45 16', 'logoGithub');
var _capitalist$elm_octicons$Octicons$mailRead = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$mailReadPath, '0 0 14 16', 'mailRead');
var _capitalist$elm_octicons$Octicons$mailReply = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$mailReplyPath, '0 0 12 16', 'mailReply');
var _capitalist$elm_octicons$Octicons$mail = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$mailPath, '0 0 14 16', 'mail');
var _capitalist$elm_octicons$Octicons$markGithub = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$markGithubPath, '0 0 16 16', 'markGithub');
var _capitalist$elm_octicons$Octicons$markTor = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$markTorPath, '0 0 16 16', 'markTor');
var _capitalist$elm_octicons$Octicons$markTwitter = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$markTwitterPath, '0 0 32 32', 'markTwitter');
var _capitalist$elm_octicons$Octicons$markdown = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$markdownPath, '0 0 16 16', 'markdown');
var _capitalist$elm_octicons$Octicons$megaphone = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$megaphonePath, '0 0 16 16', 'megaphone');
var _capitalist$elm_octicons$Octicons$mention = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$mentionPath, '0 0 14 16', 'mention');
var _capitalist$elm_octicons$Octicons$milestone = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$milestonePath, '0 0 14 16', 'milestone');
var _capitalist$elm_octicons$Octicons$mirror = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$mirrorPath, '0 0 16 16', 'mirror');
var _capitalist$elm_octicons$Octicons$mortarBoard = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$mortarBoardPath, '0 0 16 16', 'mortarBoard');
var _capitalist$elm_octicons$Octicons$mute = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$mutePath, '0 0 16 16', 'mute');
var _capitalist$elm_octicons$Octicons$noNewline = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$noNewlinePath, '0 0 16 16', 'noNewline');
var _capitalist$elm_octicons$Octicons$note = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$notePath, '0 0 14 16', 'note');
var _capitalist$elm_octicons$Octicons$octoface = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$octofacePath, '0 0 16 16', 'octoface');
var _capitalist$elm_octicons$Octicons$organization = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$organizationPath, '0 0 16 16', 'organization');
var _capitalist$elm_octicons$Octicons$package = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$packagePath, '0 0 16 16', 'package');
var _capitalist$elm_octicons$Octicons$paintcan = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$paintcanPath, '0 0 12 16', 'paintcan');
var _capitalist$elm_octicons$Octicons$pencil = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$pencilPath, '0 0 14 16', 'pencil');
var _capitalist$elm_octicons$Octicons$person = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$personPath, '0 0 12 16', 'person');
var _capitalist$elm_octicons$Octicons$pin = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$pinPath, '0 0 16 16', 'pin');
var _capitalist$elm_octicons$Octicons$plug = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$plugPath, '0 0 14 16', 'plug');
var _capitalist$elm_octicons$Octicons$plusSmall = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$plusSmallPath, '0 0 7 16', 'plusSmall');
var _capitalist$elm_octicons$Octicons$primitiveDot = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$primitiveDotPath, '0 0 8 16', 'primitiveDot');
var _capitalist$elm_octicons$Octicons$project = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$projectPath, '0 0 15 16', 'project');
var _capitalist$elm_octicons$Octicons$question = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$questionPath, '0 0 14 16', 'question');
var _capitalist$elm_octicons$Octicons$quote = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$quotePath, '0 0 14 16', 'quote');
var _capitalist$elm_octicons$Octicons$radioTower = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$radioTowerPath, '0 0 16 16', 'radioTower');
var _capitalist$elm_octicons$Octicons$reply = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$replyPath, '0 0 14 16', 'reply');
var _capitalist$elm_octicons$Octicons$repoClone = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$repoClonePath, '0 0 16 16', 'repoClone');
var _capitalist$elm_octicons$Octicons$repoForcePush = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$repoForcePushPath, '0 0 12 16', 'repoForcePush');
var _capitalist$elm_octicons$Octicons$repoForked = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$repoForkedPath, '0 0 10 16', 'repoForked');
var _capitalist$elm_octicons$Octicons$repoPull = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$repoPullPath, '0 0 16 16', 'repoPull');
var _capitalist$elm_octicons$Octicons$repoPush = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$repoPushPath, '0 0 12 16', 'repoPush');
var _capitalist$elm_octicons$Octicons$repo = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$repoPath, '0 0 12 16', 'repo');
var _capitalist$elm_octicons$Octicons$rocket = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$rocketPath, '0 0 16 16', 'rocket');
var _capitalist$elm_octicons$Octicons$rss = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$rssPath, '0 0 10 16', 'rss');
var _capitalist$elm_octicons$Octicons$ruby = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$rubyPath, '0 0 16 16', 'ruby');
var _capitalist$elm_octicons$Octicons$screenFull = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$screenFullPath, '0 0 14 16', 'screenFull');
var _capitalist$elm_octicons$Octicons$screenNormal = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$screenNormalPath, '0 0 14 16', 'screenNormal');
var _capitalist$elm_octicons$Octicons$search = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$searchPath, '0 0 16 16', 'search');
var _capitalist$elm_octicons$Octicons$server = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$serverPath, '0 0 12 16', 'server');
var _capitalist$elm_octicons$Octicons$settings = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$settingsPath, '0 0 16 16', 'settings');
var _capitalist$elm_octicons$Octicons$shield = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$shieldPath, '0 0 14 16', 'shield');
var _capitalist$elm_octicons$Octicons$signIn = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$signInPath, '0 0 14 16', 'signIn');
var _capitalist$elm_octicons$Octicons$signOut = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$signOutPath, '0 0 16 16', 'signOut');
var _capitalist$elm_octicons$Octicons$smiley = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$smileyPath, '0 0 16 16', 'smiley');
var _capitalist$elm_octicons$Octicons$squirrel = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$squirrelPath, '0 0 16 16', 'squirrel');
var _capitalist$elm_octicons$Octicons$stop = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$stopPath, '0 0 14 16', 'stop');
var _capitalist$elm_octicons$Octicons$sync = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$syncPath, '0 0 12 16', 'sync');
var _capitalist$elm_octicons$Octicons$tag = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$tagPath, '0 0 14 16', 'tag');
var _capitalist$elm_octicons$Octicons$tasklist = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$tasklistPath, '0 0 16 16', 'tasklist');
var _capitalist$elm_octicons$Octicons$telescope = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$telescopePath, '0 0 14 16', 'telescope');
var _capitalist$elm_octicons$Octicons$terminal = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$terminalPath, '0 0 14 16', 'terminal');
var _capitalist$elm_octicons$Octicons$textSize = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$textSizePath, '0 0 18 16', 'textSize');
var _capitalist$elm_octicons$Octicons$threeBars = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$threeBarsPath, '0 0 12 16', 'threeBars');
var _capitalist$elm_octicons$Octicons$thumbsdown = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$thumbsdownPath, '0 0 16 16', 'thumbsdown');
var _capitalist$elm_octicons$Octicons$thumbsup = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$thumbsupPath, '0 0 16 16', 'thumbsup');
var _capitalist$elm_octicons$Octicons$tools = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$toolsPath, '0 0 16 16', 'tools');
var _capitalist$elm_octicons$Octicons$trashcan = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$trashcanPath, '0 0 12 16', 'trashcan');
var _capitalist$elm_octicons$Octicons$unfold = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$unfoldPath, '0 0 14 16', 'unfold');
var _capitalist$elm_octicons$Octicons$unmute = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$unmutePath, '0 0 16 16', 'unmute');
var _capitalist$elm_octicons$Octicons$unverified = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$unverifiedPath, '0 0 16 16', 'unverified');
var _capitalist$elm_octicons$Octicons$verified = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$verifiedPath, '0 0 16 16', 'verified');
var _capitalist$elm_octicons$Octicons$versions = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$versionsPath, '0 0 14 16', 'versions');
var _capitalist$elm_octicons$Octicons$watch = A3(_capitalist$elm_octicons$Octicons$pathIconWithOptions, _capitalist$elm_octicons$Octicons$watchPath, '0 0 12 16', 'watch');

var _elm_community$maybe_extra$Maybe_Extra$foldrValues = F2(
	function (item, list) {
		var _p0 = item;
		if (_p0.ctor === 'Nothing') {
			return list;
		} else {
			return {ctor: '::', _0: _p0._0, _1: list};
		}
	});
var _elm_community$maybe_extra$Maybe_Extra$values = A2(
	_elm_lang$core$List$foldr,
	_elm_community$maybe_extra$Maybe_Extra$foldrValues,
	{ctor: '[]'});
var _elm_community$maybe_extra$Maybe_Extra$filter = F2(
	function (f, m) {
		var _p1 = A2(_elm_lang$core$Maybe$map, f, m);
		if ((_p1.ctor === 'Just') && (_p1._0 === true)) {
			return m;
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_community$maybe_extra$Maybe_Extra$traverseArray = function (f) {
	var step = F2(
		function (e, acc) {
			var _p2 = f(e);
			if (_p2.ctor === 'Nothing') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				return A2(
					_elm_lang$core$Maybe$map,
					_elm_lang$core$Array$push(_p2._0),
					acc);
			}
		});
	return A2(
		_elm_lang$core$Array$foldl,
		step,
		_elm_lang$core$Maybe$Just(_elm_lang$core$Array$empty));
};
var _elm_community$maybe_extra$Maybe_Extra$combineArray = _elm_community$maybe_extra$Maybe_Extra$traverseArray(_elm_lang$core$Basics$identity);
var _elm_community$maybe_extra$Maybe_Extra$traverse = function (f) {
	var step = F2(
		function (e, acc) {
			var _p3 = f(e);
			if (_p3.ctor === 'Nothing') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				return A2(
					_elm_lang$core$Maybe$map,
					F2(
						function (x, y) {
							return {ctor: '::', _0: x, _1: y};
						})(_p3._0),
					acc);
			}
		});
	return A2(
		_elm_lang$core$List$foldr,
		step,
		_elm_lang$core$Maybe$Just(
			{ctor: '[]'}));
};
var _elm_community$maybe_extra$Maybe_Extra$combine = _elm_community$maybe_extra$Maybe_Extra$traverse(_elm_lang$core$Basics$identity);
var _elm_community$maybe_extra$Maybe_Extra$toArray = function (m) {
	var _p4 = m;
	if (_p4.ctor === 'Nothing') {
		return _elm_lang$core$Array$empty;
	} else {
		return A2(_elm_lang$core$Array$repeat, 1, _p4._0);
	}
};
var _elm_community$maybe_extra$Maybe_Extra$toList = function (m) {
	var _p5 = m;
	if (_p5.ctor === 'Nothing') {
		return {ctor: '[]'};
	} else {
		return {
			ctor: '::',
			_0: _p5._0,
			_1: {ctor: '[]'}
		};
	}
};
var _elm_community$maybe_extra$Maybe_Extra$orElse = F2(
	function (ma, mb) {
		var _p6 = mb;
		if (_p6.ctor === 'Nothing') {
			return ma;
		} else {
			return mb;
		}
	});
var _elm_community$maybe_extra$Maybe_Extra$orElseLazy = F2(
	function (fma, mb) {
		var _p7 = mb;
		if (_p7.ctor === 'Nothing') {
			return fma(
				{ctor: '_Tuple0'});
		} else {
			return mb;
		}
	});
var _elm_community$maybe_extra$Maybe_Extra$orLazy = F2(
	function (ma, fmb) {
		var _p8 = ma;
		if (_p8.ctor === 'Nothing') {
			return fmb(
				{ctor: '_Tuple0'});
		} else {
			return ma;
		}
	});
var _elm_community$maybe_extra$Maybe_Extra$or = F2(
	function (ma, mb) {
		var _p9 = ma;
		if (_p9.ctor === 'Nothing') {
			return mb;
		} else {
			return ma;
		}
	});
var _elm_community$maybe_extra$Maybe_Extra$prev = _elm_lang$core$Maybe$map2(_elm_lang$core$Basics$always);
var _elm_community$maybe_extra$Maybe_Extra$next = _elm_lang$core$Maybe$map2(
	_elm_lang$core$Basics$flip(_elm_lang$core$Basics$always));
var _elm_community$maybe_extra$Maybe_Extra$andMap = _elm_lang$core$Maybe$map2(
	F2(
		function (x, y) {
			return y(x);
		}));
var _elm_community$maybe_extra$Maybe_Extra$unpack = F3(
	function (d, f, m) {
		var _p10 = m;
		if (_p10.ctor === 'Nothing') {
			return d(
				{ctor: '_Tuple0'});
		} else {
			return f(_p10._0);
		}
	});
var _elm_community$maybe_extra$Maybe_Extra$unwrap = F3(
	function (d, f, m) {
		var _p11 = m;
		if (_p11.ctor === 'Nothing') {
			return d;
		} else {
			return f(_p11._0);
		}
	});
var _elm_community$maybe_extra$Maybe_Extra$isJust = function (m) {
	var _p12 = m;
	if (_p12.ctor === 'Nothing') {
		return false;
	} else {
		return true;
	}
};
var _elm_community$maybe_extra$Maybe_Extra$isNothing = function (m) {
	var _p13 = m;
	if (_p13.ctor === 'Nothing') {
		return true;
	} else {
		return false;
	}
};
var _elm_community$maybe_extra$Maybe_Extra$join = function (mx) {
	var _p14 = mx;
	if (_p14.ctor === 'Just') {
		return _p14._0;
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_community$maybe_extra$Maybe_Extra_ops = _elm_community$maybe_extra$Maybe_Extra_ops || {};
_elm_community$maybe_extra$Maybe_Extra_ops['?'] = F2(
	function (mx, x) {
		return A2(_elm_lang$core$Maybe$withDefault, x, mx);
	});

var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$spawnCmd = F2(
	function (router, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Scheduler.spawn(
			A2(
				_elm_lang$core$Task$andThen,
				_elm_lang$core$Platform$sendToApp(router),
				_p1._0));
	});
var _elm_lang$core$Task$fail = _elm_lang$core$Native_Scheduler.fail;
var _elm_lang$core$Task$mapError = F2(
	function (convert, task) {
		return A2(
			_elm_lang$core$Task$onError,
			function (_p2) {
				return _elm_lang$core$Task$fail(
					convert(_p2));
			},
			task);
	});
var _elm_lang$core$Task$succeed = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return _elm_lang$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var _elm_lang$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return _elm_lang$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return _elm_lang$core$Task$succeed(
									A3(func, a, b, c));
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map4 = F5(
	function (func, taskA, taskB, taskC, taskD) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return _elm_lang$core$Task$succeed(
											A4(func, a, b, c, d));
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map5 = F6(
	function (func, taskA, taskB, taskC, taskD, taskE) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return A2(
											_elm_lang$core$Task$andThen,
											function (e) {
												return _elm_lang$core$Task$succeed(
													A5(func, a, b, c, d, e));
											},
											taskE);
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$sequence = function (tasks) {
	var _p3 = tasks;
	if (_p3.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			{ctor: '[]'});
	} else {
		return A3(
			_elm_lang$core$Task$map2,
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			_p3._0,
			_elm_lang$core$Task$sequence(_p3._1));
	}
};
var _elm_lang$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			_elm_lang$core$Task$map,
			function (_p4) {
				return {ctor: '_Tuple0'};
			},
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Task$spawnCmd(router),
					commands)));
	});
var _elm_lang$core$Task$init = _elm_lang$core$Task$succeed(
	{ctor: '_Tuple0'});
var _elm_lang$core$Task$onSelfMsg = F3(
	function (_p7, _p6, _p5) {
		return _elm_lang$core$Task$succeed(
			{ctor: '_Tuple0'});
	});
var _elm_lang$core$Task$command = _elm_lang$core$Native_Platform.leaf('Task');
var _elm_lang$core$Task$Perform = function (a) {
	return {ctor: 'Perform', _0: a};
};
var _elm_lang$core$Task$perform = F2(
	function (toMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(_elm_lang$core$Task$map, toMessage, task)));
	});
var _elm_lang$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(
					_elm_lang$core$Task$onError,
					function (_p8) {
						return _elm_lang$core$Task$succeed(
							resultToMessage(
								_elm_lang$core$Result$Err(_p8)));
					},
					A2(
						_elm_lang$core$Task$andThen,
						function (_p9) {
							return _elm_lang$core$Task$succeed(
								resultToMessage(
									_elm_lang$core$Result$Ok(_p9)));
						},
						task))));
	});
var _elm_lang$core$Task$cmdMap = F2(
	function (tagger, _p10) {
		var _p11 = _p10;
		return _elm_lang$core$Task$Perform(
			A2(_elm_lang$core$Task$map, tagger, _p11._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Task'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Task$init, onEffects: _elm_lang$core$Task$onEffects, onSelfMsg: _elm_lang$core$Task$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Task$cmdMap};

//import Native.Scheduler //

var _elm_lang$core$Native_Time = function() {

var now = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
{
	callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
});

function setInterval_(interval, task)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = setInterval(function() {
			_elm_lang$core$Native_Scheduler.rawSpawn(task);
		}, interval);

		return function() { clearInterval(id); };
	});
}

return {
	now: now,
	setInterval_: F2(setInterval_)
};

}();
var _elm_lang$core$Time$setInterval = _elm_lang$core$Native_Time.setInterval_;
var _elm_lang$core$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		var _p0 = intervals;
		if (_p0.ctor === '[]') {
			return _elm_lang$core$Task$succeed(processes);
		} else {
			var _p1 = _p0._0;
			var spawnRest = function (id) {
				return A3(
					_elm_lang$core$Time$spawnHelp,
					router,
					_p0._1,
					A3(_elm_lang$core$Dict$insert, _p1, id, processes));
			};
			var spawnTimer = _elm_lang$core$Native_Scheduler.spawn(
				A2(
					_elm_lang$core$Time$setInterval,
					_p1,
					A2(_elm_lang$core$Platform$sendToSelf, router, _p1)));
			return A2(_elm_lang$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var _elm_lang$core$Time$addMySub = F2(
	function (_p2, state) {
		var _p3 = _p2;
		var _p6 = _p3._1;
		var _p5 = _p3._0;
		var _p4 = A2(_elm_lang$core$Dict$get, _p5, state);
		if (_p4.ctor === 'Nothing') {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{
					ctor: '::',
					_0: _p6,
					_1: {ctor: '[]'}
				},
				state);
		} else {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{ctor: '::', _0: _p6, _1: _p4._0},
				state);
		}
	});
var _elm_lang$core$Time$inMilliseconds = function (t) {
	return t;
};
var _elm_lang$core$Time$millisecond = 1;
var _elm_lang$core$Time$second = 1000 * _elm_lang$core$Time$millisecond;
var _elm_lang$core$Time$minute = 60 * _elm_lang$core$Time$second;
var _elm_lang$core$Time$hour = 60 * _elm_lang$core$Time$minute;
var _elm_lang$core$Time$inHours = function (t) {
	return t / _elm_lang$core$Time$hour;
};
var _elm_lang$core$Time$inMinutes = function (t) {
	return t / _elm_lang$core$Time$minute;
};
var _elm_lang$core$Time$inSeconds = function (t) {
	return t / _elm_lang$core$Time$second;
};
var _elm_lang$core$Time$now = _elm_lang$core$Native_Time.now;
var _elm_lang$core$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _p7 = A2(_elm_lang$core$Dict$get, interval, state.taggers);
		if (_p7.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var tellTaggers = function (time) {
				return _elm_lang$core$Task$sequence(
					A2(
						_elm_lang$core$List$map,
						function (tagger) {
							return A2(
								_elm_lang$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						_p7._0));
			};
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p8) {
					return _elm_lang$core$Task$succeed(state);
				},
				A2(_elm_lang$core$Task$andThen, tellTaggers, _elm_lang$core$Time$now));
		}
	});
var _elm_lang$core$Time$subscription = _elm_lang$core$Native_Platform.leaf('Time');
var _elm_lang$core$Time$State = F2(
	function (a, b) {
		return {taggers: a, processes: b};
	});
var _elm_lang$core$Time$init = _elm_lang$core$Task$succeed(
	A2(_elm_lang$core$Time$State, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty));
var _elm_lang$core$Time$onEffects = F3(
	function (router, subs, _p9) {
		var _p10 = _p9;
		var rightStep = F3(
			function (_p12, id, _p11) {
				var _p13 = _p11;
				return {
					ctor: '_Tuple3',
					_0: _p13._0,
					_1: _p13._1,
					_2: A2(
						_elm_lang$core$Task$andThen,
						function (_p14) {
							return _p13._2;
						},
						_elm_lang$core$Native_Scheduler.kill(id))
				};
			});
		var bothStep = F4(
			function (interval, taggers, id, _p15) {
				var _p16 = _p15;
				return {
					ctor: '_Tuple3',
					_0: _p16._0,
					_1: A3(_elm_lang$core$Dict$insert, interval, id, _p16._1),
					_2: _p16._2
				};
			});
		var leftStep = F3(
			function (interval, taggers, _p17) {
				var _p18 = _p17;
				return {
					ctor: '_Tuple3',
					_0: {ctor: '::', _0: interval, _1: _p18._0},
					_1: _p18._1,
					_2: _p18._2
				};
			});
		var newTaggers = A3(_elm_lang$core$List$foldl, _elm_lang$core$Time$addMySub, _elm_lang$core$Dict$empty, subs);
		var _p19 = A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			_p10.processes,
			{
				ctor: '_Tuple3',
				_0: {ctor: '[]'},
				_1: _elm_lang$core$Dict$empty,
				_2: _elm_lang$core$Task$succeed(
					{ctor: '_Tuple0'})
			});
		var spawnList = _p19._0;
		var existingDict = _p19._1;
		var killTask = _p19._2;
		return A2(
			_elm_lang$core$Task$andThen,
			function (newProcesses) {
				return _elm_lang$core$Task$succeed(
					A2(_elm_lang$core$Time$State, newTaggers, newProcesses));
			},
			A2(
				_elm_lang$core$Task$andThen,
				function (_p20) {
					return A3(_elm_lang$core$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var _elm_lang$core$Time$Every = F2(
	function (a, b) {
		return {ctor: 'Every', _0: a, _1: b};
	});
var _elm_lang$core$Time$every = F2(
	function (interval, tagger) {
		return _elm_lang$core$Time$subscription(
			A2(_elm_lang$core$Time$Every, interval, tagger));
	});
var _elm_lang$core$Time$subMap = F2(
	function (f, _p21) {
		var _p22 = _p21;
		return A2(
			_elm_lang$core$Time$Every,
			_p22._0,
			function (_p23) {
				return f(
					_p22._1(_p23));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Time'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Time$init, onEffects: _elm_lang$core$Time$onEffects, onSelfMsg: _elm_lang$core$Time$onSelfMsg, tag: 'sub', subMap: _elm_lang$core$Time$subMap};

var _elm_lang$html$Html_Attributes$map = _elm_lang$virtual_dom$VirtualDom$mapProperty;
var _elm_lang$html$Html_Attributes$attribute = _elm_lang$virtual_dom$VirtualDom$attribute;
var _elm_lang$html$Html_Attributes$contextmenu = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'contextmenu', value);
};
var _elm_lang$html$Html_Attributes$draggable = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'draggable', value);
};
var _elm_lang$html$Html_Attributes$itemprop = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'itemprop', value);
};
var _elm_lang$html$Html_Attributes$tabindex = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'tabIndex',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$charset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'charset', value);
};
var _elm_lang$html$Html_Attributes$height = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'height',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$width = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'width',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$formaction = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'formAction', value);
};
var _elm_lang$html$Html_Attributes$list = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'list', value);
};
var _elm_lang$html$Html_Attributes$minlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'minLength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$maxlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'maxlength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$size = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'size',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$form = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'form', value);
};
var _elm_lang$html$Html_Attributes$cols = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'cols',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rows = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rows',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$challenge = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'challenge', value);
};
var _elm_lang$html$Html_Attributes$media = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'media', value);
};
var _elm_lang$html$Html_Attributes$rel = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'rel', value);
};
var _elm_lang$html$Html_Attributes$datetime = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'datetime', value);
};
var _elm_lang$html$Html_Attributes$pubdate = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'pubdate', value);
};
var _elm_lang$html$Html_Attributes$colspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'colspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rowspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rowspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$manifest = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'manifest', value);
};
var _elm_lang$html$Html_Attributes$property = _elm_lang$virtual_dom$VirtualDom$property;
var _elm_lang$html$Html_Attributes$stringProperty = F2(
	function (name, string) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$string(string));
	});
var _elm_lang$html$Html_Attributes$class = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'className', name);
};
var _elm_lang$html$Html_Attributes$id = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'id', name);
};
var _elm_lang$html$Html_Attributes$title = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'title', name);
};
var _elm_lang$html$Html_Attributes$accesskey = function ($char) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'accessKey',
		_elm_lang$core$String$fromChar($char));
};
var _elm_lang$html$Html_Attributes$dir = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dir', value);
};
var _elm_lang$html$Html_Attributes$dropzone = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dropzone', value);
};
var _elm_lang$html$Html_Attributes$lang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'lang', value);
};
var _elm_lang$html$Html_Attributes$content = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'content', value);
};
var _elm_lang$html$Html_Attributes$httpEquiv = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'httpEquiv', value);
};
var _elm_lang$html$Html_Attributes$language = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'language', value);
};
var _elm_lang$html$Html_Attributes$src = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'src', value);
};
var _elm_lang$html$Html_Attributes$alt = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'alt', value);
};
var _elm_lang$html$Html_Attributes$preload = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'preload', value);
};
var _elm_lang$html$Html_Attributes$poster = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'poster', value);
};
var _elm_lang$html$Html_Attributes$kind = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'kind', value);
};
var _elm_lang$html$Html_Attributes$srclang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srclang', value);
};
var _elm_lang$html$Html_Attributes$sandbox = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'sandbox', value);
};
var _elm_lang$html$Html_Attributes$srcdoc = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srcdoc', value);
};
var _elm_lang$html$Html_Attributes$type_ = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'type', value);
};
var _elm_lang$html$Html_Attributes$value = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'value', value);
};
var _elm_lang$html$Html_Attributes$defaultValue = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'defaultValue', value);
};
var _elm_lang$html$Html_Attributes$placeholder = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'placeholder', value);
};
var _elm_lang$html$Html_Attributes$accept = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'accept', value);
};
var _elm_lang$html$Html_Attributes$acceptCharset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'acceptCharset', value);
};
var _elm_lang$html$Html_Attributes$action = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'action', value);
};
var _elm_lang$html$Html_Attributes$autocomplete = function (bool) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var _elm_lang$html$Html_Attributes$enctype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'enctype', value);
};
var _elm_lang$html$Html_Attributes$method = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'method', value);
};
var _elm_lang$html$Html_Attributes$name = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'name', value);
};
var _elm_lang$html$Html_Attributes$pattern = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'pattern', value);
};
var _elm_lang$html$Html_Attributes$for = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'htmlFor', value);
};
var _elm_lang$html$Html_Attributes$max = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'max', value);
};
var _elm_lang$html$Html_Attributes$min = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'min', value);
};
var _elm_lang$html$Html_Attributes$step = function (n) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'step', n);
};
var _elm_lang$html$Html_Attributes$wrap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'wrap', value);
};
var _elm_lang$html$Html_Attributes$usemap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'useMap', value);
};
var _elm_lang$html$Html_Attributes$shape = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'shape', value);
};
var _elm_lang$html$Html_Attributes$coords = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'coords', value);
};
var _elm_lang$html$Html_Attributes$keytype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'keytype', value);
};
var _elm_lang$html$Html_Attributes$align = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'align', value);
};
var _elm_lang$html$Html_Attributes$cite = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'cite', value);
};
var _elm_lang$html$Html_Attributes$href = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'href', value);
};
var _elm_lang$html$Html_Attributes$target = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'target', value);
};
var _elm_lang$html$Html_Attributes$downloadAs = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'download', value);
};
var _elm_lang$html$Html_Attributes$hreflang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'hreflang', value);
};
var _elm_lang$html$Html_Attributes$ping = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'ping', value);
};
var _elm_lang$html$Html_Attributes$start = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'start',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$headers = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'headers', value);
};
var _elm_lang$html$Html_Attributes$scope = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'scope', value);
};
var _elm_lang$html$Html_Attributes$boolProperty = F2(
	function (name, bool) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$bool(bool));
	});
var _elm_lang$html$Html_Attributes$hidden = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'hidden', bool);
};
var _elm_lang$html$Html_Attributes$contenteditable = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'contentEditable', bool);
};
var _elm_lang$html$Html_Attributes$spellcheck = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'spellcheck', bool);
};
var _elm_lang$html$Html_Attributes$async = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'async', bool);
};
var _elm_lang$html$Html_Attributes$defer = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'defer', bool);
};
var _elm_lang$html$Html_Attributes$scoped = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'scoped', bool);
};
var _elm_lang$html$Html_Attributes$autoplay = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autoplay', bool);
};
var _elm_lang$html$Html_Attributes$controls = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'controls', bool);
};
var _elm_lang$html$Html_Attributes$loop = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'loop', bool);
};
var _elm_lang$html$Html_Attributes$default = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'default', bool);
};
var _elm_lang$html$Html_Attributes$seamless = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'seamless', bool);
};
var _elm_lang$html$Html_Attributes$checked = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'checked', bool);
};
var _elm_lang$html$Html_Attributes$selected = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'selected', bool);
};
var _elm_lang$html$Html_Attributes$autofocus = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autofocus', bool);
};
var _elm_lang$html$Html_Attributes$disabled = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'disabled', bool);
};
var _elm_lang$html$Html_Attributes$multiple = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'multiple', bool);
};
var _elm_lang$html$Html_Attributes$novalidate = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'noValidate', bool);
};
var _elm_lang$html$Html_Attributes$readonly = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'readOnly', bool);
};
var _elm_lang$html$Html_Attributes$required = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'required', bool);
};
var _elm_lang$html$Html_Attributes$ismap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'isMap', value);
};
var _elm_lang$html$Html_Attributes$download = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'download', bool);
};
var _elm_lang$html$Html_Attributes$reversed = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'reversed', bool);
};
var _elm_lang$html$Html_Attributes$classList = function (list) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$first,
				A2(_elm_lang$core$List$filter, _elm_lang$core$Tuple$second, list))));
};
var _elm_lang$html$Html_Attributes$style = _elm_lang$virtual_dom$VirtualDom$style;

var _elm_lang$html$Html_Events$keyCode = A2(_elm_lang$core$Json_Decode$field, 'keyCode', _elm_lang$core$Json_Decode$int);
var _elm_lang$html$Html_Events$targetChecked = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'checked',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$bool);
var _elm_lang$html$Html_Events$targetValue = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'value',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$string);
var _elm_lang$html$Html_Events$defaultOptions = _elm_lang$virtual_dom$VirtualDom$defaultOptions;
var _elm_lang$html$Html_Events$onWithOptions = _elm_lang$virtual_dom$VirtualDom$onWithOptions;
var _elm_lang$html$Html_Events$on = _elm_lang$virtual_dom$VirtualDom$on;
var _elm_lang$html$Html_Events$onFocus = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'focus',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onBlur = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'blur',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onSubmitOptions = _elm_lang$core$Native_Utils.update(
	_elm_lang$html$Html_Events$defaultOptions,
	{preventDefault: true});
var _elm_lang$html$Html_Events$onSubmit = function (msg) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'submit',
		_elm_lang$html$Html_Events$onSubmitOptions,
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onCheck = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'change',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetChecked));
};
var _elm_lang$html$Html_Events$onInput = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetValue));
};
var _elm_lang$html$Html_Events$onMouseOut = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseout',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseOver = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseover',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseLeave = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseEnter = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseenter',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseUp = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseup',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseDown = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mousedown',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onDoubleClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'dblclick',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});

var _user$project$Main$withSimonPosition = F3(
	function (x, y, beat) {
		return _elm_lang$core$Native_Utils.update(
			beat,
			{
				simonPosition: {ctor: '_Tuple2', _0: x, _1: y}
			});
	});
var _user$project$Main$withPlayerPosition = F2(
	function (playerPosition, beat) {
		return _elm_lang$core$Native_Utils.update(
			beat,
			{playerPosition: playerPosition});
	});
var _user$project$Main$withCanDrinkBeer = function (beat) {
	return _elm_lang$core$Native_Utils.update(
		beat,
		{canDrinkBeer: true});
};
var _user$project$Main$withCanUsePhone = function (beat) {
	return _elm_lang$core$Native_Utils.update(
		beat,
		{canUsePhone: true});
};
var _user$project$Main$withTimeUntil = F3(
	function (time, next, beat) {
		return _elm_lang$core$Native_Utils.update(
			beat,
			{
				timeUntil: _elm_lang$core$Maybe$Just(
					{ctor: '_Tuple2', _0: time, _1: next})
			});
	});
var _user$project$Main$withActions = F2(
	function (actions, beat) {
		return _elm_lang$core$Native_Utils.update(
			beat,
			{actions: actions});
	});
var _user$project$Main$withDescription = F2(
	function (description, beat) {
		return _elm_lang$core$Native_Utils.update(
			beat,
			{description: description});
	});
var _user$project$Main$buttonStyle = {
	ctor: '::',
	_0: {ctor: '_Tuple2', _0: 'background', _1: 'rgba(255, 255, 255, .1)'},
	_1: {
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: 'padding', _1: '1.8vh 2vw 2vh'},
		_1: {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: 'border-radius', _1: '4px'},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'font-size', _1: '3vh'},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'line-height', _1: '1'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'cursor', _1: 'pointer'},
						_1: {ctor: '[]'}
					}
				}
			}
		}
	}
};
var _user$project$Main$viewPartyLights = function (time) {
	var blueOpacity = _elm_lang$core$Native_Utils.eq(
		A2(
			_elm_lang$core$Basics_ops['%'],
			_elm_lang$core$Basics$floor(time),
			2),
		0) ? '0.1' : '0';
	var blueLight = A2(
		_elm_lang$svg$Svg$polygon,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$points('96,-20 50,100 88,100'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$fill(
					A2(
						_elm_lang$core$Basics_ops['++'],
						'rgba(165, 215, 255, ',
						A2(_elm_lang$core$Basics_ops['++'], blueOpacity, ')'))),
				_1: {ctor: '[]'}
			}
		},
		{ctor: '[]'});
	var greenOpacity = _elm_lang$core$Native_Utils.eq(
		A2(
			_elm_lang$core$Basics_ops['%'],
			_elm_lang$core$Basics$floor(time),
			3),
		0) ? '0.1' : '0';
	var greenLight = A2(
		_elm_lang$svg$Svg$polygon,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$points('60,-20 66,100 108,100'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$fill(
					A2(
						_elm_lang$core$Basics_ops['++'],
						'rgba(183, 255, 165, ',
						A2(_elm_lang$core$Basics_ops['++'], greenOpacity, ')'))),
				_1: {ctor: '[]'}
			}
		},
		{ctor: '[]'});
	var redOpacity = (_elm_lang$core$Native_Utils.cmp(
		A2(
			_elm_lang$core$Basics_ops['%'],
			_elm_lang$core$Basics$floor(time),
			5),
		2) < 0) ? '0.1' : '0';
	var redLight = A2(
		_elm_lang$svg$Svg$polygon,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$points('78,-20 58,100 98,100'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$fill(
					A2(
						_elm_lang$core$Basics_ops['++'],
						'rgba(255, 0, 0, ',
						A2(_elm_lang$core$Basics_ops['++'], redOpacity, ')'))),
				_1: {ctor: '[]'}
			}
		},
		{ctor: '[]'});
	return A2(
		_elm_lang$svg$Svg$svg,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 100 100'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width('100vw'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height('100vh'),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$style(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'position', _1: 'absolute'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'top', _1: '0'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'left', _1: '0'},
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {ctor: '[]'}
					}
				}
			}
		},
		{
			ctor: '::',
			_0: redLight,
			_1: {
				ctor: '::',
				_0: greenLight,
				_1: {
					ctor: '::',
					_0: blueLight,
					_1: {ctor: '[]'}
				}
			}
		});
};
var _user$project$Main$viewPerson = F2(
	function (jiggle, styles) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					A2(
						_elm_lang$core$Basics_ops['++'],
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'position', _1: 'absolute'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'height', _1: '25vh'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'width', _1: '8vw'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'background', _1: '#666'},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'transition', _1: 'left 1s linear, bottom 0.2s linear'},
											_1: {ctor: '[]'}
										}
									}
								}
							}
						},
						styles)),
				_1: {ctor: '[]'}
			},
			{ctor: '[]'});
	});
var _user$project$Main$viewBackgroundPeople = A2(
	_elm_lang$html$Html$div,
	{ctor: '[]'},
	{
		ctor: '::',
		_0: A2(
			_user$project$Main$viewPerson,
			0.2,
			{
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'bottom', _1: '8vh'},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'left', _1: '-3vw'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'background', _1: '#444'},
						_1: {ctor: '[]'}
					}
				}
			}),
		_1: {
			ctor: '::',
			_0: A2(
				_user$project$Main$viewPerson,
				0.2,
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'bottom', _1: '5vh'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'left', _1: '-6vw'},
						_1: {ctor: '[]'}
					}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_user$project$Main$viewPerson,
					0.1,
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'bottom', _1: '10vh'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'left', _1: '19vw'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'background', _1: '#555'},
								_1: {ctor: '[]'}
							}
						}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_user$project$Main$viewPerson,
						0.2,
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'bottom', _1: '12vh'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'left', _1: '10vw'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'background', _1: '#444'},
									_1: {ctor: '[]'}
								}
							}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_user$project$Main$viewPerson,
							0.1,
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'bottom', _1: '6vh'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'left', _1: '14vw'},
									_1: {ctor: '[]'}
								}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_user$project$Main$viewPerson,
								0.1,
								{
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'bottom', _1: '1vh'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'left', _1: '38vw'},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'background', _1: '#444'},
											_1: {ctor: '[]'}
										}
									}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_user$project$Main$viewPerson,
									0.2,
									{
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'bottom', _1: '-1vh'},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'left', _1: '28vw'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'background', _1: '#555'},
												_1: {ctor: '[]'}
											}
										}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_user$project$Main$viewPerson,
										0.1,
										{
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'bottom', _1: '-3vh'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'left', _1: '30vw'},
												_1: {ctor: '[]'}
											}
										}),
									_1: {
										ctor: '::',
										_0: A2(
											_user$project$Main$viewPerson,
											0.2,
											{
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'bottom', _1: '16vh'},
												_1: {
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'left', _1: '88vw'},
													_1: {
														ctor: '::',
														_0: {ctor: '_Tuple2', _0: 'background', _1: '#222'},
														_1: {ctor: '[]'}
													}
												}
											}),
										_1: {
											ctor: '::',
											_0: A2(
												_user$project$Main$viewPerson,
												0.1,
												{
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'bottom', _1: '14vh'},
													_1: {
														ctor: '::',
														_0: {ctor: '_Tuple2', _0: 'left', _1: '92vw'},
														_1: {
															ctor: '::',
															_0: {ctor: '_Tuple2', _0: 'background', _1: '#333'},
															_1: {ctor: '[]'}
														}
													}
												}),
											_1: {
												ctor: '::',
												_0: A2(
													_user$project$Main$viewPerson,
													0.1,
													{
														ctor: '::',
														_0: {ctor: '_Tuple2', _0: 'bottom', _1: '7vh'},
														_1: {
															ctor: '::',
															_0: {ctor: '_Tuple2', _0: 'left', _1: '81vw'},
															_1: {
																ctor: '::',
																_0: {ctor: '_Tuple2', _0: 'background', _1: '#444'},
																_1: {ctor: '[]'}
															}
														}
													}),
												_1: {
													ctor: '::',
													_0: A2(
														_user$project$Main$viewPerson,
														0.2,
														{
															ctor: '::',
															_0: {ctor: '_Tuple2', _0: 'bottom', _1: '4vh'},
															_1: {
																ctor: '::',
																_0: {ctor: '_Tuple2', _0: 'left', _1: '87vw'},
																_1: {
																	ctor: '::',
																	_0: {ctor: '_Tuple2', _0: 'background', _1: '#555'},
																	_1: {ctor: '[]'}
																}
															}
														}),
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	});
var _user$project$Main$viewPolly = function (storyBeat) {
	return A2(
		_user$project$Main$viewPerson,
		0.9,
		{
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: 'bottom', _1: '12vh'},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'left', _1: '69vw'},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'background', _1: '#9C31CC'},
					_1: {ctor: '[]'}
				}
			}
		});
};
var _user$project$Main$viewMehmet = function (storyBeat) {
	return A2(
		_user$project$Main$viewPerson,
		0.4,
		{
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: 'bottom', _1: '7vh'},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'left', _1: '62vw'},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'background', _1: '#B44A3F'},
					_1: {ctor: '[]'}
				}
			}
		});
};
var _user$project$Main$viewAnna = function (storyBeat) {
	return A2(
		_user$project$Main$viewPerson,
		0.3,
		{
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: 'bottom', _1: '13vh'},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'left', _1: '56vw'},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'background', _1: '#B8B442'},
					_1: {ctor: '[]'}
				}
			}
		});
};
var _user$project$Main$viewSimon = function (storyBeat) {
	var _p0 = storyBeat.simonPosition;
	var x = _p0._0;
	var y = _p0._1;
	return A2(
		_user$project$Main$viewPerson,
		0.8,
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'bottom',
				_1: A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(y),
					'vh')
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'left',
					_1: A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(x),
						'vw')
				},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'background', _1: '#42B859'},
					_1: {ctor: '[]'}
				}
			}
		});
};
var _user$project$Main$viewDrunkenness = function (drunkenness) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'Drunkenness ',
					_elm_lang$core$Basics$toString(drunkenness))),
			_1: {ctor: '[]'}
		});
};
var _user$project$Main$viewPhoneMessageIndicator = A2(
	_elm_lang$html$Html$div,
	{
		ctor: '::',
		_0: _elm_lang$html$Html_Attributes$style(
			{
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'position', _1: 'absolute'},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'top', _1: '3.1vh'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'right', _1: '18vw'},
						_1: {ctor: '[]'}
					}
				}
			}),
		_1: {ctor: '[]'}
	},
	{
		ctor: '::',
		_0: _capitalist$elm_octicons$Octicons$mail(
			A2(
				_capitalist$elm_octicons$Octicons$size,
				36,
				A2(_capitalist$elm_octicons$Octicons$color, 'white', _capitalist$elm_octicons$Octicons$defaultOptions))),
		_1: {ctor: '[]'}
	});
var _user$project$Main$viewPhoneBattery = function (phoneBattery) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'position', _1: 'absolute'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'top', _1: '3vh'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'right', _1: '2vw'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'width', _1: '8vw'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'padding', _1: '2px'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'border', _1: '2px solid #ffffff'},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'border-radius', _1: '6px'},
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					}
				}),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'background', _1: '#ffffff'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'border-radius', _1: '3px'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'height', _1: '4vh'},
									_1: {
										ctor: '::',
										_0: {
											ctor: '_Tuple2',
											_0: 'width',
											_1: A2(
												_elm_lang$core$Basics_ops['++'],
												_elm_lang$core$Basics$toString(phoneBattery),
												'%')
										},
										_1: {ctor: '[]'}
									}
								}
							}
						}),
					_1: {ctor: '[]'}
				},
				{ctor: '[]'}),
			_1: {ctor: '[]'}
		});
};
var _user$project$Main$viewConfidenceMeter = function (confidence) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'Confidence ',
					_elm_lang$core$Basics$toString(confidence))),
			_1: {ctor: '[]'}
		});
};
var _user$project$Main$viewEnergyMeter = function (energy) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'Energy ',
					_elm_lang$core$Basics$toString(energy))),
			_1: {ctor: '[]'}
		});
};
var _user$project$Main$maxEnergy = 500;
var _user$project$Main$floorHeight = function (energy) {
	return 56 - ((56 - 33) * (_elm_lang$core$Basics$toFloat(energy) / _elm_lang$core$Basics$toFloat(_user$project$Main$maxEnergy)));
};
var _user$project$Main$viewFloor = function (energy) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'background',
						_1: A2(
							_elm_lang$core$Basics_ops['++'],
							'linear-gradient(135deg, rgba(0,0,0,.2) 25%, transparent 25%) -25px 0, ',
							A2(
								_elm_lang$core$Basics_ops['++'],
								'linear-gradient(225deg, rgba(0,0,0,.2) 25%, transparent 25%) -25px 0, ',
								A2(_elm_lang$core$Basics_ops['++'], 'linear-gradient(315deg, rgba(0,0,0,.2) 25%, transparent 25%), ', 'linear-gradient(45deg, rgba(0,0,0,.2) 25%, transparent 25%)')))
					},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'background-size', _1: '50px 50px'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'background-color', _1: 'rgba(0,0,0,0.2)'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'position', _1: 'absolute'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'bottom', _1: '0'},
									_1: {
										ctor: '::',
										_0: {
											ctor: '_Tuple2',
											_0: 'height',
											_1: A2(
												_elm_lang$core$Basics_ops['++'],
												_elm_lang$core$Basics$toString(
													_user$project$Main$floorHeight(energy)),
												'vh')
										},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'width', _1: '100%'},
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					}
				}),
			_1: {ctor: '[]'}
		},
		{ctor: '[]'});
};
var _user$project$Main$viewPlayer = F2(
	function (energy, storyBeat) {
		return A2(
			_user$project$Main$viewPerson,
			0,
			{
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'bottom',
					_1: A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(
							A2(
								F2(
									function (x, y) {
										return x + y;
									}),
								-3,
								_user$project$Main$floorHeight(energy))),
						'vh')
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'left',
						_1: A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(storyBeat.playerPosition),
							'vw')
					},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'background', _1: '#000000'},
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _user$project$Main$hourFinish = 26;
var _user$project$Main$hourStart = 22;
var _user$project$Main$viewPhoneClock = function (time) {
	var hours = _elm_lang$core$Basics$floor(
		_elm_lang$core$Basics$toFloat(_user$project$Main$hourStart) + (time / 60));
	var hoursString = A3(
		_elm_lang$core$String$padLeft,
		2,
		_elm_lang$core$Native_Utils.chr('0'),
		_elm_lang$core$Basics$toString(
			(_elm_lang$core$Native_Utils.cmp(hours, 24) > -1) ? (hours - 24) : hours));
	var minutes = A3(
		_elm_lang$core$String$padLeft,
		2,
		_elm_lang$core$Native_Utils.chr('0'),
		_elm_lang$core$Basics$toString(
			A2(
				_elm_lang$core$Basics_ops['%'],
				_elm_lang$core$Basics$floor(time),
				60)));
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'position', _1: 'absolute'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'top', _1: '3.1vh'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'right', _1: '12vw'},
							_1: {ctor: '[]'}
						}
					}
				}),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text(
				A2(
					_elm_lang$core$Basics_ops['++'],
					hoursString,
					A2(_elm_lang$core$Basics_ops['++'], ':', minutes))),
			_1: {ctor: '[]'}
		});
};
var _user$project$Main$minutesPerSecond = 0.5;
var _user$project$Main$debug = false;
var _user$project$Main$Model = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return {energy: a, confidence: b, time: c, phoneBattery: d, phoneUsageTimer: e, drunkenness: f, beerUsageTimer: g, storyKey: h, storyTimer: i, storyHasDrunkBeer: j, storyHasMessage: k};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _user$project$Main$init = {
	ctor: '_Tuple2',
	_0: _user$project$Main$Model(_user$project$Main$maxEnergy)(100)(0)(90)(0)(0)(0)('arriveAtParty')(_elm_lang$core$Maybe$Nothing)(false)(false),
	_1: _elm_lang$core$Platform_Cmd$none
};
var _user$project$Main$StoryBeat = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return {description: a, actions: b, timeUntil: c, canUsePhone: d, phoneHasMessage: e, canDrinkBeer: f, playerPosition: g, simonPosition: h, annaPosition: i, mehmetPosition: j, pollyPosition: k};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _user$project$Main$defaultStoryBeat = _user$project$Main$StoryBeat('')(
	{ctor: '[]'})(_elm_lang$core$Maybe$Nothing)(false)(false)(false)(29)(
	{ctor: '_Tuple2', _0: 60, _1: 18})(
	{ctor: '_Tuple2', _0: 56, _1: 13})(
	{ctor: '_Tuple2', _0: 62, _1: 7})(
	{ctor: '_Tuple2', _0: 69, _1: 12});
var _user$project$Main$arriveAtParty = {
	ctor: '_Tuple2',
	_0: 'arriveAtParty',
	_1: A2(
		_user$project$Main$withPlayerPosition,
		2,
		A2(
			_user$project$Main$withActions,
			{
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'Go into the house', _1: 'enterParty'},
				_1: {ctor: '[]'}
			},
			A2(
				_user$project$Main$withDescription,
				A2(
					_elm_lang$core$Basics_ops['++'],
					'You arrive at the party. You hope you can make it to the end ',
					A2(_elm_lang$core$Basics_ops['++'], 'before your phone runs out of power. And before you run ', 'out of energy.')),
				_user$project$Main$defaultStoryBeat)))
};
var _user$project$Main$enterParty = {
	ctor: '_Tuple2',
	_0: 'enterParty',
	_1: A3(
		_user$project$Main$withTimeUntil,
		3,
		'playWithPhone',
		A2(_user$project$Main$withDescription, 'You enter the house and find a wall to lean on.', _user$project$Main$defaultStoryBeat))
};
var _user$project$Main$playWithPhone = {
	ctor: '_Tuple2',
	_0: 'playWithPhone',
	_1: _user$project$Main$withCanUsePhone(
		A3(
			_user$project$Main$withTimeUntil,
			10,
			'simonOffersBeer',
			A2(
				_user$project$Main$withDescription,
				A2(_elm_lang$core$Basics_ops['++'], 'You turn on your phone to pretend you are busy. It\'ll keep you ', 'from getting drained from talking to too many people.'),
				_user$project$Main$defaultStoryBeat)))
};
var _user$project$Main$simonOffersBeer = {
	ctor: '_Tuple2',
	_0: 'simonOffersBeer',
	_1: A3(
		_user$project$Main$withSimonPosition,
		39,
		18,
		A2(
			_user$project$Main$withActions,
			{
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'Take the beer', _1: 'takeTheBeer'},
				_1: {ctor: '[]'}
			},
			A2(_user$project$Main$withDescription, 'Your friend, Simon, comes over and offers you a beer.', _user$project$Main$defaultStoryBeat)))
};
var _user$project$Main$takeTheBeer = {
	ctor: '_Tuple2',
	_0: 'takeTheBeer',
	_1: A3(
		_user$project$Main$withSimonPosition,
		39,
		18,
		_user$project$Main$withCanDrinkBeer(
			A2(
				_user$project$Main$withDescription,
				A2(_elm_lang$core$Basics_ops['++'], 'You take the beer. Its wet surface dampens your hand. You hold it ', 'up to your mouth and feel the coldness on your lips.'),
				_user$project$Main$defaultStoryBeat)))
};
var _user$project$Main$drinkBeerFirstTime = {
	ctor: '_Tuple2',
	_0: 'drinkBeerFirstTime',
	_1: _user$project$Main$withCanDrinkBeer(
		_user$project$Main$withCanUsePhone(
			A3(
				_user$project$Main$withTimeUntil,
				19,
				'weirdCarpet',
				A2(
					_user$project$Main$withDescription,
					A2(
						_elm_lang$core$Basics_ops['++'],
						'You don\'t like its bitter taste, you\'re more of a rum person. But, ',
						A2(_elm_lang$core$Basics_ops['++'], 'enough of this, and hey, you may work up the courage to talk to ', 'someone new. Or so you tell yourself.')),
					_user$project$Main$defaultStoryBeat))))
};
var _user$project$Main$weirdCarpet = {
	ctor: '_Tuple2',
	_0: 'weirdCarpet',
	_1: A3(
		_user$project$Main$withTimeUntil,
		15,
		'messageFromSimon',
		_user$project$Main$withCanDrinkBeer(
			_user$project$Main$withCanUsePhone(
				A2(_user$project$Main$withDescription, 'That carpet is weird. And pretty disgusting.', _user$project$Main$defaultStoryBeat))))
};
var _user$project$Main$messageFromSimon = {
	ctor: '_Tuple2',
	_0: 'messageFromSimon',
	_1: A2(
		_user$project$Main$withActions,
		{
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: '\"Yeah mate fine :)\"', _1: 'yeahMateFine'},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: '\"How long we gunna be here?\"', _1: 'askHowLong'},
				_1: {ctor: '[]'}
			}
		},
		A2(_user$project$Main$withDescription, 'Simon sent you a WhatsApp, \"Hey mate, you alright over there?\"', _user$project$Main$defaultStoryBeat))
};
var _user$project$Main$yeahMateFine = {
	ctor: '_Tuple2',
	_0: 'yeahMateFine',
	_1: _user$project$Main$withCanDrinkBeer(
		_user$project$Main$withCanUsePhone(
			A2(_user$project$Main$withDescription, '\"Cool cool, btw we\'ll probably head off about 2am\"', _user$project$Main$defaultStoryBeat)))
};
var _user$project$Main$askHowLong = {
	ctor: '_Tuple2',
	_0: 'askHowLong',
	_1: _user$project$Main$withCanDrinkBeer(
		_user$project$Main$withCanUsePhone(
			A2(_user$project$Main$withDescription, '\"Err, 2am probs\"', _user$project$Main$defaultStoryBeat)))
};
var _user$project$Main$story = _elm_lang$core$Dict$fromList(
	{
		ctor: '::',
		_0: _user$project$Main$arriveAtParty,
		_1: {
			ctor: '::',
			_0: _user$project$Main$enterParty,
			_1: {
				ctor: '::',
				_0: _user$project$Main$playWithPhone,
				_1: {
					ctor: '::',
					_0: _user$project$Main$simonOffersBeer,
					_1: {
						ctor: '::',
						_0: _user$project$Main$takeTheBeer,
						_1: {
							ctor: '::',
							_0: _user$project$Main$drinkBeerFirstTime,
							_1: {
								ctor: '::',
								_0: _user$project$Main$weirdCarpet,
								_1: {
									ctor: '::',
									_0: _user$project$Main$messageFromSimon,
									_1: {
										ctor: '::',
										_0: _user$project$Main$yeahMateFine,
										_1: {
											ctor: '::',
											_0: _user$project$Main$askHowLong,
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	});
var _user$project$Main$getStoryBeat = function (storyKey) {
	return A2(_elm_lang$core$Dict$get, storyKey, _user$project$Main$story);
};
var _user$project$Main$GoToStoryBeat = function (a) {
	return {ctor: 'GoToStoryBeat', _0: a};
};
var _user$project$Main$viewStoryAction = function (_p1) {
	var _p2 = _p1;
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'margin-top', _1: '1vh'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'color', _1: '#cf32d6'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'cursor', _1: 'pointer'},
							_1: {ctor: '[]'}
						}
					}
				}),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Events$onClick(
					_user$project$Main$GoToStoryBeat(_p2._1)),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text(
				A2(_elm_lang$core$Basics_ops['++'], '> ', _p2._0)),
			_1: {ctor: '[]'}
		});
};
var _user$project$Main$viewStoryActions = function (beat) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		A2(_elm_lang$core$List$map, _user$project$Main$viewStoryAction, beat.actions));
};
var _user$project$Main$viewStoryDescription = function (storyBeat) {
	var description = A2(
		_elm_lang$core$List$map,
		function (t) {
			return A2(
				_elm_lang$html$Html$p,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text(t),
					_1: {ctor: '[]'}
				});
		},
		A2(_elm_lang$core$String$split, '\n', storyBeat.description));
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'position', _1: 'absolute'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'bottom', _1: '0'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'width', _1: '100%'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'background', _1: '#111111'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'padding', _1: '6vh 4vw'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'font-size', _1: '3vh'},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'line-height', _1: '1.4'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'color', _1: '#cbd0da'},
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					}
				}),
			_1: {ctor: '[]'}
		},
		A2(
			_elm_lang$core$Basics_ops['++'],
			description,
			{
				ctor: '::',
				_0: _user$project$Main$viewStoryActions(storyBeat),
				_1: {ctor: '[]'}
			}));
};
var _user$project$Main$update = F2(
	function (msg, model) {
		update:
		while (true) {
			var _p3 = msg;
			switch (_p3.ctor) {
				case 'Tick':
					var storyTimer = function () {
						var _p4 = model.storyTimer;
						if (_p4.ctor === 'Just') {
							return _elm_lang$core$Maybe$Just(_p4._0 - 1);
						} else {
							return _elm_lang$core$Maybe$Nothing;
						}
					}();
					var beerUsageTimer = (_elm_lang$core$Native_Utils.cmp(model.beerUsageTimer, 0) > 0) ? (model.beerUsageTimer - 1) : 0;
					var phoneUsageTimer = (_elm_lang$core$Native_Utils.cmp(model.phoneUsageTimer, 0) > 0) ? (model.phoneUsageTimer - 1) : 0;
					var energy = (_elm_lang$core$Native_Utils.eq(phoneUsageTimer, 0) && (_elm_lang$core$Native_Utils.cmp(model.energy, 0) > 0)) ? (model.energy - 1) : model.energy;
					return _elm_lang$core$Native_Utils.update(
						model,
						{energy: energy, time: model.time + (1 * _user$project$Main$minutesPerSecond), phoneUsageTimer: phoneUsageTimer, beerUsageTimer: beerUsageTimer, storyTimer: storyTimer});
				case 'TickMinute':
					var drunkenness = (_elm_lang$core$Native_Utils.cmp(model.drunkenness, 0) > 0) ? (model.drunkenness - 1) : 0;
					return _elm_lang$core$Native_Utils.update(
						model,
						{drunkenness: drunkenness, phoneBattery: model.phoneBattery - 1});
				case 'UsePhone':
					return _elm_lang$core$Native_Utils.update(
						model,
						{phoneBattery: model.phoneBattery - 1, phoneUsageTimer: 3});
				case 'DrinkBeer':
					var drunkIncrement = (_elm_lang$core$Native_Utils.cmp(model.drunkenness, 4) < 0) ? 1 : _elm_lang$core$Basics$floor(
						_elm_lang$core$Basics$toFloat(model.drunkenness) / 4.0);
					var newModel = _elm_lang$core$Native_Utils.update(
						model,
						{drunkenness: model.drunkenness + drunkIncrement, confidence: model.confidence + 1, beerUsageTimer: 10, storyHasDrunkBeer: true});
					if (model.storyHasDrunkBeer) {
						return newModel;
					} else {
						var _v3 = _user$project$Main$GoToStoryBeat('drinkBeerFirstTime'),
							_v4 = newModel;
						msg = _v3;
						model = _v4;
						continue update;
					}
				default:
					var _p7 = _p3._0;
					var maybeStoryBeat = _user$project$Main$getStoryBeat(_p7);
					var storyTimer = function () {
						var _p5 = maybeStoryBeat;
						if (_p5.ctor === 'Just') {
							var _p6 = _p5._0.timeUntil;
							if (_p6.ctor === 'Just') {
								return _elm_lang$core$Maybe$Just(_p6._0._0);
							} else {
								return _elm_lang$core$Maybe$Nothing;
							}
						} else {
							return _elm_lang$core$Maybe$Nothing;
						}
					}();
					return _elm_lang$core$Native_Utils.update(
						model,
						{storyKey: _p7, storyTimer: storyTimer});
			}
		}
	});
var _user$project$Main$updateWithStoryTimer = F2(
	function (msg, model) {
		var newModel = A2(_user$project$Main$update, msg, model);
		var unwrap = _elm_community$maybe_extra$Maybe_Extra$unwrap(newModel);
		var applyNextStoryBeat = function (_p8) {
			var _p9 = _p8;
			return A2(
				_user$project$Main$update,
				_user$project$Main$GoToStoryBeat(_p9._1),
				newModel);
		};
		var applyStoryBeat = function (storyBeat) {
			return A2(unwrap, applyNextStoryBeat, storyBeat.timeUntil);
		};
		var applyStoryTimer = function (timer) {
			return _elm_lang$core$Native_Utils.eq(timer, 0) ? A2(
				unwrap,
				applyStoryBeat,
				_user$project$Main$getStoryBeat(newModel.storyKey)) : newModel;
		};
		return {
			ctor: '_Tuple2',
			_0: A2(unwrap, applyStoryTimer, newModel.storyTimer),
			_1: _elm_lang$core$Platform_Cmd$none
		};
	});
var _user$project$Main$DrinkBeer = {ctor: 'DrinkBeer'};
var _user$project$Main$viewBeer = F2(
	function (beerUsageTimer, storyBeat) {
		var canDrinkBeer = (_elm_lang$core$Native_Utils.cmp(beerUsageTimer, 0) > 0) ? false : storyBeat.canDrinkBeer;
		return canDrinkBeer ? A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					A2(
						_elm_lang$core$Basics_ops['++'],
						_user$project$Main$buttonStyle,
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'position', _1: 'absolute'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'top', _1: '20vh'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'left', _1: '20vw'},
									_1: {ctor: '[]'}
								}
							}
						})),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Events$onClick(_user$project$Main$DrinkBeer),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: _capitalist$elm_octicons$Octicons$zap(
					A2(
						_capitalist$elm_octicons$Octicons$size,
						36,
						A2(_capitalist$elm_octicons$Octicons$color, 'white', _capitalist$elm_octicons$Octicons$defaultOptions))),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html$text('Drink some beer'),
					_1: {ctor: '[]'}
				}
			}) : A2(
			_elm_lang$html$Html$span,
			{ctor: '[]'},
			{ctor: '[]'});
	});
var _user$project$Main$UsePhone = {ctor: 'UsePhone'};
var _user$project$Main$viewPhone = F2(
	function (phoneUsageTimer, storyBeat) {
		var canUsePhone = (_elm_lang$core$Native_Utils.cmp(phoneUsageTimer, 0) > 0) ? false : storyBeat.canUsePhone;
		return canUsePhone ? A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					A2(
						_elm_lang$core$Basics_ops['++'],
						_user$project$Main$buttonStyle,
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'position', _1: 'absolute'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'top', _1: '10vh'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'left', _1: '10vw'},
									_1: {ctor: '[]'}
								}
							}
						})),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Events$onClick(_user$project$Main$UsePhone),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: _capitalist$elm_octicons$Octicons$deviceMobile(
					A2(
						_capitalist$elm_octicons$Octicons$size,
						36,
						A2(_capitalist$elm_octicons$Octicons$color, 'white', _capitalist$elm_octicons$Octicons$defaultOptions))),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html$text('Use your phone'),
					_1: {ctor: '[]'}
				}
			}) : A2(
			_elm_lang$html$Html$span,
			{ctor: '[]'},
			{ctor: '[]'});
	});
var _user$project$Main$view = function (model) {
	var radialCenterR = '255';
	var energyRatio = _elm_lang$core$Basics$toFloat(model.energy) / _elm_lang$core$Basics$toFloat(_user$project$Main$maxEnergy);
	var scaleColour = F2(
		function (start, max) {
			return _elm_lang$core$Basics$toString(
				_elm_lang$core$Basics$floor(max - ((max - start) * energyRatio)));
		});
	var radialCenterG = A2(scaleColour, 193, 255);
	var radialCenterB = A2(scaleColour, 193, 255);
	var scaleColourDown = F2(
		function (start, min) {
			return _elm_lang$core$Basics$toString(
				_elm_lang$core$Basics$floor(min + ((start - min) * energyRatio)));
		});
	var radialOuterR = A2(scaleColourDown, 70, 0);
	var radialOuterG = A2(scaleColourDown, 60, 0);
	var radialOuterB = A2(scaleColourDown, 60, 0);
	var radialCenterA = _elm_lang$core$Basics$toString(1 - ((1 - 0.47) * energyRatio));
	var radialCenterRGBA = A2(
		_elm_lang$core$Basics_ops['++'],
		radialCenterR,
		A2(
			_elm_lang$core$Basics_ops['++'],
			',',
			A2(
				_elm_lang$core$Basics_ops['++'],
				radialCenterG,
				A2(
					_elm_lang$core$Basics_ops['++'],
					',',
					A2(
						_elm_lang$core$Basics_ops['++'],
						radialCenterB,
						A2(_elm_lang$core$Basics_ops['++'], ',', radialCenterA))))));
	var radialOuterA = _elm_lang$core$Basics$toString(1 - ((1 - 0.47) * energyRatio));
	var radialOuterRGBA = A2(
		_elm_lang$core$Basics_ops['++'],
		radialOuterR,
		A2(
			_elm_lang$core$Basics_ops['++'],
			',',
			A2(
				_elm_lang$core$Basics_ops['++'],
				radialOuterG,
				A2(
					_elm_lang$core$Basics_ops['++'],
					',',
					A2(
						_elm_lang$core$Basics_ops['++'],
						radialOuterB,
						A2(_elm_lang$core$Basics_ops['++'], ',', radialOuterA))))));
	var circleSize = _elm_lang$core$Basics$toString(40 + ((100 - 40) * energyRatio));
	var storyBeat = function () {
		var _p10 = _user$project$Main$getStoryBeat(model.storyKey);
		if (_p10.ctor === 'Just') {
			return _p10._0;
		} else {
			return _elm_lang$core$Native_Utils.crashCase(
				'Main',
				{
					start: {line: 106, column: 13},
					end: {line: 111, column: 93}
				},
				_p10)(
				A2(_elm_lang$core$Basics_ops['++'], 'Tried to load an invalid story beat — ', model.storyKey));
		}
	}();
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'background-image',
						_1: A2(
							_elm_lang$core$Basics_ops['++'],
							'radial-gradient(',
							A2(
								_elm_lang$core$Basics_ops['++'],
								'circle at 33% 56%, ',
								A2(
									_elm_lang$core$Basics_ops['++'],
									'rgba(',
									A2(
										_elm_lang$core$Basics_ops['++'],
										radialCenterRGBA,
										A2(
											_elm_lang$core$Basics_ops['++'],
											') 0, ',
											A2(
												_elm_lang$core$Basics_ops['++'],
												'rgba(',
												A2(
													_elm_lang$core$Basics_ops['++'],
													radialOuterRGBA,
													A2(
														_elm_lang$core$Basics_ops['++'],
														') ',
														A2(_elm_lang$core$Basics_ops['++'], circleSize, '%)')))))))))
					},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'background-color', _1: '#000000'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'height', _1: '100vh'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'font-family', _1: 'Roboto Slab'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'color', _1: '#ffffff'},
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _user$project$Main$viewFloor(model.energy),
			_1: {
				ctor: '::',
				_0: _user$project$Main$viewEnergyMeter(model.energy),
				_1: {
					ctor: '::',
					_0: _user$project$Main$viewConfidenceMeter(model.confidence),
					_1: {
						ctor: '::',
						_0: _user$project$Main$viewDrunkenness(model.drunkenness),
						_1: {
							ctor: '::',
							_0: A2(_user$project$Main$viewPlayer, model.energy, storyBeat),
							_1: {
								ctor: '::',
								_0: _user$project$Main$viewSimon(storyBeat),
								_1: {
									ctor: '::',
									_0: _user$project$Main$viewAnna(storyBeat),
									_1: {
										ctor: '::',
										_0: _user$project$Main$viewPolly(storyBeat),
										_1: {
											ctor: '::',
											_0: _user$project$Main$viewMehmet(storyBeat),
											_1: {
												ctor: '::',
												_0: _user$project$Main$viewBackgroundPeople,
												_1: {
													ctor: '::',
													_0: _user$project$Main$viewPartyLights(model.time),
													_1: {
														ctor: '::',
														_0: A2(_user$project$Main$viewPhone, model.phoneUsageTimer, storyBeat),
														_1: {
															ctor: '::',
															_0: A2(_user$project$Main$viewBeer, model.beerUsageTimer, storyBeat),
															_1: {
																ctor: '::',
																_0: _user$project$Main$viewPhoneBattery(model.phoneBattery),
																_1: {
																	ctor: '::',
																	_0: _user$project$Main$viewPhoneMessageIndicator,
																	_1: {
																		ctor: '::',
																		_0: _user$project$Main$viewPhoneClock(model.time),
																		_1: {
																			ctor: '::',
																			_0: _user$project$Main$viewStoryDescription(storyBeat),
																			_1: {ctor: '[]'}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		});
};
var _user$project$Main$TickMinute = function (a) {
	return {ctor: 'TickMinute', _0: a};
};
var _user$project$Main$Tick = function (a) {
	return {ctor: 'Tick', _0: a};
};
var _user$project$Main$subscriptions = function (model) {
	return _elm_lang$core$Platform_Sub$batch(
		{
			ctor: '::',
			_0: A2(
				_elm_lang$core$Time$every,
				_user$project$Main$debug ? (_elm_lang$core$Time$millisecond * 20) : _elm_lang$core$Time$second,
				_user$project$Main$Tick),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Time$every, _elm_lang$core$Time$second * 60, _user$project$Main$TickMinute),
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Main$main = _elm_lang$html$Html$program(
	{init: _user$project$Main$init, view: _user$project$Main$view, update: _user$project$Main$updateWithStoryTimer, subscriptions: _user$project$Main$subscriptions})();

var Elm = {};
Elm['Main'] = Elm['Main'] || {};
if (typeof _user$project$Main$main !== 'undefined') {
    _user$project$Main$main(Elm['Main'], 'Main', undefined);
}

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);

