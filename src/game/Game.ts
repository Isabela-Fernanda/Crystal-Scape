import * as THREE from 'three';

import { Arena } from './Arena';
import { Player } from './Player';
import { Enemy } from './Enemy';

export class Game {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;

    private arena: Arena;
    private player: Player;
    private enemy: Enemy;
    private animationId: number | null = null;
    private resizeObserver: ResizeObserver;
    private timer = new THREE.Timer();

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

        this.camera.position.set(0, 7, -8);
        this.camera.lookAt(0, 1.4, 0);

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

        // Criação do jogador
        this.player = new Player();
        this.scene.add(this.player.group);

        this.enemy = new Enemy();
        this.enemy.group.position.set(0, 0, -5);
        this.scene.add(this.enemy.group);

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

            this.timer.update();
            const deltaTime = this.timer.getDelta();

            this.player.update(deltaTime, this.camera, this.arena.getCollisionBoxes());

            this.enemy.update(deltaTime, this.player.group.position);

            this.updateCamera(deltaTime);

            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }

    private updateCamera(deltaTime: number) {
        const targetPosition = new THREE.Vector3(
            this.player.group.position.x,
            this.player.group.position.y + 7,
            this.player.group.position.z - 8
        );

        const smoothing = 1 - Math.exp(-5 * deltaTime);

        this.camera.position.lerp(targetPosition, smoothing);

        this.camera.lookAt(
            this.player.group.position.x,
            this.player.group.position.y + 1.4,
            this.player.group.position.z
        );
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

        this.player.dispose();
        this.renderer.dispose();
        this.renderer.domElement.remove();
    }
}
