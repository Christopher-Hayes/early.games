import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

@Component({
  selector: 'app-ur',
  templateUrl: './ur.component.html',
  styleUrls: ['./ur.component.sass']
})
export class UrComponent implements OnInit, AfterViewInit {
  // @ViewChild('canvasRef') canvasRef: ElementRef;

  pathA = [ 'pre',
            'a1', 'a2', 'a3', 'a4',
            'c5', 'c6', 'c7', 'c8',
            'c9', 'c10', 'c11', 'c12',
            'a13', 'a14',
            'post' ];

  pathB = [ 'pre',
            'b1', 'b2', 'b3', 'b4',
            'c5', 'c6', 'c7', 'c8',
            'c9', 'c10', 'c11', 'c12',
            'b13', 'b14',
            'post' ];
  allPaths = [this.pathA, this.pathB];

  pathOrder = [
    [ 13, 14,  0, 0, 1, 2, 3, 4 ],
    [ 12, 11, 10, 9, 8, 7, 6, 5 ],
    [ 13, 14,  0, 0, 1, 2, 3, 4 ]
  ];

  // Chip positions - numbers represent distance down path
  // Indexes: 0 = haven't started; 15 = successfully completed
  // Values: [null: unoccupied, Chip; occupied]
  positionsA: Chip[] = [];
  positionsB: Chip[] = [];
  pos = [this.positionsA, this.positionsB];

  chipsA: Chip[] = [];
  chipsB: Chip[] = [];
  chp = [this.chipsA, this.chipsB];

  chipsALeft = 7;
  chipsBLeft = 7;
  left = [this.chipsALeft, this.chipsBLeft];

  // How many chips have successfully traversed the board
  homeNum = [0, 0];
  home = [[], []];

  // Game phase - 0=you roll, 1=you move, 2=they roll, 2=they move
  gamePhase = 0;
  phaseStr = ['Your Turn: Roll', 'Your Turn: Move', 'Bot: Roll', 'Bot: Move'];

  // Dice
  diceVal: boolean[] = [false, false, false, false];
  diceSum = 0;

  // Show possible moves
  // This is the index of the chip being hovered
  possMoves = 16;

  // THREE.js
  camera: any;
  scene: any;
  renderer: any;
  geometry: any;
  material: any;
  mesh: any;
  loader: any;

  dice: THREE.Mesh[] = [];
  diceV: any = [];

  rollP = 0;
  rollDuration = 1000;

