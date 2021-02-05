/**
 * @author Karim Barth
 */

ROS3D.HeightMap = function(options) {
  options = options || {};
  var data = options.data || [];
  var width = options.width || 0;
  var height = options.height || 0;

  var planeGeometry = new THREE.PlaneGeometry(width, height, width - 1 , height -1);
  var uintData = new Uint8Array( data.map(value => value + 128) );

  var texture = new THREE.DataTexture( uintData, width, height, THREE.RedFormat );
  var uniforms = {
    bumpTexture: { type: 't', value: texture},
    bumpScale: { type: 'f', value: 0.01 },
    minHeight: { type: 'f', value: -50.0 },
    maxHeight: { type: 'f', value: 127.0 },
  };

  var heightmapVertexShader = `
    uniform sampler2D bumpTexture;
    uniform float bumpScale;
    uniform float minHeight;
    uniform float maxHeight;
    
    varying float cellHeight;
    
    void main() {
      vec4 bumpData = texture2D( bumpTexture, uv );  
      cellHeight = clamp((bumpData.r * 255.0)-128.0, minHeight, maxHeight);
      // move the position along the normal
      vec3 newPosition = position + normal * bumpScale * cellHeight;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
    }
  `;

  var heightmapFragmentShader = `
    uniform sampler2D bumpTexture;
    uniform float bumpScale;
    uniform float minHeight;
    uniform float maxHeight;
    
    varying float cellHeight;
    
    void main() {
      vec4 bumpData = texture2D( bumpTexture, uv );  
      cellHeight = clamp((bumpData.r * 255.0)-128.0, minHeight, maxHeight);
      // move the position along the normal
      vec3 newPosition = position + normal * bumpScale * cellHeight;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
    }
  `;

  var shaderMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: heightmapVertexShader,
    fragmentShader: heightmapFragmentShader,
    side: THREE.DoubleSide,
  });

  THREE.Mesh.call(this, planeGeometry, shaderMaterial);
  Object.assign(this, options);

  this.material = shaderMaterial;
  this.texture = texture;
  texture.needsUpdate = true;

  this.isHeightmap = true;

};

ROS3D.HeightMap.prototype.dispose = function() {
  this.material.dispose();
  this.texture.dispose();
};

ROS3D.HeightMap.prototype.__proto__ = THREE.Mesh.prototype;
