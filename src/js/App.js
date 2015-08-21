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

   var waterNormals = new THREE.ImageUtils.loadTexture( '/textures/landingpageengine.png' );
       waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping; 

   this.water = new THREE.Water( this.renderer, this.camera, this.scene, {
		textureWidth: 1024, 
		textureHeight: 1024,
		waterNormals: waterNormals,
		alpha: 0.5,
		sunDirection: this.pointLight.position.normalize(),
		sunColor: 0x0033CC,
		waterColor: 0x029ABA,
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


    this.loader.load( 'textures/lilwhite.jpg', (function ( image ) {
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

// App.prototype.addLyrics = function(){
// 	this.lyrics = [];
// 	var audio = document.getElementsByTagName('audio')[0];
// 	var audioLoaded = audio.readyState === 4;
// 	audioLoaded ? playAudio : audio.addEventListener('canplaythrough', startKaraoke);
// 	var imagesLoaded = false;
// 	var started = false;
	
// 	function startKaraoke(){
// 		if(started) return;
// 		if(!imagesLoaded) return window.setTimeout(startKaraoke, 500);
// 		console.log(started, imagesLoaded, audioLoaded)
// 		started = true;
// 		slideshow();
// 	}

// 	function slideshow(){
// 		images.forEach(setImageTimer);
// 		return audio.play();
// 	}

// 	function setImageTimer(img){
// 		setTimeout(playImage.bind(this, img), img.startTime);
// 	}

// 	function playImage(img){
// 		document.body.appendChild(img.obj);
// 		window.setTimeout(stopImage.bind(this, img), img.duration);
// 	}

// 	function stopImage(img){
// 		document.body.removeChild(img.obj);
// 	}

// 	var images = [
// 			{imagePath: "/textures/lyrics/1.gif", duration: 4530, startTime: 32927},
// 			{imagePath: "/textures/lyrics/2.gif", duration: 4530, startTime: 37837},
// 			{imagePath: "/textures/lyrics/3.gif", duration: 4530, startTime: 43760},
// 			{imagePath: "/textures/lyrics/4.gif", duration: 4530, startTime: 48695},
// 			{imagePath: "/textures/lyrics/5.gif", duration: 4530, startTime: 54618},

// 			{imagePath: "/textures/lyrics/6.gif", duration: 4530, startTime: 60540},
// 			{imagePath: "/textures/lyrics/7.gif", duration: 4530, startTime: 67010},
// 			{imagePath: "/textures/lyrics/8.gif", duration: 4530, startTime: 72020},

// 			{imagePath: "/textures/lyrics/9.gif", duration: 4530, startTime: 97029},
// 			{imagePath: "/textures/lyrics/10.gif", duration: 4530, startTime: 102028},
// 			{imagePath: "/textures/lyrics/11.gif", duration: 4530, startTime: 108025},
// 			{imagePath: "/textures/lyrics/12.gif", duration: 4530, startTime: 114023},
// 			{imagePath: "/textures/lyrics/13.gif", duration: 4530, startTime: 119029},

// 			{imagePath: "/textures/lyrics/14.gif", duration: 4530, startTime: 126000},
// 			{imagePath: "/textures/lyrics/15.gif", duration: 4530, startTime: 131280},
// 			{imagePath: "/textures/lyrics/16.gif", duration: 4530, startTime: 136280},

// 			{imagePath: "/textures/lyrics/17.gif", duration: 4530, startTime: 152170},
// 			{imagePath: "/textures/lyrics/18.gif", duration: 4530, startTime: 158190},
// 			{imagePath: "/textures/lyrics/19.gif", duration: 4530, startTime: 164080},
// 			{imagePath: "/textures/lyrics/20.gif", duration: 4530, startTime: 169150},
// 			{imagePath: "/textures/lyrics/21.gif", duration: 4530, startTime: 179080},

// 			{imagePath: "/textures/lyrics/22.gif", duration: 4530, startTime: 184160},
// 			{imagePath: "/textures/lyrics/23.gif", duration: 4530, startTime: 189170},
// 			{imagePath: "/textures/lyrics/24.gif", duration: 4530, startTime: 195110},

// 			{imagePath: "/textures/lyrics/25.gif", duration: 4530, startTime: 201120},
// 			{imagePath: "/textures/lyrics/26.gif", duration: 4530, startTime: 207090},
// 			{imagePath: "/textures/lyrics/27.gif", duration: 4530, startTime: 213100},
// 			{imagePath: "/textures/lyrics/28.gif", duration: 4530, startTime: 218090}
// 	];
// 	var counter = images.length;
// 	images.forEach(function(image){
// 		console.log(image);
// 		var self = this;
		
// 		var loader = new Image();
		
// 		loader.addEventListener('load', function(){
// 			counter--;
// 			console.log(counter);
// 			image.obj = loader;
// 			if(counter === 0) imagesLoaded = true;
// 		});

// 		loader.src = image.imagePath;

		
// 	}, this);
// };

App.prototype.init = function(){
	window.addEventListener('resize', function(){
		if(window.innerWidth < 840) self.camera.position.set( 10, 120, 0 );
		if(window.innerWidth < 530) self.camera.position.set( 20, 140, 0 );
		if(window.innerWidth >= 840) self.camera.position.set( 10, 65, 0 );
		self.camera.aspect = window.innerWidth / window.innerHeight;
		self.camera.updateProjectionMatrix();
		self.renderer.setSize( window.innerWidth, window.innerHeight );
	});
	// this.addLyrics();
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