  init() {
    this.scene = new THREE.Scene();

    /* Optional: Provide a DRACOLoader instance to decode compressed mesh data
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( '/examples/js/libs/draco' );
    this.loader.setDRACOLoader( dracoLoader ); */

    // Load a glTF resource
    this.loader = new GLTFLoader();
    this.loader.load(
      // resource URL
      'assets/4_sided_die_centered.glb',
      // called when the resource is loaded
      (gltf) =>  {
        for (let k = 0; k < 4; k++) {
          this.dice[k] = gltf.scene.children[0].clone();
          this.dice[k].position.x = k * 25 - 40;
          this.diceV[k] = {};
          this.diceV[k].rx = 0 + Math.random() * 10;
          this.diceV[k].ry = 0 + Math.random() * 20;
          this.diceV[k].rz = 0 + Math.random() * 30;

          this.scene.add(this.dice[k]);
        }
        this.doneLoading();
        this.resetDice();
      },
      // called while loading is progressing
      (xhr) => {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      // called when loading has errors
      (e) => {
        console.log('GLTF loader error', e);
      }
    );

  }

  resetDice() {
    setTimeout(() => { this.resetDice(); }, 5000);
  }

  doneLoading() {

    const w = 300;
    const h = 140;

    // Camera
    this.camera = new THREE.PerspectiveCamera(70, w / h, 0.01, 150);
    this.camera.position.set(0, 0, 50);

    // Lighting
    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.8 );
    hemiLight.color.setHSL( 1, 1, 1 );
    hemiLight.groundColor.setHSL( 1, 1, 1 );
    hemiLight.position.set( 0, 50, 0 );
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    dirLight.color.setHSL( 1, 1, 1 );
    dirLight.position.set( - 1, 1.75, 1 );
    dirLight.position.multiplyScalar( 30 );
    this.scene.add(dirLight);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: document.getElementById('diceCanvas') as HTMLCanvasElement
    });
    this.renderer.setClearColor( 0xffffff );
    this.renderer.gammaOutput = true;
    this.renderer.setSize(w, h);
    // document.body.appendChild(this.renderer.domElement);

    // Begin animation
    this.animate();
  }

  // Use arrow function so requestAnimationFrame retains 'this'
  animate = () => {
    requestAnimationFrame(this.animate);


    const p = 1 - Math.cos(Math.max(0, (this.rollP - Date.now()) / this.rollDuration));

    this.renderer.domElement.style.opacity = (1 - p * 2).toString();

    for (let k = 0; k < 4; k++) {
      this.dice[k].rotation.x = p * this.diceV[k].rx + Math.PI;
      this.dice[k].rotation.y = p * this.diceV[k].ry;
      this.dice[k].rotation.z = p * this.diceV[k].rz + (this.diceVal[k] ? 0 : 2.039);
      this.dice[k].position.y = p * -70 + 20;
      this.dice[k].position.z = p * 100;
    }

    this.renderer.render(this.scene, this.camera);
  }

  constructor() {
    for (let c = 0; c < 7; c++) {
      // Player A
      this.chp[0].push({ player: 0,
                         position: 0,
                         cl: 'chipA' });
      // Player B
      this.chp[1].push({ player: 1,
                         position: 0,
                         cl: 'chipB' });
    }
  }

  ngOnInit() {
    // Set all positions to unoccupied
    for (let k = 0; k < 16; k++) {
      this.positionsA[k] = null;
      this.positionsB[k] = null;
    }
  }

  ngAfterViewInit() {
    this.init();
  }

  // Increment game phase
  nextPhase() {
    this.gamePhase = (this.gamePhase + 1) % 4;

    switch (this.gamePhase) {
      case 2:
        // Player A rolls dice
        setTimeout(() => { this.rollDice(); }, 1000);
        break;
      case 3:
        setTimeout(() => { this.botMove(); }, 1000);
        break;
    }

    // Recount chips available
    this.recountChipsLeft();
  }


  // Bot - move
  botMove() {
    // Player A moves chip
    if (this.canAddChip(0)) {
      // Add chip
      console.log('BOT added chip');
      this.newChip(0);
    } else {
      // If cannot add, move chip
      console.log('BOT moved chip');
      for (const c of this.chp[0]) {
        if (this.canMoveChip(c)) {
          this.moveChip(c);
          return;
        }
      }
      console.log('Bot couldnt move');
      this.gamePhase = (this.gamePhase + 1) % 4;
    }
  }

  // Update chips left count
  recountChipsLeft() {
    for (let pl = 0; pl < 2; pl++) {
      let sum = 0;
      for (const c of this.chp[pl]) {
        sum += c.position === 0 ? 1 : 0;
      }
      this.left[pl] = sum;
    }
  }

  // Roll dice
  rollDice() {
    // Animation
    document.getElementById('diceSum').classList.remove('enter');
    setTimeout(() => { document.getElementById('diceSum').classList.add('enter'); }, 200);
    this.rollP = Date.now() + this.rollDuration;

    this.diceSum = 0;
    for (let k = 0; k < 4; k++) {
      this.diceVal[k] = Math.random() > 0.5;
      this.diceSum += this.diceVal[k] ? 1 : 0;
    }
    this.nextPhase();
    // If 0 rolled, skip move phase
    if (this.diceSum === 0 && this.gamePhase === 1) {
      console.log('0 rolled, skip move phase');
      this.nextPhase();
    }
  }

  // Add new chip to board
  newChip(player: number) {
    for (const c of this.chp[player]) {
      if (c.position === 0) {
        this.moveChip(c);
        return;
      }
    }
    console.log('ERROR: No chips left!');
  }

  // Move chip a specific number of times forward
  moveChip(chip: Chip) {
    this.possMoves = 15;
    if (this.diceSum === 0) {
      console.log('Unable to move with 0');
    } else if (chip.position === 0) {
      console.log('Add chip - move chip at', chip.position, ' to ', chip.position + this.diceSum);
      // Chip hasn't entered the board yet
      this.swap(chip, this.diceSum);
    } else if (chip.position + this.diceSum < 15) {
      // Chip moving inside board
      console.log('Move chip at', chip.position, ' to ', chip.position + this.diceSum);
      this.swap(chip, this.diceSum);
    } else if (chip.position + this.diceSum === 15) {
      // Chip moved successfully traversed board
      console.log('Chip successfully traversed board!');
      this.home[chip.player].push(chip);
      this.homeNum[chip.player]++;
      this.pos[chip.player][chip.position] = null;
    } else if (chip.position + this.diceSum > 15) {
      // Moves too large for chip to move off board
      console.log('Chip cannot move further');
    }
    this.nextPhase();
  }

  // Move chip (swap locations)
  swap(chip: Chip, moves: number) {
    const oldLocation = chip.position;
    chip.position += moves;
    this.pos[chip.player][chip.position] = chip;
    this.pos[chip.player][oldLocation] = null;

    // Remove opponent if on same square
    if (chip.position > 4 && chip.position < 13 && this.pos[(chip.player + 1) % 2][chip.position]) {
      this.rmChipAtPos(chip.position, (chip.player + 1) % 2);
    }

    // Landed on double turn space
    if (chip.position === 4 ||
        chip.position === 8 ||
        chip.position === 14) {
      console.log('Landed on double! Roll again');
      this.gamePhase -= 2;
    }
  }

  // Remove chip from board of player
  rmChipAtPos(pos: number, player: number) {
    for (let c = 0; c < 7; c++) {
      if (this.chp[player][c] && this.chp[player][c].position === pos) {
        // Remove from chips list
        this.chp[player][c].position = 0;
        // Remove from board
        this.pos[player][pos] = null;
        return;
      }
    }
    console.log('ERROR: Could not find chip to remove.');
  }

  // Can add new chip
  canAddChip(player: number) {
    return this.left[player] > 0 &&
           !this.pos[player][this.diceSum];
  }

  // Can move chip
  canMoveChip(chip: Chip) {
    const newPos = chip.position + this.diceSum;
    return newPos < 15 &&
           !this.pos[chip.player][newPos];
  }

}

export class Chip {
  player: number; // 0 or 1 (a or b)
  position: number; // index in pathX array
  cl: string; // css class name - convenience
}
