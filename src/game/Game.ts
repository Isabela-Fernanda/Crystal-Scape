import * as THREE from 'three';

import { Arena } from './Arena';

export class Game {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;

    private arena: Arena;
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

        // Criação da arena
        this.arena = new Arena();
        this.scene.add(this.arena.group);

        // Iluminação ambiente
        const ambientLight = new THREE.AmbientLight(
            0xffffff,
            0.7
        );

        this.scene.add(ambientLight);

        // Luz hemisférica
        const hemisphereLight = new THREE.HemisphereLight(
            0xbde0ff,
            0x52613b,
            0.5
        );

        this.scene.add(hemisphereLight);

        // Luz direcional
        const directionalLight = new THREE.DirectionalLight(
            0xffffff,
            1.5
        );

        directionalLight.position.set(5, 12, 5);
        directionalLight.castShadow = true;

        this.scene.add(directionalLight);

        directionalLight.position.set(5, 10, 5);
        this.scene.add(directionalLight);

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
