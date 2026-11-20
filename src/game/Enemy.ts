import * as THREE from 'three';

const EnemyState = {
    Patrolling: 0,
    Chasing: 1,
    Searching: 2,
} as const;

type EnemyState =
    typeof EnemyState[keyof typeof EnemyState];

export class Enemy {
    public readonly group: THREE.Group;

    private leftLeg: THREE.Group;
    private rightLeg: THREE.Group;
    private leftArm: THREE.Group;
    private rightArm: THREE.Group;
    private tail: THREE.Group;
    private jaw: THREE.Group;

    private walkTime = 0;
    private isMoving = false;
    private animationSpeed = 5;

    private patrolPoints: THREE.Vector3[] = [
        new THREE.Vector3(-12, 0, -12),
        new THREE.Vector3(12, 0, -12),
        new THREE.Vector3(12, 0, 12),
        new THREE.Vector3(-12, 0, 12),
    ];

    private currentPatrolPoint = 0;
    private patrolSpeed = 1.5;
    private arrivalDistance = 0.4;

    private state: EnemyState = EnemyState.Patrolling;

    private chaseSpeed = 4.5;
    private detectionRadius = 18;

    private direction = new THREE.Vector3();

    private lastKnownPlayerPosition = new THREE.Vector3();

    private searchTimer = 0;
    private searchDuration = 5;
    private searchArrivalDistance = 0.5;
    private hasReachedSearchPosition = false;

    private raycaster = new THREE.Raycaster();

    private visionHeights = [0.5, 1.5, 2.5];
    private visionDirection = new THREE.Vector3();

    constructor() {
        this.group = new THREE.Group();
        this.group.visible = false;

        const skinMaterial = new THREE.MeshStandardMaterial({
            color: 0x465b38,
            roughness: 0.95,
        });

        const bellyMaterial = new THREE.MeshStandardMaterial({
            color: 0x9b9165,
            roughness: 1,
        });

        const darkMaterial = new THREE.MeshStandardMaterial({
            color: 0x293a29,
            roughness: 1,
        });

        const eyeMaterial = new THREE.MeshStandardMaterial({
            color: 0xff8c24,
            emissive: 0x8a3000,
            emissiveIntensity: 0.8,
        });

        const teethMaterial = new THREE.MeshStandardMaterial({
            color: 0xe8dfc7,
            roughness: 0.8,
        });

        const createPart = (
            geometry: THREE.BufferGeometry,
            material: THREE.Material,
            position: THREE.Vector3,
            parent: THREE.Group = this.group,
            scale?: THREE.Vector3
        ) => {
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.copy(position);

            if (scale) {
                mesh.scale.copy(scale);
            }

            mesh.castShadow = true;
            mesh.receiveShadow = true;

            parent.add(mesh);

            return mesh;
        };

        // Corpo principal
        createPart(
            new THREE.SphereGeometry(1, 10, 8),
            skinMaterial,
            new THREE.Vector3(0, 2, 0),
            this.group,
            new THREE.Vector3(0.9, 0.85, 1.35)
        );

        // Barriga
        createPart(
            new THREE.SphereGeometry(1, 8, 6),
            bellyMaterial,
            new THREE.Vector3(0, 1.65, 0.15),
            this.group,
            new THREE.Vector3(0.72, 0.48, 0.95)
        );

        // Peito
        createPart(
            new THREE.SphereGeometry(0.7, 8, 6),
            skinMaterial,
            new THREE.Vector3(0, 2.35, 0.65),
            this.group,
            new THREE.Vector3(1.05, 1.1, 0.9)
        );

        // Pescoço
        const neck = createPart(
            new THREE.CylinderGeometry(0.38, 0.65, 1.15, 7),
            skinMaterial,
            new THREE.Vector3(0, 2.65, 1.15)
        );

        neck.rotation.x = -0.45;

        // Cabeça
        createPart(
            new THREE.BoxGeometry(1.05, 0.85, 1.15),
            skinMaterial,
            new THREE.Vector3(0, 3.15, 1.75)
        );

        // Focinho
        createPart(
            new THREE.BoxGeometry(0.95, 0.4, 0.85),
            skinMaterial,
            new THREE.Vector3(0, 2.98, 2.45)
        );

        // Mandíbula articulada
        this.jaw = new THREE.Group();
        this.jaw.position.set(0, 2.85, 2.05);
        this.group.add(this.jaw);

        createPart(
            new THREE.BoxGeometry(0.9, 0.22, 1.1),
            darkMaterial,
            new THREE.Vector3(0, -0.12, 0.45),
            this.jaw
        );

        // Dentes superiores e inferiores
        for (const side of [-1, 1]) {
            for (let i = 0; i < 3; i++) {
                const tooth = createPart(
                    new THREE.ConeGeometry(0.09, 0.25, 5),
                    teethMaterial,
                    new THREE.Vector3(
                        side * 0.4,
                        2.88,
                        2.15 + i * 0.25
                    )
                );

                tooth.rotation.x = Math.PI;
            }
        }

        // Olhos
        for (const side of [-1, 1]) {
            createPart(
                new THREE.SphereGeometry(0.12, 8, 6),
                eyeMaterial,
                new THREE.Vector3(
                    side * 0.52,
                    3.35,
                    1.95
                )
            );
        }

        // Narinas
        for (const side of [-1, 1]) {
            createPart(
                new THREE.SphereGeometry(0.055, 6, 5),
                darkMaterial,
                new THREE.Vector3(
                    side * 0.23,
                    3.12,
                    2.85
                )
            );
        }

        // Cauda
        this.tail = new THREE.Group();
        this.tail.position.set(0, 2, -1.05);
        this.group.add(this.tail);

        const tailMesh = createPart(
            new THREE.ConeGeometry(0.48, 2.1, 7),
            skinMaterial,
            new THREE.Vector3(0, 0, -0.9),
            this.tail
        );

        tailMesh.rotation.x = -Math.PI / 2;

        // Pernas
        this.leftLeg = this.createLeg(
            -1, skinMaterial, darkMaterial, createPart
        );

        this.rightLeg = this.createLeg(
            1, skinMaterial, darkMaterial, createPart
        );

        // Braços pequenos
        this.leftArm = this.createArm(
            -1, skinMaterial, darkMaterial, createPart
        );

        this.rightArm = this.createArm(
            1, skinMaterial, darkMaterial, createPart
        );

        this.group.scale.setScalar(3);

        this.group.position.set(0, 0, 0);
    }

