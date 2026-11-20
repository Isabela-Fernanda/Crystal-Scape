import * as THREE from 'three';

interface Crystal {
    group: THREE.Group;
    collected: boolean;
    animationOffset: number;
}

export class Collectibles {
    public readonly group: THREE.Group;

    private crystals: Crystal[] = [];

    private readonly collectionDistance = 1.5;

    private readonly positions: [number, number][] = [
        [-5, -15],
        [15, -5],
        [-15, 5],
        [0, 16],
        [-2, 8],
    ];

    private crystalMaterial: THREE.MeshStandardMaterial;
    private ringMaterial: THREE.MeshStandardMaterial;

    constructor() {
        this.group = new THREE.Group();

        this.crystalMaterial = new THREE.MeshStandardMaterial({
            color: 0x42d9ff,
            emissive: 0x0088cc,
            emissiveIntensity: 1.2,
            roughness: 0.25,
            metalness: 0.2,
        });

        this.ringMaterial = new THREE.MeshStandardMaterial({
            color: 0x9af0ff,
            emissive: 0x00aaff,
            emissiveIntensity: 0.8,
        });

        this.createCrystals();
    }

    private createCrystals() {
        this.positions.forEach(([x, z], index) => {
            const crystalGroup = new THREE.Group();

            // Corpo principal do cristal.
            const crystalGeometry = new THREE.OctahedronGeometry(
                0.65,
                0
            );

            const crystal = new THREE.Mesh(
                crystalGeometry,
                this.crystalMaterial
            );

            crystal.position.y = 1;
            crystal.scale.set(0.8, 1.3, 0.8);
            crystal.castShadow = true;

            crystalGroup.add(crystal);

            // Anel ao redor do cristal.
            const ringGeometry = new THREE.TorusGeometry(
                0.85,
                0.035,
                8,
                24
            );

            const ring = new THREE.Mesh(
                ringGeometry,
                this.ringMaterial
            );

            ring.position.y = 1;
            ring.rotation.x = Math.PI / 2;

            crystalGroup.add(ring);

            crystalGroup.position.set(x, 0, z);

            this.group.add(crystalGroup);

            this.crystals.push({
                group: crystalGroup,
                collected: false,
                animationOffset: index * 1.2,
            });
        });
    }

    public update(
        deltaTime: number,
        playerPosition: THREE.Vector3
    ): number {
        let newlyCollected = 0;

        this.crystals.forEach((crystal) => {
            if (crystal.collected) return;

            const crystalPosition = crystal.group.position;

            // Calcula a distância horizontal até o jogador.
            const distance = Math.hypot(
                playerPosition.x - crystalPosition.x,
                playerPosition.z - crystalPosition.z
            );

            // Verifica se o jogador está próximo o suficiente.
            if (distance <= this.collectionDistance) {
                crystal.collected = true;
                crystal.group.visible = false;

                newlyCollected++;
                return;
            }

            // Animação de rotação e flutuação.
            crystal.group.rotation.y += deltaTime;

            const crystalMesh = crystal.group.children[0];

            crystalMesh.position.y =
                1 + Math.sin(
                    performance.now() * 0.002 +
                    crystal.animationOffset
                ) * 0.15;
        });

        return newlyCollected;
    }

    public getCollectedCount(): number {
        return this.crystals.filter(
            (crystal) => crystal.collected
        ).length;
    }

    public getTotalCount(): number {
        return this.crystals.length;
    }
}
