var THREE = require('three');
require('./MirrorLoader.js')(THREE);
require('./WaterLoader.js')(THREE);

var App = function(){
   this.container = document.body;
   
   this.scene = new THREE.Scene();

   this.height = window.innerHeight;
   this.width = window.innerWidth;

   window.camera = this.camera = new THREE.PerspectiveCamera( 45, this.width / this.height, 1, 3000000 );
   this.camera.up = new THREE.Vector3(0,0,1);
   this.camera.position.set( 10, 100, 0 );
   this.camera.lookAt(new THREE.Vector3(0,0,0));

   this.renderer = new THREE.WebGLRenderer({ antialias: true });
   this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
   this.renderer.setSize( this.width, this.height);
   this.container.appendChild( this.renderer.domElement );

   // pointLight is just holding a position for the camera
   this.pointLight = new THREE.PointLight( 0xffffff, 1, 100 );
   this.pointLight.position.set( 50, 50, 50 );

   window.THREE = THREE;

   this.loader = new THREE.ImageLoader();

   this.makeWater();
   this.makeEnvironment();
 
   this.init();
};

App.prototype.makeWater = function(){

   var waterNormals = new THREE.ImageUtils.loadTexture( '/textures/oil.jpg' );
       waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping; 

   this.water = new THREE.Water( this.renderer, this.camera, this.scene, {
		textureWidth: 1024, 
		textureHeight: 1024,
		waterNormals: waterNormals,
		alpha: 0.5,
		sunDirection: this.pointLight.position.normalize(),
		sunColor: 0xcccccc,
		waterColor: 0x8B0000,
		distortionScale: 50,
	});
   
   this.water.sunDirection.x = 0;
   this.water.sunDirection.y = 5.0;
   this.water.sunDirection.z = 2.0;


   this.waterPlane = new THREE.Mesh(
	new THREE.PlaneBufferGeometry( 20000, 20000 ),
	this.water.material
	);

   this.mirrorMesh = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 20000, 20000 ),
		this.water.material
	);

   this.mirrorMesh.add( this.water );
   this.mirrorMesh.rotation.x = - Math.PI * 0.5;
   this.scene.add( this.mirrorMesh );
};

App.prototype.makeEnvironment = function(){
	this.cubeMap = new THREE.CubeTexture( [] );
    this.cubeMap.format = THREE.RGBFormat;


    this.loader.load( 'textures/justpink.jpg', (function ( image ) {
      		var getSide = function ( x, y ) {
	   			var size = 1024;
	   			var canvas = document.createElement( 'canvas' );
	   			canvas.width = size;
	   			canvas.height = size;
	   			var context = canvas.getContext( '2d' );
	   			context.drawImage( image, - x * size, - y * size );
	   			return canvas;
	   		};
	   
   		this.cubeMap.images[ 0 ] = getSide( 2, 1 ); // px
   		this.cubeMap.images[ 1 ] = getSide( 0, 1 ); // nx
   		this.cubeMap.images[ 2 ] = getSide( 1, 0 ); // py
   		this.cubeMap.images[ 3 ] = getSide( 1, 2 ); // ny
   		this.cubeMap.images[ 4 ] = getSide( 1, 1 ); // pz
   		this.cubeMap.images[ 5 ] = getSide( 3, 1 ); // nz
   		this.cubeMap.needsUpdate = true;
   	}).bind(this));

    this.cubeShader = THREE.ShaderLib.cube;
    this.cubeShader.uniforms.tCube.value = this.cubeMap;

	this.skyBoxMaterial = new THREE.ShaderMaterial( {
		fragmentShader: this.cubeShader.fragmentShader,
		vertexShader: this.cubeShader.vertexShader,
		uniforms: this.cubeShader.uniforms,
		depthWrite: false,
		side: THREE.BackSide
	});

   this.skyBox = new THREE.Mesh(
		new THREE.BoxGeometry( 1000000, 1000000, 1000000 ),
		this.skyBoxMaterial
	);

   this.scene.add( this.skyBox );

};

App.prototype.init = function(){
	window.addEventListener('resize', function(){
		if(window.innerWidth < 840) self.camera.position.set( 10, 120, 0 );
		if(window.innerWidth < 530) self.camera.position.set( 20, 140, 0 );
		if(window.innerWidth >= 840) self.camera.position.set( 10, 65, 0 );
		self.camera.aspect = window.innerWidth / window.innerHeight;
		self.camera.updateProjectionMatrix();
		self.renderer.setSize( window.innerWidth, window.innerHeight );
	});
	this.render();
};

App.prototype.render = function(){
	this.water.material.uniforms.time.value += 1.0 / 400.0;
	try{
		this.water.render();
	} catch(e){

	}
	this.renderer.render( this.scene, this.camera );
	var self = this;
	window.setTimeout(function(){window.requestAnimationFrame(self.render.bind(self));}, 60);
};



module.exports = App;