    private createLeg(
        side: number,
        skinMaterial: THREE.Material,
        footMaterial: THREE.Material,
        createPart: (
            geometry: THREE.BufferGeometry,
            material: THREE.Material,
            position: THREE.Vector3,
            parent?: THREE.Group,
            scale?: THREE.Vector3
        ) => THREE.Mesh
    ) {
        const leg = new THREE.Group();

        leg.position.set(side * 0.48, 1.15, 0.1);
        this.group.add(leg);

        createPart(
            new THREE.CylinderGeometry(0.28, 0.22, 0.9, 7),
            skinMaterial,
            new THREE.Vector3(0, -0.35, 0),
            leg
        );

        createPart(
            new THREE.BoxGeometry(0.55, 0.25, 0.65),
            footMaterial,
            new THREE.Vector3(0, -0.82, 0.18),
            leg
        );

        // Garras dos pés
        for (let i = -1; i <= 1; i++) {
            createPart(
                new THREE.ConeGeometry(0.07, 0.22, 5),
                footMaterial,
                new THREE.Vector3(i * 0.16, -0.84, 0.52),
                leg
            );
        }

        return leg;
    }

    private createArm(
        side: number,
        skinMaterial: THREE.Material,
        clawMaterial: THREE.Material,
        createPart: (
            geometry: THREE.BufferGeometry,
            material: THREE.Material,
            position: THREE.Vector3,
            parent?: THREE.Group,
            scale?: THREE.Vector3
        ) => THREE.Mesh
    ) {
        const arm = new THREE.Group();

        arm.position.set(side * 0.78, 2.35, 0.9);
        this.group.add(arm);

        createPart(
            new THREE.CylinderGeometry(0.12, 0.16, 0.48, 6),
            skinMaterial,
            new THREE.Vector3(0, -0.2, 0),
            arm
        );

        createPart(
            new THREE.SphereGeometry(0.14, 6, 5),
            skinMaterial,
            new THREE.Vector3(0, -0.43, 0.05),
            arm
        );

        // Garras das mãos
        for (let i = -1; i <= 1; i++) {
            createPart(
                new THREE.ConeGeometry(0.055, 0.18, 5),
                clawMaterial,
                new THREE.Vector3(i * 0.09, -0.52, 0.12),
                arm
            );
        }

        return arm;
    }

    public update(deltaTime: number, playerPosition: THREE.Vector3, obstacles: THREE.Object3D[]) {
        const distanceToPlayer = Math.hypot(
            playerPosition.x - this.group.position.x,
            playerPosition.z - this.group.position.z
        );

        // O inimigo detectou o jogador.
        if (distanceToPlayer <= this.detectionRadius && this.canSeePlayer(playerPosition, obstacles)) {
            this.state = EnemyState.Chasing;

            // Atualiza constantemente a última posição conhecida.
            this.lastKnownPlayerPosition.copy(playerPosition);
        }
        // O inimigo estava perseguindo, mas perdeu o jogador.
        else if (this.state === EnemyState.Chasing) {
            this.state = EnemyState.Searching;
            this.searchTimer = 0;
            this.hasReachedSearchPosition = false;
        }

        // Executa o comportamento correspondente ao estado atual.
        switch (this.state) {
            case EnemyState.Patrolling:
                this.patrol(deltaTime);
                break;

            case EnemyState.Chasing:
                this.chase(playerPosition, deltaTime);
                break;

            case EnemyState.Searching:
                this.search(deltaTime);
                break;
        }

        this.updateAnimation(deltaTime);
    }

    public setMoving(moving: boolean) {
        this.isMoving = moving;
    }

