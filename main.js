//extremely wrong declaration, but then again, autistic monkey knows javascript better than me
//hack around "global variable" need

var tree;
var subtree;
var lastAccessedObject;
var levelsToDisplay;
var actualRootDepth;

var renderer;
var raycaster;
var controls;
var projector;
var mouseVector;

var scene;
var mouse;
var camera;
var light;

var fov;
var zoom;
var inc;



/*
Description:
    Function for rendering Sunburst 3d diagram.
    Sets up scene, camera and objects of the diagram.

Note:
    Tested straight-edge pyramid style of graph, looked like shit tho. Staying with mayan-style pyramid for now.
    TODO: Break giant function into smaller functions. Probably not going TODO it. LOL.
 */
function init (data) {
    
    //tree always remembers whole tree, subtree only gets portion of it to create scene
    tree = createTree(data);
    subtree = createTree(data);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight);
    document.body.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    mouse = new THREE.Vector2();

    //set initial display depth to 2
    levelsToDisplay = 2;
    document.getElementById("displayedLevels").innerHTML = levelsToDisplay ;

    raycaster = new THREE.Raycaster();

    camera = new THREE.PerspectiveCamera( 100, window.innerWidth/window.innerHeight, 10, 10000 );

    //camera field of view
    fov = camera.fov;
    zoom = 1.0;
    inc = -0.01;

    //move camera to default view angle
    camera.position.y = 300;
    camera.position.z = 200;
    
    camera.lookAt( scene.position );
    scene.add(camera);

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    //controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    //fill sunburst with cylinder partitions
    drawCylinderTree(scene, subtree);

    light = new THREE.AmbientLight( 0x222222 );
    light.position.set( 100, 200, 100 );
    scene.add( light );


    renderer.setClearColor( 0xdddddd, 1);
    renderer.render( scene, camera );

    //variables for tracking mouse movement
    projector = new THREE.Projector();
    mouseVector = new THREE.Vector3();

    //event listeners
    window.addEventListener( 'mousemove', onMouseMove, false );
    window.addEventListener( 'mousedown', onMouseDown, false );
    window.addEventListener( 'resize', onResize, false );
    window.addEventListener( 'mousewheel', mouseWheel, false );
    window.addEventListener( 'keypress', keyDownResolver, false);

    lastAccessedObject = subtree.root.sceneObject;

    //for firefox, screw firefox, use Chrome
	//window.addEventListener( 'DOMMouseScroll', mousewheel, false );

    window.animate();

}

function keyDownResolver( event ){
    event.preventDefault();

    if(event.keyCode == 108){

        getUserInput();

        emptyScene(scene);
        //redraw the scene with desired number of levels
        subtreeSelection(subtree.root);
        drawCylinderTree(scene, subtree);
        //this HAS to be called after drawing
        //else lastAccessedObject will refer to non-existing sceneObject re-written by drawing
        lastAccessedObject = subtree.root.sceneObject;

        document.getElementById("displayedLevels").innerHTML = levelsToDisplay ;
    }

    if(event.keyCode == 107){

        drawParentGraph(subtree);
    }

    if(event.keyCode == 32){

        var topNode = getTreeNodeByLatinName(tree.root, tree.root);
        emptyScene(scene);
        //redraw the scene with desired number of levels
        subtreeSelection(topNode);
        drawCylinderTree(scene, subtree);
        //this HAS to be called after drawing
        //else lastAccessedObject will refer to non-existing sceneObject re-written by drawing
        lastAccessedObject = subtree.root.sceneObject;
    }
}

/*
Description:
    Creates a selection subtree to overwrite visualization.

Note:
    Selecting root of actual visualization will do nothing.
    Function itself will not change the visualization. Scene has to be emptied and redrawn.
 */
function subtreeSelection(node){
        createSubtreeFromTree(subtree, node);
}

/*
Description:
    Removes all elements from scene.
    Works in cycle removing first child of scene until all objects are gone - array of children ahs zero length.

Note:
    To be called on re-drawing scene after node selection.
 */
