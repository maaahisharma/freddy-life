import { Scene, Input } from 'phaser';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    init(data = {}) {
        this.location = data.location ?? 'home';
    }

    create() {
      const isNewSession = !this.registry.has('playerState');

      if (isNewSession) {
          this.registry.set('playerState', this.loadPlayerState());
      }

        this.state = this.registry.get('playerState');
      this.state.workRemaining ??= 0;
      if (isNewSession) {
          this.location = this.state.location ?? this.location;
      }

        this.obstacles = [];
        this.interactions = [];
        this.message = '';

        if (this.location === 'home') {
            this.createHome();
        } else {
            this.createCity();
        }

        this.player = this.add.rectangle(
            this.spawn.x, this.spawn.y, 32, 32, 0xffcc00
      );
        if (isNewSession && this.state.position) {
            const { x, y } = this.state.position;
            const b = this.bounds;

            const insideBounds =
                x >= b.left + 16 &&
                x <= b.right - 16 &&
                y >= b.top + 16 &&
                y <= b.bottom - 16;

            if (insideBounds && !this.hitsObstacle(x, y)) {
                this.player.setPosition(x, y);
            }
        }

        this.cursors = this.input.keyboard.createCursorKeys();
      this.interactKey = this.input.keyboard.addKey('E');
      this.saveKey = this.input.keyboard.addKey('S');
      this.saveNotice = '';

        const locationName =
            this.location === 'home' ? 'Your apartment' : 'Downtown';

        this.add.text(
            20, 20,
            `Freddy Life | ${this.location === 'home' ? 'Your apartment' : 'Downtown'}\nArrow keys: move | E: interact | S: save`,
            { fontSize: '22px', color: '#ffffff' }
        ).setDepth(100);

        this.prompt = this.add.text(
            20, this.scale.height - 65, '',
            {
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#263522',
                padding: { x: 12, y: 8 }
            }
        ).setDepth(100);

        // Create exactly one stats display per location.
        this.statsText = this.add.text(
            this.scale.width - 20, 20, '',
            {
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#263522',
                padding: { x: 12, y: 8 }
            }
        ).setOrigin(1, 0).setDepth(100);
    }

    createHome() {
        this.cameras.main.setBackgroundColor('#252d38');

        this.add.rectangle(512, 370, 832, 540, 0xc49c72);
        this.bounds = {
            left: 96, right: 928, top: 100, bottom: 640
        };

        this.addObstacle(260, 230, 140, 180, 0x416b9a);
        this.addLabel(260, 230, 'Bed');

        this.addObstacle(810, 220, 80, 120, 0xe5e8ed);
        this.addLabel(810, 220, 'Fridge', '#222222');

        this.add.rectangle(512, 635, 80, 10, 0x543323);

        this.interactions = [
            {
                x: 512, y: 605,
                label: 'Go outside',
                target: 'city'
            },
            {
                x: 260, y: 345,
                label: 'Sleep: restore energy',
                action: 'sleep'
            },
            {
                x: 810, y: 305,
                label: 'Eat a meal: $10',
                action: 'eat'
            }
        ];

        this.spawn = { x: 512, y: 480 };
    }

    createCity() {
        this.cameras.main.setBackgroundColor('#527a46');

        this.bounds = {
            left: 0,
            right: this.scale.width,
            top: 0,
            bottom: this.scale.height
        };

        this.add.rectangle(512, 500, 1024, 100, 0x444444);

        this.addObstacle(250, 250, 180, 140, 0x7288a0);
        this.addLabel(250, 160, 'Your apartment');
        this.add.rectangle(250, 320, 32, 8, 0x543323);

        this.addObstacle(700, 250, 180, 140, 0xb86b45);
        this.addLabel(700, 160, 'Freddy Café');
        this.add.rectangle(700, 320, 32, 8, 0x543323);

        this.interactions = [
            {
                x: 250, y: 350,
                label: 'Go home',
                target: 'home'
            },
            {
                x: 700, y: 350,
                label: 'Work a café shift: earn $25',
                action: 'work'
            }
        ];

        this.spawn = { x: 250, y: 380 };
    }

    addObstacle(x, y, width, height, color) {
        const obstacle = this.add.rectangle(
            x, y, width, height, color
        );
        this.obstacles.push(obstacle);
    }

    addLabel(x, y, text, color = '#ffffff') {
        this.add.text(x, y, text, {
            fontSize: '20px',
            color
        }).setOrigin(0.5);
    }

    update(time, delta) {
      const seconds = Math.min(delta, 1000) / 1000;
      if (Input.Keyboard.JustDown(this.saveKey)) {
          this.saveNotice = this.saveProgress();
      }

        // Gradually decrease needs without going below zero.
        this.state.hunger = Math.max(
            0, this.state.hunger - 0.2 * seconds
        );
        this.state.energy = Math.max(
            0, this.state.energy - 0.1 * seconds
        );

        // Advance an active shift and pay once when it finishes.
        if (this.state.workRemaining > 0) {
            this.state.workRemaining = Math.max(
                0, this.state.workRemaining - seconds
            );

            if (this.state.workRemaining === 0) {
                this.state.money += 25;
                this.message = 'Shift complete! You earned $25.';
            }
        }

        this.statsText.setText(
            `$${this.state.money} CAD\n` +
            `Hunger: ${Math.ceil(this.state.hunger)}/100\n` +
            `Energy: ${Math.ceil(this.state.energy)}/100\n` +
            this.saveNotice
        );

        // Disable movement and interactions during a shift.
        if (this.state.workRemaining > 0) {
            Input.Keyboard.JustDown(this.interactKey);

            this.prompt.setText(
                `Working at Freddy Café… ${Math.ceil(this.state.workRemaining)}s remaining`
            );
            return;
        }

        let dx = 0;
        let dy = 0;

        if (this.cursors.left.isDown) dx -= 1;
        if (this.cursors.right.isDown) dx += 1;
        if (this.cursors.up.isDown) dy -= 1;
        if (this.cursors.down.isDown) dy += 1;

        const length = Math.hypot(dx, dy);

        if (length > 0) {
            const distance = 300 * (Math.min(delta, 50) / 1000);

            const nextX = this.player.x + (dx / length) * distance;
            if (!this.hitsObstacle(nextX, this.player.y)) {
                this.player.x = nextX;
            }

            const nextY = this.player.y + (dy / length) * distance;
            if (!this.hitsObstacle(this.player.x, nextY)) {
                this.player.y = nextY;
            }
        }

        const b = this.bounds;

        this.player.x = Math.max(
            b.left + 16, Math.min(b.right - 16, this.player.x)
        );
        this.player.y = Math.max(
            b.top + 16, Math.min(b.bottom - 16, this.player.y)
        );

        const nearby = this.interactions.find(point =>
            Math.hypot(
                this.player.x - point.x,
                this.player.y - point.y
            ) < 55
        );

        const pressedE = Input.Keyboard.JustDown(this.interactKey);

        if (!nearby) {
            this.message = '';
            this.prompt.setText('');
            return;
        }

        if (pressedE) {
            if (nearby.target) {
                this.scene.restart({ location: nearby.target });
                return;
            }

            if (nearby.action) {
                this.message = this.performAction(nearby.action);
            } else {
                this.message = this.message ? '' : nearby.message;
            }
        }

        this.prompt.setText(
            this.message || `Press E: ${nearby.label}`
        );
    }

    performAction(action) {
        if (action === 'eat') {
            if (this.state.hunger >= 99) {
                return 'You are already full.';
            }

            if (this.state.money < 10) {
                return 'You need $10 to buy a meal.';
            }

            this.state.money -= 10;
            this.state.hunger = Math.min(
                100, this.state.hunger + 30
            );

            return 'Meal purchased: -$10, hunger restored by up to 30.';
        }

        if (action === 'sleep') {
            if (this.state.energy >= 99) {
                return 'You are already well rested.';
            }

            this.state.energy = 100;
            return 'You rested. Energy restored to 100.';
        }

        if (action === 'work') {
            if (this.state.energy < 15 || this.state.hunger < 10) {
                return 'Eat and rest before starting a shift.';
            }

            this.state.energy -= 15;
            this.state.hunger -= 10;
            this.state.workRemaining = 10;

            return 'Shift started!';
        }

        return '';
    }
    loadPlayerState() {
        const defaults = {
            money: 100,
            hunger: 100,
            energy: 100,
            workRemaining: 0
        };

        try {
            const savedText = localStorage.getItem('freddy-life-save');

            // Start fresh if there is no saved game.
            if (savedText === null) {
                return defaults;
            }

            const saved = JSON.parse(savedText);

            // Check that the saved stats contain usable numbers.
            const valid =
                saved !== null &&
                saved.version === 1 &&
                Number.isFinite(saved.money) &&
                saved.money >= 0 &&
                Number.isFinite(saved.hunger) &&
                saved.hunger >= 0 &&
                saved.hunger <= 100 &&
                Number.isFinite(saved.energy) &&
                saved.energy >= 0 &&
                saved.energy <= 100;

            if (!valid) {
                return defaults;
            }

            const validLocation =
                saved.location === 'home' ||
                saved.location === 'city';

            const validPosition =
                saved.position != null &&
                Number.isFinite(saved.position.x) &&
                Number.isFinite(saved.position.y);

            return {
                money: saved.money,
                hunger: saved.hunger,
                energy: saved.energy,
                workRemaining: 0,
                location: validLocation ? saved.location : 'home',
                position:
                    validLocation && validPosition
                        ? {
                            x: saved.position.x,
                            y: saved.position.y
                        }
                        : null
            };
        } catch (error) {
            console.warn('Could not load the saved game:', error);
            return defaults;
        }
    }

    saveProgress() {
        // Wait until a shift finishes before saving.
        if (this.state.workRemaining > 0) {
            return 'Finish your shift before saving.';
        }

        const saved = {
            version: 1,
            money: this.state.money,
            hunger: this.state.hunger,
            energy: this.state.energy,
            location: this.location,
            position: {
                x: this.player.x,
                y: this.player.y
            }
        };
        try {
            localStorage.setItem(
                'freddy-life-save',
                JSON.stringify(saved)
            );

            return 'Progress saved!';
        } catch (error) {
            console.warn('Could not save the game:', error);
            return 'Save failed: browser storage unavailable.';
        }
    }
    hitsObstacle(x, y) {
        return this.obstacles.some(obstacle =>
            x + 16 > obstacle.x - obstacle.width / 2 &&
            x - 16 < obstacle.x + obstacle.width / 2 &&
            y + 16 > obstacle.y - obstacle.height / 2 &&
            y - 16 < obstacle.y + obstacle.height / 2
        );
    }
}
