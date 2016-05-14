/*
Name: tree.js
Description: This file contains all functions necessary to create data tree from json file.
*/


/*
Description:
    Default constructor function for Node variable. Node holds values of single leaf or non-leaf element of data.

Note:
    Function for assigning color is random.
    It also handles floating zeroes error, for example #000f3a instead of #f3a.
    Offset is set to 0 as it is initialized later.
 */
function Node(latin, english, children, size) {

    this.latin = latin;
    this.english = english;
    this.parent = null;
    this.childList = children;
    this.sceneObject = null;


    //size is required for deciding angle of cylinder
    //set to 0 on initialization, later recursively filled in bottom-up manner
    this.size = size;
    this.depth = 0;
    this.offset = 0;

    //assign random color to node
    this.color = '#'+ ('000000' + Math.floor(Math.random()*16777215).toString(16)).slice(-6);
}

/*
Description:
    Default constructor function for Tree variable.
    Creates custom tree object from XML DOM document.

Note:
    Variable 'leafNumber' is equal to the size of root node.
 */
function Tree(data) {

    var documentRoot = data.documentElement;

    //root node of tree has no parent
    //root node starts passing himself as parent to level 1 nodes
    //thus, he is the hero we all need, the one that has nothing but still gives himself to others
    this.root = createNode(documentRoot);
    this.depth = 0;
    this.leafNumber = 0;
}

/*
 Description:
 Traverse tree and initialize its internal variables:

     -leafNumber    (for tree)
     -depth         (for tree)
     -size          (for each node)
     -offset        (for each node)
     -depth         (for each node)

 */
function assignTreeGraphicParameters(tree){

    //count number of leaf nodes
    tree.leafNumber = getNodeValue(tree.root);
    //count depth of a tree and each node
    assignTreeDepths(tree);
    //count offsets for cylinder partitions
    countSunburstTreeOffsets(tree);
}

/*
Description:
    Assigns depths to all nodes in tree and assigns maximum depth of tree.

Note:
    Depth of root node is 0.
 */
function assignTreeDepths(tree){

    tree.depth = assignNodeDepth(tree.root, 0);
}

/*
Description:
    Assigns depth of a node subtree in a recursive manner.
    Each node passes its own incremented depth to its children.
    Return depth of node subtree.
Note:
    Call this function for root node of tree to assign all depths in tree.
    Return explanation: Node chooses its child with deepest subtree.
    Therefore node itself is deepest child node subtree + 1 deep.
*/
function assignNodeDepth(node, depth){
    node.depth = depth;

    var max = 0;
    for(var i = 0; i < node.childList.length; i++){

        var subTreeMax = assignNodeDepth(node.childList[i], depth + 1);

        if(subTreeMax > max)
            max = subTreeMax;
    }

    return max + 1;
}

/*
Description:
    Assigns offset values to all tree nodes for Sunburst visualization.
    Recursively counts children from parents. Each child pushes next ones by its size.
 */
function countSunburstTreeOffsets(tree){

    //start recursion from root of the tree

    tree.root.offset = 0;
    var children = tree.root.childList;


    var siblingBonus = 0;
    //cycling through root child nodes - see documentation of 'countSunburstNodeOffset()'
    for(var i = 0; i < children.length; i++){
        countSunburstNodeOffset(children[i], siblingBonus);
        siblingBonus += children[i].size;
    }
}

/*
Description:
    Count offset from single node. Function recursively counts subtree of this node.

Note:
    Calling this function for a root node of tree will recursively count values of all tree nodes.
    This approach is not recommended in most situations, because root has no parent to get offset from - error.
    Better approach is manually assigning zero offset to root and cycling through his direct child nodes.
 */
function countSunburstNodeOffset(node, previousSiblingsSum){

    //assign position to current node
    node.offset = node.parent.offset + previousSiblingsSum;

    var siblingBonus = 0;

    for(var i = 0; i < node.childList.length; i++){
        countSunburstNodeOffset(node.childList[i], siblingBonus);
        siblingBonus += node.childList[i].size;
    }
}

/*
Description:
    Function creates a Node object for custom tree and returns it.
    Recursively creates children nodes until no children are left.
    After reaching leaf nodes, bottom-up assign children to parents.

Note:
    Parent is assigning itself to children.parent of all its children.
    Root has null parent, as there is no parent to assign itself into position.
 */