function emptyScene(scene){

    while(scene.children.length > 0){
        var objectToRemove = scene.children[0];
        scene.remove(objectToRemove);
    }
}

/*
Description:
    Draws Sunburst visualization to the scene.
    Requires custom tree on input.
 */
function drawCylinderTree(scene, subtree){

    actualRootDepth = subtree.root.depth;
    drawCylinderNode(scene, subtree.depth, subtree.leafNumber, subtree.root);
    
    //set the label for actual root
    document.getElementById("actualRoot").innerHTML = subtree.root.latin;
}

/*
Description:
    Recursively draws all nodes of subtree to the scene.

Note:
    Call this function for root node to draw Sunburst.
 */
function drawCylinderNode(scene, maxDepth, totalNodes, node){

    //draw myself
    drawCylinderPartition(scene, maxDepth, totalNodes, node);
    //initiate drawing of all children recursively

    //do not draw deeper than user wants
    if(actualRootDepth + levelsToDisplay - 1 > node.depth) {
        for (var i = 0; i < node.childList.length; i++) {
            drawCylinderNode(scene, maxDepth, totalNodes, node.childList[i]);
        }
    }
}

/*
Description:
    Draws single cylinder partition.
Note:
    Uses THREE.js CylinderGeometry to add cylinder partition into scene.
    BaseHeight decreases with depth - deepest partitions are in height 0 and root is on a top.
*/
function drawCylinderPartition(scene, maxDepth, totalNodes, node){

    if(node.depth < maxDepth) {
        var width = 100 + 50 * node.depth;
        var baseHeight = 20 * (maxDepth - node.depth);
        //one less so walls do not collide in graphical mess
        var height = 19;

        //count angular start and end of partition on circle
        var thetaStart = (node.offset / totalNodes) * (2 * Math.PI);
        var thetaLength = ((node.size) / totalNodes) * (2 * Math.PI);

        //value*thetaLength guarantees proportional distribution of edges along side of cylinder
        var geometry = new THREE.CylinderGeometry(width, width, height, 75*thetaLength, 5, false, thetaStart, thetaLength);
        var material = new THREE.MeshBasicMaterial({color: node.color, side: THREE.DoubleSide});
        var cylinder = new THREE.Mesh(geometry, material);
        var cylinderEdges = new THREE.EdgesHelper(cylinder, 0xffffff);

        //move partition to its designated height
        cylinder.position.y = baseHeight;

        //
        node.sceneObject = cylinder;
        scene.add(cylinder);
        //scene.add(cylinderEdges);
    }
    
}

function onResize ()  {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}

/*
Description:
    Creating a subtree if node was clicked.
 */
function onMouseDown ( event ) {

    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( scene.children );

    if ( intersects.length > 0 ) {
        emptyScene(scene);

        var targetedObject = intersects[0];
        var targetedObjectNode = getSceneObjectNodeById(subtree.root, targetedObject.object);

        subtreeSelection(targetedObjectNode);
        drawCylinderTree(scene, subtree);
        //this HAS to be called after drawing
        //else lastAccessedObject will refer to non-existing sceneObject re-written by drawing
        lastAccessedObject = subtree.root.sceneObject;
    }
}

/*
Description:
    Updates the scene.
    Actions to happen should be called from render() function.
Note:
    Yeah, I copied this from some examples. No sweat.
 */
function animate () {

    requestAnimationFrame( animate );

    render();

    controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true

    //stats.update();
}

/*
Description:
    Catching mouse cursor move event.
    Updating 2D position of mouse cursor.

Note:
    Used for ray casting to detect targeting objects with a mouse.
 */
