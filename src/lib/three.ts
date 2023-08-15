import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';

export class Three {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private domElement: HTMLElement
  private stats: Stats
  private loadedObject?: THREE.Scene | THREE.Mesh | THREE.Group
  // private clickedObject: THREE.Object3D | null = null;

  // const three = new Three('#yourContainer'); // 替换成您的容器选择器或 DOM 元素
  // 构造函数
  constructor(container: string | HTMLElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // 增加抗锯齿 提升画质
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.domElement = typeof container === 'string' ? document.querySelector(container)! : container;
    this.initScene();
    this.initLight();
    this.initControls();
    this.loadModel('/models/SheenChair.glb')

    this.renderer.setSize(this.domElement.clientWidth, this.domElement.clientHeight);

    this.domElement.appendChild(this.renderer.domElement);
    // 增加FPS显示器
    this.stats = new Stats();
    this.domElement.appendChild( this.stats.dom );
    this.stats.dom.style.position = 'absolute';

    window.addEventListener('resize', this.onWindowResize.bind(this), false);

    this.animate();

    // mock cube
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    cube.name = 'cube_mock'
    cube.position.x = -1
    this.scene.add( cube );

    // 设置相机初始位置
    this.camera.position.z = 5;

  }

  // 初始化场景
  private initScene() {
    this.scene.background = new THREE.Color(0xf0f0f0);
  }
  // 初始化灯光
  private initLight() {
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 100, 50).normalize();
    this.scene.add(directionalLight);
  }

  // 鼠标控制
  private initControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();
  }

  // 窗口发生变化时重绘
  private onWindowResize() {
    const newWidth = this.domElement.clientWidth;
    const newHeight = this.domElement.clientHeight;

    this.camera.aspect = newWidth / newHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(newWidth, newHeight);
  }

  // 渲染loop
  private animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
    // 更新FPS监视器
    this.stats.update();
  }

  // 通过激光实现鼠标交互
  public initMouseInteraction(onObjectClick: (object: THREE.Object3D) => void) {
    window.addEventListener('mousemove', (event) => {
      const rect = this.domElement.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / this.domElement.clientWidth) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / this.domElement.clientHeight) * 2 + 1;
    });

    // 公共监听鼠标点击事件
    window.addEventListener('click', () => {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object instanceof THREE.Mesh) {
          object.material.color = new THREE.Color(Math.random(), Math.random(), Math.random());
          // this.clickedObject = object; // 保存交互的对象
          onObjectClick(object); // 调用回调函数传递交互的对象
        }
      }
    });
  }
  
  // 加载模型方法
  public loadModel(url: string, onProgress?: (progress: ProgressEvent<EventTarget>) => void, onComplete?: () => void) {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        // 删除已加载好的模型
        if (this.loadedObject) {
          this.removeObjectByNameOrObject('cube_mock')
          this.removeObjectByNameOrObject(this.loadedObject)
        }
        gltf.scene.scale.setScalar(1);
        this.scene.add(gltf.scene);
        this.loadedObject = gltf.scene
        if (onComplete) {
          onComplete();
        }
      },
      onProgress,
      (error) => {
        console.error('Error loading model:', error);
      }
    );
  }
  // 删除一个物体
  private removeObjectByNameOrObject(target: string | THREE.Mesh | THREE.Scene | THREE.Group) {
    let objectToRemove = null;

    if (typeof target === 'string') {
      objectToRemove = this.scene.getObjectByName(target);
    } else if (target instanceof THREE.Object3D) {
      objectToRemove = target;
    }

    if (objectToRemove) {
      this.scene.remove(objectToRemove);
    }
  }

  // 销毁时需要做的事
  public destroy() {
    window.removeEventListener('resize', this.onWindowResize.bind(this), false);
  }
}