    private patrol(deltaTime: number) {
        const target = this.patrolPoints[this.currentPatrolPoint];

        // Calcula a direção até o próximo ponto.
        const direction = new THREE.Vector3()
            .subVectors(target, this.group.position);

        direction.y = 0;

        const distance = direction.length();

        // Verifica se chegou ao destino.
        if (distance <= this.arrivalDistance) {
            this.currentPatrolPoint =
                (this.currentPatrolPoint + 1) % this.patrolPoints.length;

            this.setMoving(false);
            return;
        }

        direction.normalize();

        // Movimenta o inimigo.
        this.group.position.addScaledVector(
            direction,
            this.patrolSpeed * deltaTime
        );

        // Faz o inimigo olhar para a direção do movimento.
        this.group.rotation.y = Math.atan2(
            direction.x,
            direction.z
        );

        this.setMoving(true);
    }

    private chase(playerPosition: THREE.Vector3, deltaTime: number) {
        this.direction.subVectors(playerPosition, this.group.position);

        this.direction.y = 0;

        const distance = this.direction.length();

        if (distance === 0) {
            this.setMoving(false);
            return;
        }

        this.direction.normalize();

        // Movimenta a criatura em direção ao jogador.
        const movement = Math.min(
            this.chaseSpeed * deltaTime,
            distance
        );

        this.group.position.addScaledVector(
            this.direction,
            movement
        );

        // Faz a criatura olhar para o jogador.
        this.group.rotation.y = Math.atan2(
            this.direction.x,
            this.direction.z
        );

        this.setMoving(true);
    }

    private updateAnimation(deltaTime: number) {
        if (this.isMoving) {
            this.walkTime += deltaTime * this.animationSpeed;

            const movement = Math.sin(this.walkTime) * 0.45;

            this.leftLeg.rotation.x = movement;
            this.rightLeg.rotation.x = -movement;

            this.leftArm.rotation.x = -movement * 0.5;
            this.rightArm.rotation.x = movement * 0.5;

            this.tail.rotation.y = Math.sin(this.walkTime * 0.5) * 0.18;

            this.jaw.rotation.x = Math.max(
                0,
                Math.sin(this.walkTime * 2)
            ) * 0.08;

        } else {
            const smoothing = 1 - Math.exp(-5 * deltaTime);

            this.leftLeg.rotation.x = THREE.MathUtils.lerp(
                this.leftLeg.rotation.x, 0, smoothing
            );

            this.rightLeg.rotation.x = THREE.MathUtils.lerp(
                this.rightLeg.rotation.x, 0, smoothing
            );

            this.leftArm.rotation.x = THREE.MathUtils.lerp(
                this.leftArm.rotation.x, 0, smoothing
            );

            this.rightArm.rotation.x = THREE.MathUtils.lerp(
                this.rightArm.rotation.x, 0, smoothing
            );

            this.tail.rotation.y = THREE.MathUtils.lerp(
                this.tail.rotation.y, 0, smoothing
            );

            this.jaw.rotation.x = THREE.MathUtils.lerp(
                this.jaw.rotation.x, 0, smoothing
            );
        }
    }

    private search(deltaTime: number) {
        // Enquanto não chegou à última posição conhecida,
        // continua se deslocando até ela.
        if (!this.hasReachedSearchPosition) {
            this.direction.subVectors(
                this.lastKnownPlayerPosition,
                this.group.position
            );

            this.direction.y = 0;

            const distance = this.direction.length();

            if (distance > this.searchArrivalDistance) {
                this.direction.normalize();

                const movement = Math.min(
                    this.patrolSpeed * deltaTime,
                    distance
                );

                this.group.position.addScaledVector(
                    this.direction,
                    movement
                );

                this.group.rotation.y = Math.atan2(
                    this.direction.x,
                    this.direction.z
                );

                this.setMoving(true);

                return;
            }

            // Chegou à posição investigada.
            this.hasReachedSearchPosition = true;
            this.setMoving(false);
        }

        // Permanece no local procurando durante alguns segundos.
        this.searchTimer += deltaTime;

        // Gira lentamente para simular que está procurando.
        this.group.rotation.y += deltaTime * 0.8;

        if (this.searchTimer >= this.searchDuration) {
            this.state = EnemyState.Patrolling;
            this.searchTimer = 0;
            this.hasReachedSearchPosition = false;
        }
    }

    private canSeePlayer(playerPosition: THREE.Vector3, obstacles: THREE.Object3D[]): boolean {
        const origin = this.group.position.clone();
        origin.y += 2.5;

        /* const distance = origin.distanceTo(playerPosition); */

        this.visionDirection
            .subVectors(playerPosition, origin)
            .normalize();

        for (const height of this.visionHeights) {
            const target = playerPosition.clone();
            target.y += height;

            const direction = new THREE.Vector3()
                .subVectors(target, origin)
                .normalize();

            this.raycaster.set(origin, direction);
            this.raycaster.far = origin.distanceTo(target);

            const intersections = this.raycaster.intersectObjects(
                obstacles,
                true
            );

            if (intersections.length === 0) {
                return true;
            }
        }

        return false;
    }

    public activate() {
        this.group.visible = true;
        this.state = EnemyState.Patrolling;
    }
}