function onMouseMove( event ){
    //I have literally no idea why this works with such constants
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function render() {

    camera.fov = fov * zoom;
    camera.updateProjectionMatrix();
    update();
    renderer.render( scene, camera );
}

/*
Description:
    Sets color of a node to highlighted gradiently.
 */
function setColorHighlight( color ){
    
    if(color.r > 0.5) color.r = (color.r * 1.005);
    if(color.g > 0.5) color.g = (color.g * 1.005);
    if(color.b > 0.5) color.b = (color.b * 1.005);
}

/*
Description:
    Draws a sunburst from parent of actual root.
 */
function drawParentGraph( originalSubtree ){

    //where I am now
    var originalRoot = originalSubtree.root;
    //get corresponding node in main tree
    if(originalRoot.latin != tree.root.latin) {
        var treeNode = getTreeNodeByLatinName(tree.root, originalRoot);

        //construct parent tree
        subtreeSelection(treeNode.parent);
        //clear the original graph
        emptyScene(scene);
        //draw parent graph
        drawCylinderTree(scene, subtree);
        //this HAS to be called after drawing
        //else lastAccessedObject will refer to non-existing sceneObject re-written by drawing
        lastAccessedObject = subtree.root.sceneObject;
    }
    else{
        alert("Already on the top of graph");
    }
}


/*
Description:
    Creates a prompt window for user.
    Enables user to select number of levels to be displayed.
 */
function getUserInput() {
    var levels = prompt("Please select number of levels to display", "4");

    levelsToDisplay = parseInt(levels, 10);

    console.log(levelsToDisplay);
}


/*
Description:
    Highlights selected partition of sunburst.
    Displays latin name of node in upper left corner.
Note:
    Works on ray casting principle.
    Catches all objects into an array, highlights only nearest one.
 */
function update() {

    //cast ray to go through objects
    raycaster.setFromCamera(mouse, camera);
    //array of targeted objects, ordered by distance - near to far
    var intersects = raycaster.intersectObjects( scene.children );
    //black out targeted partition of sunburst
    if (intersects.length > 0) {

        var targetedObject = intersects[0];

        //color out targeted node
        setColorHighlight(targetedObject.object.material.color);


        var targetedObjectNode = getSceneObjectNodeById(subtree.root, targetedObject.object);
        document.getElementById("latinWindow").innerHTML = targetedObjectNode.latin;
        //get node of blacked out object
        var lastAccessedObjectNode = getSceneObjectNodeById(subtree.root, lastAccessedObject);

        //create new color by force - #000000 format to 0x000000 format
        var colors = lastAccessedObjectNode.color.split("#");
        var color = ("0x" + colors[1]);
        
        //if I moved on another object
        if(targetedObject.object != lastAccessedObject) {
            //apply the original color
            if (lastAccessedObjectNode != null) {
                lastAccessedObjectNode.sceneObject.material.color.setHex(color);
            }
        }

        lastAccessedObject = targetedObject.object;
    }
    //if you run down from a node, remove highlighting and innerHTML
    else{
        var lastAccessedObjectNode = getSceneObjectNodeById(subtree.root, lastAccessedObject);
        var colors = lastAccessedObjectNode.color.split("#");
        var color = ("0x" + colors[1]);
        if (lastAccessedObjectNode != null) {
            lastAccessedObjectNode.sceneObject.material.color.setHex(color);
        }
        //clear the display of latin name
        document.getElementById("latinWindow").innerHTML = "";
    }
}

/*
Description:
    Zooming camera on catching mouse wheel event.
 */
function mouseWheel( event ) {
    event.preventDefault();

    var d = ((typeof event.wheelDelta != "undefined")?(-event.wheelDelta):event.detail);
    d = 100 * ((d>0)?1:-1);

    var cPos = camera.position;
    if (isNaN(cPos.x) || isNaN(cPos.y) || isNaN(cPos.y))
      return;

    var r = cPos.x*cPos.x + cPos.y*cPos.y;
    var sqr = Math.sqrt(r);
    var sqrZ = Math.sqrt(cPos.z*cPos.z + r);


    var nx = cPos.x + ((r==0)?0:(d * cPos.x/sqr));
    var ny = cPos.y + ((r==0)?0:(d * cPos.y/sqr));
    var nz = cPos.z + ((sqrZ==0)?0:(d * cPos.z/sqrZ));

    if (isNaN(nx) || isNaN(ny) || isNaN(nz))
      return;

    cPos.x = nx;
    cPos.y = ny;
    cPos.z = nz;
}