function createNode(node) {


    var firstNodeAttributeElement = node.children[0];
    var secondNodeAttributeElement = node.children[1];

    var childElements = node.children;

    //var attributes = node.getElementsByTagName('attribute');

    //latin and english names of species are obtained by accessing direct positions
    //correct output depends on exact XML structure
    var latin = "";
    var english = "";


    //Javascript black magic. 'If' statement apparently does type casting. What a time to be alive.
    //Careful: Does not work without 'if' statement.
    if (firstNodeAttributeElement.nodeType === 1) {
        latin = firstNodeAttributeElement.getAttribute('value');
    }
    if (secondNodeAttributeElement.nodeType === 1) {
        english = secondNodeAttributeElement.getAttribute('value');
    }

    //array filled on return of recursive function
    var childrenList = [];
    var size = 0;

    if(node.tagName == 'leaf'){
        size = 1;
    }
    if(node.tagName == 'branch'){

        //create child nodes of this branch
        for(var i = 0; i < childElements.length; i++){

            var actualChild = childElements.item(i);

            if((actualChild.tagName == 'leaf') || (actualChild.tagName == 'branch')) {

                //create a child node from xml child leaf element
                var newChild = createNode(actualChild, null);
                //add a child node
                childrenList.push(newChild);
            }
        }
    }
    var thisNode = new Node(latin, english, childrenList, size);

    //assigning node as parent to all child nodes in childList
    for(i = 0; i < thisNode.childList.length; i++){
        thisNode.childList[i].parent = thisNode;
    }

    return thisNode;
}
/*
Description:
    Function for assigning value to a single node.
    Recursively searches tree under node and returns sum of all leaves.

Note:
    For assigning values of a whole tree, call this function once on root.
 */
function getNodeValue(node) {

    var nodeValue = 0;

    if (node.size != 1) {

        //assign node size as sum of its children sizes
        for (var i = 0; i < node.childList.length; i++) {
            nodeValue += getNodeValue(node.childList[i]);
        }
    }
    else {
        nodeValue = 1;
    }
    //assign final value to node size parameter
    node.size = nodeValue;

    return node.size;
}

/*
Description:
    Create tree of nodes containing animal XML data ready to be displayed as 3D Sunburst.
 */
function createTree(data) {

    //create tree by constructor and return it
    var xmlDataTree = new Tree(data);
    assignTreeGraphicParameters(xmlDataTree);

    return xmlDataTree;
}

/*
Description:
    Creates and returns a subtree with given node as a root.
    All inner graphic parameters are fixed(tree depth, node depths, offsets, ...).

Note:
    Passing subtree inside because of incorrect programming earlier, creating a dummy tree requires parsing whole XML.
 */
function createSubtreeFromTree(clonedTree, node){

    var newRootNode = jQuery.extend(true, {}, node);
    var newSubtree = jQuery.extend(true, {}, clonedTree);
    
    newSubtree.root = newRootNode;
    assignTreeGraphicParameters(newSubtree);
    
    subtree =  newSubtree;
}

/*
Description:
    Function for finding node by its scene object.
 */
function getSceneObjectNodeById(node, scenePartition){

    if(node.sceneObject.id == scenePartition.id){

        return node;
    }
    else{

        for( var i = 0; i < node.childList.length; i++) {
            var childFound = getSceneObjectNodeById(node.childList[i], scenePartition);

            if(childFound != null)
                return childFound
        }
    }
}

/*
Description:
    Finds node under subtree root by latin name.

Note:
    To be used when searching for subtree parent nodes in original tree.
 */
function getTreeNodeByLatinName(root, node){

    if(root.latin == node.latin){

        return root;
    }
    else{

        for( var i = 0; i < root.childList.length; i++) {
            var childFound = getTreeNodeByLatinName(root.childList[i], node);

            if(childFound != null)
                return childFound
        }
    }
}

/*
Description:
    To be called upon root for refreshing color of tree when moving over partitions.

Note:
    DEPRECATED
    Omitted for being too slow in current build.
 */
function refreshTreeColors(node){

    for( var i = 0; i < node.childList.length; i++){
        node.childList[i].sceneObject.object.material.color.setHex(node.childList[i].color);
        refreshTreeColors(node.childList[i]);
    }
}