import * as THREE from 'three';

import { Arena } from './Arena';
import { Portal } from './Portal';
import { Collectibles } from './Collectibles';
import { Player } from './Player';
import { Enemy } from './Enemy';

export type GameStatus = 'playing' | 'gameover' | 'victory';

export interface GameUIState {
    collectedCrystals: number;
    totalCrystals: number;
    enemyActivated: boolean;
    status: GameStatus;
}

export class Game {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;

    private onStateChange: (state: GameUIState) => void;
    private isGameOver = false;
    private isVictory = false;

    private arena: Arena;
    private portal: Portal;
    private collectibles: Collectibles;
    private collectedCrystals = 0;
    private player: Player;
    private enemy: Enemy;
    private enemyActivated = false;
    private animationId: number | null = null;
    private resizeObserver: ResizeObserver;
    private timer = new THREE.Timer();

    private container: HTMLElement

    constructor(
        container: HTMLElement,
        onStateChange: (state: GameUIState) => void,
    ) {
        this.container = container;
        this.onStateChange = onStateChange;

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

        // Criação do portal
        this.portal = new Portal();
        this.scene.add(this.portal.group);

        // Criação dos cristais colecionáveis.
        this.collectibles = new Collectibles();
        this.scene.add(this.collectibles.group);

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

            if (!this.isGameOver && !this.isVictory) {
                // Atualiza o jogador.
                this.player.update(
                    deltaTime,
                    this.camera,
                    this.arena.getCollisionBoxes()
                );

                // Atualiza o portal
                this.portal.update(deltaTime);

                // Atualiza os cristais.
                const newlyCollected = this.collectibles.update(
                    deltaTime,
                    this.player.group.position
                );

                if (newlyCollected > 0) {
                    this.collectedCrystals += newlyCollected;

                    console.log(
                        `Cristais coletados: ${this.collectedCrystals}/${this.collectibles.getTotalCount()}`
                    );

                    if (this.collectedCrystals >= 3 && !this.enemyActivated) {
                        this.enemy.activate();
                        this.enemyActivated = true;

                        console.log('O dinossauro despertou!');
                    }

                    if (this.collectedCrystals >= 5) {
                        this.portal.activate();

                        console.log('O portal foi ativado!');
                    }

                    // Notifica o React após qualquer coleta.
                    this.notifyStateChange();
                }

                // Atualiza o dinossauro.
                if (this.enemyActivated) {
                    this.enemy.update(
                        deltaTime,
                        this.player.group.position,
                        this.arena.group.children
                    );

                    // Verifica se o dinossauro alcançou o jogador.
                    if (this.checkEnemyCollision()) {
                        this.isGameOver = true;
                        console.log('GAME OVER! O dinossauro alcançou você!');
                    }

                    if (!this.isGameOver && this.portal.isPlayerNear(this.player.group.position)) {
                        this.isVictory = true;
                        console.log('VITÓRIA! Você escapou da arena!');

                        this.notifyStateChange();
                    }
                }
            }

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

    private notifyStateChange() {
        let status: GameStatus = 'playing';

        if (this.isGameOver) {
            status = 'gameover';
        } else if (this.isVictory) {
            status = 'victory';
        }

        const state: GameUIState = {
            collectedCrystals: this.collectedCrystals,
            totalCrystals: this.collectibles.getTotalCount(),
            enemyActivated: this.enemyActivated,
            status,
        };

        console.log('Enviando estado para React:', state);

        this.onStateChange(state);
    }

    private checkEnemyCollision(): boolean {
        const playerBox = new THREE.Box3().setFromObject(
            this.player.group
        );

        const enemyBox = new THREE.Box3().setFromObject(
            this.enemy.group
        );

        return playerBox.intersectsBox(enemyBox);
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
