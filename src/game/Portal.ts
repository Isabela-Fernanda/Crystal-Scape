import * as THREE from 'three';

export class Portal {
    public readonly group: THREE.Group;

    private ring: THREE.Mesh;
    private innerLight: THREE.Mesh;
    private isActive = false;

    private readonly activationDistance = 2.5;

    private inactiveMaterial = new THREE.MeshStandardMaterial({
        color: 0x263746,
        emissive: 0x101820,
        emissiveIntensity: 0.3,
        metalness: 0.6,
        roughness: 0.4,
    });

    private activeMaterial = new THREE.MeshStandardMaterial({
        color: 0x42d9ff,
        emissive: 0x0088cc,
        emissiveIntensity: 2,
        metalness: 0.3,
        roughness: 0.2,
    });

    constructor() {
        this.group = new THREE.Group();

        // A estrutura circular do portal.
        this.ring = new THREE.Mesh(
            new THREE.TorusGeometry(1.6, 0.18, 16, 48),
            this.inactiveMaterial
        );

        this.ring.position.y = 2;
        this.group.add(this.ring);

        // Uma superfície translúcida no interior do portal.
        this.innerLight = new THREE.Mesh(
            new THREE.CircleGeometry(1.45, 48),
            new THREE.MeshBasicMaterial({
                color: 0x123344,
                transparent: true,
                opacity: 0.35,
                side: THREE.DoubleSide,
            })
        );

        this.innerLight.position.set(0, 2, -0.03);
        this.group.add(this.innerLight);

        // Pilares laterais.
        const pillarGeometry = new THREE.BoxGeometry(0.35, 2.4, 0.35);

        const leftPillar = new THREE.Mesh(
            pillarGeometry,
            this.inactiveMaterial
        );

        leftPillar.position.set(-1.8, 1.2, 0);
        this.group.add(leftPillar);

        const rightPillar = new THREE.Mesh(
            pillarGeometry,
            this.inactiveMaterial
        );

        rightPillar.position.set(1.8, 1.2, 0);
        this.group.add(rightPillar);

        // Posição do portal na arena.
        this.group.position.set(0, 0, -17);
    }

    public activate() {
        if (this.isActive) return;

        this.isActive = true;

        this.ring.material = this.activeMaterial;

        this.innerLight.material = new THREE.MeshBasicMaterial({
            color: 0x42d9ff,
            transparent: true,
            opacity: 0.65,
            side: THREE.DoubleSide,
        });
    }

    public update(deltaTime: number) {
        if (!this.isActive) return;

        // Animação suave do portal.
        this.ring.rotation.z += deltaTime * 0.5;

        const pulse = 0.8 + Math.sin(performance.now() * 0.003) * 0.2;

        this.activeMaterial.emissiveIntensity = 1.5 + pulse;
    }

    public isPlayerNear(playerPosition: THREE.Vector3): boolean {
        if (!this.isActive) return false;

        const portalPosition = this.group.position;

        const distance = Math.hypot(
            playerPosition.x - portalPosition.x,
            playerPosition.z - portalPosition.z
        );

        return distance <= this.activationDistance;
    }
}
