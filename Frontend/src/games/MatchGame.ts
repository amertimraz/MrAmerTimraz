import Phaser from 'phaser';

interface Card { id: number; value: string; flipped: boolean; matched: boolean }

const PAIRS = ['🌍', '🔬', '📐', '🎨', '🔢', '📚'];

export class MatchScene extends Phaser.Scene {
  private cards: (Card & { sprite: Phaser.GameObjects.Container })[] = [];
  private selected: typeof this.cards = [];
  private moves = 0;
  private matched = 0;
  private movesText!: Phaser.GameObjects.Text;
  private canFlip = true;

  constructor() { super({ key: 'MatchScene' }); }

  create() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a);
    this.add.text(width / 2, 28, '🃏 لعبة مطابقة البطاقات', { fontSize: '20px', color: '#60a5fa', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5);
    this.movesText = this.add.text(width / 2, 56, 'الحركات: 0', { fontSize: '14px', color: '#94a3b8', fontFamily: 'Arial' }).setOrigin(0.5);

    const all = [...PAIRS, ...PAIRS].sort(() => Math.random() - 0.5);
    const cols = 4;
    const cardW = 80, cardH = 80, gapX = 16, gapY = 16;
    const totalW = cols * cardW + (cols - 1) * gapX;
    const startX = (width - totalW) / 2 + cardW / 2;
    const startY = 100;

    all.forEach((val, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardW + gapX);
      const y = startY + row * (cardH + gapY);

      const bg = this.add.rectangle(0, 0, cardW, cardH, 0x1e40af).setStrokeStyle(2, 0x3b82f6).setInteractive({ cursor: 'pointer' });
      const cover = this.add.rectangle(0, 0, cardW - 4, cardH - 4, 0x334155);
      const emoji = this.add.text(0, 0, val, { fontSize: '28px' }).setOrigin(0.5).setVisible(false);
      const qMark = this.add.text(0, 0, '?', { fontSize: '26px', color: '#60a5fa', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5);

      const container = this.add.container(x, y, [bg, cover, emoji, qMark]);
      container.setInteractive(new Phaser.Geom.Rectangle(-cardW / 2, -cardH / 2, cardW, cardH), Phaser.Geom.Rectangle.Contains);

      const card = { id: i, value: val, flipped: false, matched: false, sprite: container as unknown as typeof this.cards[0]['sprite'] };
      this.cards.push({ ...card, sprite: container as unknown as typeof this.cards[0]['sprite'] });

      container.on('pointerover', () => { if (!card.flipped && !card.matched && this.canFlip) bg.setFillStyle(0x2563eb); });
      container.on('pointerout', () => { if (!card.flipped && !card.matched) bg.setFillStyle(0x1e40af); });
      container.on('pointerdown', () => this.flipCard(i));
    });
  }

  private flipCard(idx: number) {
    const card = this.cards[idx];
    if (!this.canFlip || card.flipped || card.matched) return;

    card.flipped = true;
    const cont = card.sprite as unknown as Phaser.GameObjects.Container;
    const cover  = cont.list[1] as Phaser.GameObjects.Rectangle;
    const emoji  = cont.list[2] as Phaser.GameObjects.Text;
    const qMark  = cont.list[3] as Phaser.GameObjects.Text;
    cover.setVisible(false);
    emoji.setVisible(true);
    qMark.setVisible(false);

    this.selected.push(card);

    if (this.selected.length === 2) {
      this.moves++;
      this.movesText.setText(`الحركات: ${this.moves}`);
      this.canFlip = false;

      const [a, b] = this.selected;
      if (a.value === b.value) {
        a.matched = b.matched = true;
        [a, b].forEach(c => {
          const bg = (c.sprite as unknown as Phaser.GameObjects.Container).list[0] as Phaser.GameObjects.Rectangle;
          bg.setFillStyle(0x16a34a);
        });
        this.matched++;
        this.selected = [];
        this.canFlip = true;
        if (this.matched === PAIRS.length) this.showWin();
      } else {
        this.time.delayedCall(900, () => {
          [a, b].forEach(c => {
            c.flipped = false;
            const cont2 = c.sprite as unknown as Phaser.GameObjects.Container;
            (cont2.list[1] as Phaser.GameObjects.Rectangle).setVisible(true);
            (cont2.list[2] as Phaser.GameObjects.Text).setVisible(false);
            (cont2.list[3] as Phaser.GameObjects.Text).setVisible(true);
          });
          this.selected = [];
          this.canFlip = true;
        });
      }
    }
  }

  private showWin() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    this.add.rectangle(width / 2, height / 2, 280, 180, 0x1e40af).setStrokeStyle(3, 0x60a5fa);
    this.add.text(width / 2, height / 2 - 50, '🎉 أحسنت!', { fontSize: '28px', color: '#fbbf24', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5);
    this.add.text(width / 2, height / 2, `أكملت في ${this.moves} حركة`, { fontSize: '16px', color: '#e2e8f0', fontFamily: 'Arial' }).setOrigin(0.5);
    const btn = this.add.rectangle(width / 2, height / 2 + 55, 140, 40, 0x2563eb).setInteractive({ cursor: 'pointer' });
    this.add.text(width / 2, height / 2 + 55, '🔄 مجدداً', { fontSize: '14px', color: '#fff', fontFamily: 'Arial' }).setOrigin(0.5);
    btn.on('pointerdown', () => this.scene.restart());
  }
}
