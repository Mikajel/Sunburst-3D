/*
Description:
    Function for rendering Sunburst 3d diagram.
    Sets up scene, camera and objects of the diagram.

Note:
    Tested straight-edge pyramid style of graph, looked like shit tho. Staying with mayan-style pyramid for now.
    TODO: Break giant function into smaller functions. Probably not going TODO it. LOL.
 */
function init (tree) {

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    scene = new THREE.Scene();



    camera = new THREE.OrthographicCamera(
        window.innerWidth / -2,   // Left
        window.innerWidth / 2,    // Right
        window.innerHeight / 1,   // Top
        window.innerHeight / -2,  // Bottom
        //this sets render distance of camera
        -2000,            // Near clipping plane
        1000 ); 

    //camera field of view
    fov = camera.fov, zoom = 1.0, inc = -0.01;

    //move camera to default view angle
    camera.position.y = 150;
    camera.position.z = 75;
    
    camera.lookAt( scene.position );
    scene.add(camera);

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    //controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    drawCylinderTree(scene, tree);

    light = new THREE.AmbientLight( 0x222222 );
    light.position.set( 100, 200, 100 );
    scene.add( light );


    renderer.setClearColor( 0xdddddd, 1);
    renderer.render( scene, camera );

    window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener( 'mousewheel', mousewheel, false );
    // firefox, screw firefox, use Chrome
	//window.addEventListener( 'DOMMouseScroll', mousewheel, false );
    window.animate();

}

/*
Description:
    Draws Sunburst visualization to the scene.
    Requires custom tree on input.
 */
function drawCylinderTree(scene, tree){

    drawCylinderNode(scene, tree.depth, tree.leafNumber, tree.root);
}

/*
Description:
    Recursively draws all nodes of subtree to the scene.

Note:
    Call this function for root node to draw Sunburst.
 */
function drawCylinderNode(scene, maxDepth, totalNodes, node){

    //draw myself
    drawCylinderPartition(scene, maxDepth, totalNodes, node.depth, node.offset, node.size, node.color);
    //initiate drawing of all children recursively
    for(var i = 0; i < node.childList.length; i++){
        drawCylinderNode(scene, maxDepth, totalNodes, node.childList[i]);
    }
}

/*
Description:
    Draws single cylinder partition.
Note:
    Uses THREE.js CylinderGeometry to add cylinder partition into scene.
    BaseHeight decreases with depth - deepest partitions are in height 0 and root is on a top.
*/
function drawCylinderPartition(scene, maxDepth, totalNodes, depth, offset, size, color){

    if(depth < maxDepth) {
        var width = 100 + 50 * depth;
        var baseHeight = 40 * (maxDepth - depth);
        var height = 40;

        //count angular start and end of partition on circle
        var thetaStart = (offset / totalNodes) * (2 * Math.PI);
        var thetaLength = ((size) / totalNodes) * (2 * Math.PI);

        //value*thetaLength guarantees proportional distribution of edges along side of cylinder
        var geometry = new THREE.CylinderGeometry(width, width, height, 5*thetaLength, 5, false, thetaStart, thetaLength);
        var material = new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide});
        var cylinder = new THREE.Mesh(geometry, material);
        var cylinderEdges = new THREE.EdgesHelper(cylinder, 0xffffff);

        cylinder.position.y = baseHeight;
        scene.add(cylinder);
        scene.add(cylinderEdges);
    }
    
}

function onWindowResize ()  {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

};

function animate () {

    requestAnimationFrame( animate );

    render();

    controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true

    //stats.update();



};

function render() {

    camera.fov = fov * zoom;
    camera.updateProjectionMatrix();
    renderer.render( scene, camera );

};

function mousewheel( e ) {      
    var d = ((typeof e.wheelDelta != "undefined")?(-e.wheelDelta):e.detail);
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