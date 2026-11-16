import * as THREE from 'three';

export class Player {
    public readonly group: THREE.Group;

    private leftArm: THREE.Group;
    private rightArm: THREE.Group;
    private leftLeg: THREE.Group;
    private rightLeg: THREE.Group;

    private isMoving = false;
    private walkTime = 0;

    constructor() {
        this.group = new THREE.Group();

        // Materiais
        const skinMaterial = new THREE.MeshStandardMaterial({
            color: 0xe8b58d,
            roughness: 0.9,
        });

        const hairMaterial = new THREE.MeshStandardMaterial({
            color: 0x513323,
            roughness: 1,
        });

        const shirtMaterial = new THREE.MeshStandardMaterial({
            color: 0x477b54,
            roughness: 0.9,
        });

        const pantsMaterial = new THREE.MeshStandardMaterial({
            color: 0x35445e,
            roughness: 0.9,
        });

        const bootMaterial = new THREE.MeshStandardMaterial({
            color: 0x49301f,
            roughness: 1,
        });

        const backpackMaterial = new THREE.MeshStandardMaterial({
            color: 0x9b6338,
            roughness: 1,
        });

        const beltMaterial = new THREE.MeshStandardMaterial({
            color: 0x49301f,
            roughness: 1,
        });

        const eyeMaterial = new THREE.MeshStandardMaterial({
            color: 0x252525,
        });

        // Função auxiliar para criar partes do personagem
        const createPart = (
            geometry: THREE.BufferGeometry,
            material: THREE.Material,
            position: THREE.Vector3,
            parent: THREE.Group = this.group
        ) => {
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.copy(position);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            parent.add(mesh);

            return mesh;
        };

        // Tronco
        createPart(
            new THREE.BoxGeometry(0.85, 0.95, 0.5),
            shirtMaterial,
            new THREE.Vector3(0, 1.65, 0)
        );

        // Cinto
        createPart(
            new THREE.BoxGeometry(0.87, 0.13, 0.53),
            beltMaterial,
            new THREE.Vector3(0, 1.18, 0)
        );

        // Fivela
        createPart(
            new THREE.BoxGeometry(0.16, 0.13, 0.04),
            new THREE.MeshStandardMaterial({
                color: 0xe0b44e,
                metalness: 0.5,
                roughness: 0.5,
            }),
            new THREE.Vector3(0, 1.18, 0.28)
        );

        // Cabeça
        createPart(
            new THREE.SphereGeometry(0.36, 8, 6),
            skinMaterial,
            new THREE.Vector3(0, 2.43, 0)
        );

        // Cabelo
        const hair = createPart(
            new THREE.SphereGeometry(0.37, 8, 6),
            hairMaterial,
            new THREE.Vector3(0, 2.55, -0.04)
        );

        // Parte inferior do cabelo
        hair.scale.set(1.05, 0.85, 1.05);

        // Franja
        createPart(
            new THREE.BoxGeometry(0.5, 0.16, 0.22),
            hairMaterial,
            new THREE.Vector3(0, 2.68, 0.25)
        );

        // Olhos
        for (const x of [-0.12, 0.12]) {
            createPart(
                new THREE.SphereGeometry(0.035, 6, 6),
                eyeMaterial,
                new THREE.Vector3(x, 2.46, 0.325)
            );
        }

        // Mochila
        createPart(
            new THREE.BoxGeometry(0.58, 0.7, 0.3),
            backpackMaterial,
            new THREE.Vector3(0, 1.7, -0.37)
        );

        // Bolso da mochila
        createPart(
            new THREE.BoxGeometry(0.34, 0.25, 0.08),
            beltMaterial,
            new THREE.Vector3(0, 1.58, -0.56)
        );

        // Braços articulados
        this.leftArm = this.createArm(
            -1,
            skinMaterial,
            shirtMaterial,
            createPart
        );

        this.rightArm = this.createArm(
            1,
            skinMaterial,
            shirtMaterial,
            createPart
        );

        // Pernas articuladas
        this.leftLeg = this.createLeg(
            -1,
            pantsMaterial,
            bootMaterial,
            createPart
        );

        this.rightLeg = this.createLeg(
            1,
            pantsMaterial,
            bootMaterial,
            createPart
        );

        // Altura e posição inicial
        this.group.position.set(0, 0, 0);
    }

    private createArm(
        side: number,
        skinMaterial: THREE.Material,
        shirtMaterial: THREE.Material,
        createPart: (
            geometry: THREE.BufferGeometry,
            material: THREE.Material,
            position: THREE.Vector3,
            parent?: THREE.Group
        ) => THREE.Mesh
    ) {
        const arm = new THREE.Group();

        arm.position.set(side * 0.48, 2.05, 0);

        this.group.add(arm);

        // Braço superior
        createPart(
            new THREE.BoxGeometry(0.24, 0.5, 0.28),
            shirtMaterial,
            new THREE.Vector3(0, -0.25, 0),
            arm
        );

        // Antebraço
        createPart(
            new THREE.BoxGeometry(0.2, 0.42, 0.23),
            skinMaterial,
            new THREE.Vector3(0, -0.68, 0),
            arm
        );

        // Mão
        createPart(
            new THREE.SphereGeometry(0.13, 6, 5),
            skinMaterial,
            new THREE.Vector3(0, -0.94, 0),
            arm
        );

        return arm;
    }

    private createLeg(
        side: number,
        pantsMaterial: THREE.Material,
        bootMaterial: THREE.Material,
        createPart: (
            geometry: THREE.BufferGeometry,
            material: THREE.Material,
            position: THREE.Vector3,
            parent?: THREE.Group
        ) => THREE.Mesh
    ) {
        const leg = new THREE.Group();

        leg.position.set(side * 0.23, 1.05, 0);

        this.group.add(leg);

        // Perna
        createPart(
            new THREE.BoxGeometry(0.32, 0.85, 0.35),
            pantsMaterial,
            new THREE.Vector3(0, -0.3, 0),
            leg
        );

        // Bota
        createPart(
            new THREE.BoxGeometry(0.34, 0.25, 0.48),
            bootMaterial,
            new THREE.Vector3(0, -0.83, 0.07),
            leg
        );

        return leg;
    }

    public update(deltaTime: number) {
        if (!this.isMoving) {
            // Retorna os membros à posição original
            this.leftArm.rotation.x = THREE.MathUtils.lerp(
                this.leftArm.rotation.x,
                0,
                0.15
            );

            this.rightArm.rotation.x = THREE.MathUtils.lerp(
                this.rightArm.rotation.x,
                0,
                0.15
            );

            this.leftLeg.rotation.x = THREE.MathUtils.lerp(
                this.leftLeg.rotation.x,
                0,
                0.15
            );

            this.rightLeg.rotation.x = THREE.MathUtils.lerp(
                this.rightLeg.rotation.x,
                0,
                0.15
            );

            return;
        }

        this.walkTime += deltaTime * 8;

        const movement = Math.sin(this.walkTime) * 0.5;

        this.leftArm.rotation.x = movement;
        this.rightArm.rotation.x = -movement;

        this.leftLeg.rotation.x = -movement;
        this.rightLeg.rotation.x = movement;
    }

    public setMoving(moving: boolean) {
        this.isMoving = moving;
    }
}
