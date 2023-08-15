import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class ThreeScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  // private clickedObject: THREE.Object3D | null = null;

  // const app = new Three('#yourContainer'); // 替换成您的容器选择器或 DOM 元素
  constructor(container: string | HTMLElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    

    this.initScene();
    this.initLight();
    this.initControls();

    const element = typeof container === 'string' ? document.querySelector(container) : container;
    if (element) {
      element.appendChild(this.renderer.domElement);
    } else {
      document.body.appendChild(this.renderer.domElement);
    }

    window.addEventListener('resize', this.onWindowResize.bind(this), false);

    this.animate();

    // mock cube
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    this.scene.add( cube );

  }

  private initScene() {
    this.scene.background = new THREE.Color(0xaaaaaa);
  }
  private initLight() {
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 0.5).normalize();
    this.scene.add(directionalLight);
  }

  private initControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();
  }

  private onWindowResize() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    this.camera.aspect = newWidth / newHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(newWidth, newHeight);
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }

  // app.initMouseInteraction((object) => {
  //   // 在这里进行下一步的交互处理，使用传递的交互的对象
  //   console.log('Clicked on:', object);
  // });
  public initMouseInteraction(onObjectClick: (object: THREE.Object3D) => void) {
    window.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('click', () => {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        // this.clickedObject = object; // 保存交互的对象
        onObjectClick(object); // 调用回调函数传递交互的对象
      }
    });
  }

  // three.initModel(
  //   'https://example.com/path/to/your/model.gltf', // 替换成实际的模型 URL
  //   (progress) => {
  //     // 提取加载进度信息并处理
  //     if (progress.lengthComputable) {
  //       const percentComplete = (progress.loaded / progress.total) * 100;
  //       console.log('Loading progress:', percentComplete.toFixed(2) + '%');
  //     } else {
  //       console.log('Loading progress:', 'unknown');
  //     }
  //   },
  //   () => {
  //     // 加载完成回调，您可以在这里执行一些操作
  //     console.log('Model loaded.');
  //   }
  // );
  public initModel(url: string, onProgress: (progress: ProgressEvent<EventTarget>) => void, onComplete: () => void) {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        gltf.scene.scale.setScalar(0.1);
        this.scene.add(gltf.scene);
        onComplete();
      },
      onProgress,
      (error) => {
        console.error('Error loading model:', error);
      }
    );
  }

  public destroy() {
    window.removeEventListener('resize', this.onWindowResize.bind(this), false);
  }
}