/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactID
 * @typechecks
 */

"use strict";

var ReactMount = require('ReactMount');
var ATTR_NAME = 'id';
var nodeCache = {};

/**
 * Accessing node[ATTR_NAME] or calling getAttribute(ATTR_NAME) on a form
 * element can return its control whose name or ID equals ATTR_NAME. All
 * DOM nodes support `getAttributeNode` but this can also get called on
 * other objects so just return '' if we're given something other than a
 * DOM node (such as window).
 *
 * @param {?DOMElement|DOMWindow|DOMDocument|DOMTextNode} node DOM node.
 * @return {string} ID of the supplied `domNode`.
 */
function getID(node) {
  if (node && node.getAttributeNode) {
    var attributeNode = node.getAttributeNode(ATTR_NAME);
    if (attributeNode) {
      var id = attributeNode.value;
      if (id) {
        // Assume that any node previously cached with this ID has since
        // become invalid and should be replaced. TODO Enforce this.
        nodeCache[id] = node;

        return id;
      }
    }
  }

  return '';
}

/**
 * Sets the React-specific ID of the given node.
 *
 * @param {DOMElement} node The DOM node whose ID will be set.
 * @param {string} id The value of the ID attribute.
 */
function setID(node, id) {
  var oldID = getID(node);
  if (oldID !== id) {
    delete nodeCache[oldID];
  }
  node.setAttribute(ATTR_NAME, id);
  nodeCache[id] = node;
}

/**
 * Finds the node with the supplied React-generated DOM ID.
 *
 * @param {string} id A React-generated DOM ID.
 * @return {?DOMElement} DOM node with the suppled `id`.
 * @internal
 */
function getNode(id) {
  if (!nodeCache[id]) {
    nodeCache[id] =
      document.getElementById(id) || // TODO Quit using getElementById.
      ReactMount.findReactRenderedDOMNodeSlow(id);
  }

  var node = nodeCache[id];
  if (getID(node) === id) {
    return node;
  }

  return null;
}

/**
 * Causes the cache to forget about one React-specific ID.
 *
 * @param {string} id The ID to forget.
 */
function purgeID(id) {
  delete nodeCache[id];
}

/**
 * Clears the entire cache.
 */
function purgeEntireCache() {
  nodeCache = {};
}

exports.ATTR_NAME = ATTR_NAME;
exports.getID = getID;
exports.setID = setID;
exports.getNode = getNode;
exports.purgeID = purgeID;
exports.purgeEntireCache = purgeEntireCache;