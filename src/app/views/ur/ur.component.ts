import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
// import { Engine, Scene, UniversalCamera, FreeCamera, HemisphericLight, Vector3, MeshBuilder, Mesh, SceneLoader } from 'babylonjs';
// import 'babylonjs-loaders';

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
  dice: boolean[] = [false, false, false, false];
  diceSum = 0;

  // Show possible moves
  // This is the index of the chip being hovered
  possMoves = 16;

  /* BabylonJS (Dice)
  canvas: HTMLCanvasElement;
  engine: Engine;
  scene: Scene; */

  /* Dice
  public static CreateScene(engine: Engine, canvas: HTMLCanvasElement): Scene {
    const scene = new Scene(engine);
    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    const light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const camera = new UniversalCamera('UniversalCamera', new Vector3(0, 0, -40), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);

    // The first parameter can be used to specify which mesh to import. Here we import all meshes
    SceneLoader.Append('./assets/', '4_sided_die.glb', scene, (newMeshes) => {
        scene.activeCamera = null;
        scene.createDefaultCameraOrLight(true);
        scene.activeCamera.attachControl(canvas, false);
    });

    const sphere = Mesh.CreateSphere('sphere1', 16, 2, scene);
    sphere.position.y = 1;
    const ground = Mesh.CreateGround('ground1', 6, 6, 2, scene);

    return scene;
  } */

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
    /* this.canvas = this.canvasRef.nativeElement;
    this.engine = new Engine(this.canvas, true);
    setTimeout(() => { this.scene = UrComponent.CreateScene(this.engine, this.canvas); }, 3000); */
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
    this.diceSum = 0;
    for (let k = 0; k < 4; k++) {
      this.dice[k] = Math.random() > 0.5;
      this.diceSum += this.dice[k] ? 1 : 0;
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
