import * as THREE from 'three';

export class Game {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;

    private cube: THREE.Mesh;
    private animationId: number | null = null;
    private resizeObserver: ResizeObserver;

    private container: HTMLElement

    constructor(
        container: HTMLElement
    ) {
        this.container = container;

        // Cena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);

        // Câmera com projeção perspectiva
        this.camera = new THREE.PerspectiveCamera(
            75,
            1,
            0.1,
            1000
        );

        this.camera.position.set(8, 8, 10);
        this.camera.lookAt(0, 0, 0);

        // Renderizador
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        });

        this.renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        );

        this.container.appendChild(this.renderer.domElement);

        // Chão
        const groundGeometry = new THREE.PlaneGeometry(20, 20);

        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x4c9b55,
        });

        const ground = new THREE.Mesh(
            groundGeometry,
            groundMaterial
        );

        ground.rotation.x = -Math.PI / 2;
        this.scene.add(ground);

        // Grade para visualizar o espaço
        const grid = new THREE.GridHelper(20, 20);
        this.scene.add(grid);

        // Iluminação ambiente
        const ambientLight = new THREE.AmbientLight(
            0xffffff,
            0.6
        );

        this.scene.add(ambientLight);

        // Luz direcional
        const directionalLight = new THREE.DirectionalLight(
            0xffffff,
            1
        );

        directionalLight.position.set(5, 10, 5);
        this.scene.add(directionalLight);

        // Cubo temporário para teste
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

        const cubeMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
        });

        this.cube = new THREE.Mesh(
            cubeGeometry,
            cubeMaterial
        );

        this.cube.position.y = 0.5;
        this.scene.add(this.cube);

        // Ajuste inicial do tamanho
        this.resize();

        // Observa alterações no tamanho do container
        this.resizeObserver = new ResizeObserver(() => {
            this.resize();
        });

        this.resizeObserver.observe(this.container);
    }

    private resize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        if (!width || !height) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    start() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);

            this.cube.rotation.y += 0.01;

            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }

    dispose() {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
        }

        this.resizeObserver.disconnect();

        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.geometry.dispose();

                const materials = Array.isArray(object.material)
                    ? object.material
                    : [object.material];

                materials.forEach((material) => material.dispose());
            }

            if (object instanceof THREE.GridHelper) {
                object.geometry.dispose();

                const materials = Array.isArray(object.material)
                    ? object.material
                    : [object.material];

                materials.forEach((material) => material.dispose());
            }
        });

        this.renderer.dispose();
        this.renderer.domElement.remove();
    }
}
