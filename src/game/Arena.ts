import * as THREE from 'three';

export class Arena {
    public readonly group: THREE.Group;

    private stoneMaterial: THREE.MeshStandardMaterial;
    private woodMaterial: THREE.MeshStandardMaterial;
    private woodDetailMaterial: THREE.MeshStandardMaterial;
    private grassMaterial: THREE.MeshStandardMaterial;

    constructor() {
        this.group = new THREE.Group();

        // Materiais
        this.stoneMaterial = new THREE.MeshStandardMaterial({
            color: 0x777b80,
            roughness: 0.9,
        });

        this.woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x80512f,
            roughness: 0.85,
        });

        this.woodDetailMaterial = new THREE.MeshStandardMaterial({
            color: 0x49301f,
            roughness: 0.9,
        });

        this.grassMaterial = new THREE.MeshStandardMaterial({
            color: 0x477f43,
            roughness: 1,
        });

        this.createGround();
        this.createWalls();
        this.createRocks();
        this.createCrates();
    }

    private createGround() {
        const geometry = new THREE.PlaneGeometry(20, 20);

        const ground = new THREE.Mesh(
            geometry,
            this.grassMaterial
        );

        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;

        this.group.add(ground);
    }

    private createWalls() {
        const wallHeight = 2.5;
        const wallThickness = 0.6;
        const wallLength = 20;

        const createWall = (
            width: number,
            height: number,
            depth: number,
            x: number,
            z: number
        ) => {
            const geometry = new THREE.BoxGeometry(
                width,
                height,
                depth
            );

            const wall = new THREE.Mesh(
                geometry,
                this.stoneMaterial
            );

            wall.position.set(x, height / 2, z);
            wall.castShadow = true;
            wall.receiveShadow = true;

            this.group.add(wall);
        };

        // Paredes norte e sul
        createWall(
            wallLength,
            wallHeight,
            wallThickness,
            0,
            -10
        );

        createWall(
            wallLength,
            wallHeight,
            wallThickness,
            0,
            10
        );

        // Paredes leste e oeste
        createWall(
            wallThickness,
            wallHeight,
            wallLength,
            -10,
            0
        );

        createWall(
            wallThickness,
            wallHeight,
            wallLength,
            10,
            0
        );
    }

    private createRocks() {
        const positions = [
            [-7, -6],
            [7, -7],
            [-6, 6],
            [7, 6],
            [-4, -2],
            [5, 3],
        ];

        positions.forEach(([x, z], index) => {
            const geometry = new THREE.DodecahedronGeometry(
                0.7 + (index % 3) * 0.15,
                0
            );

            const rock = new THREE.Mesh(
                geometry,
                this.stoneMaterial
            );

            rock.position.set(x, 0.55, z);

            rock.rotation.set(
                index * 0.3,
                index * 0.5,
                index * 0.2
            );

            rock.castShadow = true;
            rock.receiveShadow = true;

            this.group.add(rock);
        });
    }

    private createCrate(x: number, z: number) {
        const crate = new THREE.Group();

        // Corpo da caixa
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(1.3, 1.3, 1.3),
            this.woodMaterial
        );

        body.position.y = 0.65;
        body.castShadow = true;
        body.receiveShadow = true;

        crate.add(body);

        // Detalhes de madeira
        const createBeam = (
            width: number,
            height: number,
            depth: number,
            position: THREE.Vector3
        ) => {
            const beam = new THREE.Mesh(
                new THREE.BoxGeometry(width, height, depth),
                this.woodDetailMaterial
            );

            beam.position.copy(position);
            beam.castShadow = true;

            crate.add(beam);
        };

        // Travessas verticais na frente e atrás
        for (const side of [-0.66, 0.66]) {
            createBeam(
                0.12,
                1.4,
                0.08,
                new THREE.Vector3(side, 0.65, 0.67)
            );
        }

        // Travessas horizontais
        for (const height of [0.08, 1.22]) {
            createBeam(
                1.4,
                0.12,
                0.08,
                new THREE.Vector3(0, height, 0.67)
            );
        }

        crate.position.set(x, 0, z);

        this.group.add(crate);
    }

    private createCrates() {
        this.createCrate(-5, 0);
        this.createCrate(5, -3);
        this.createCrate(3, 6);
    }
}
