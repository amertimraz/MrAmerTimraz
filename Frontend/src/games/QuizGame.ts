import Phaser from 'phaser';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

const QUESTIONS: QuizQuestion[] = [
  { question: 'كم عدد أيام الأسبوع؟', options: ['5', '6', '7', '8'], correct: 2 },
  { question: 'ما هو أكبر كوكب في المجموعة الشمسية؟', options: ['الأرض', 'المريخ', 'زحل', 'المشتري'], correct: 3 },
  { question: 'كم يساوي 8 × 7؟', options: ['54', '56', '58', '60'], correct: 1 },
  { question: 'ما عاصمة مصر؟', options: ['الإسكندرية', 'القاهرة', 'الجيزة', 'أسوان'], correct: 1 },
  { question: 'أي لون يظهر عند مزج الأزرق والأصفر؟', options: ['برتقالي', 'بنفسجي', 'أخضر', 'رمادي'], correct: 2 },
];

export class QuizScene extends Phaser.Scene {
  private currentQ = 0;
  private score = 0;
  private questionText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private optionButtons: Phaser.GameObjects.Container[] = [];
  private feedbackText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private timerBar!: Phaser.GameObjects.Rectangle;
  private timerEvent!: Phaser.Time.TimerEvent;
  private timeLeft = 15;
  private answered = false;

  constructor() { super({ key: 'QuizScene' }); }

  preload() {}

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x1e293b);

    // Header
    this.add.rectangle(width / 2, 40, width, 80, 0x0f172a);
    this.add.text(width / 2, 25, '🎓 لعبة الأسئلة التعليمية', {
      fontSize: '22px', color: '#60a5fa', fontStyle: 'bold', fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.scoreText = this.add.text(width - 20, 55, `النقاط: ${this.score}`, {
      fontSize: '16px', color: '#34d399', fontFamily: 'Arial',
    }).setOrigin(1, 0.5);

    // Timer bar background
    this.add.rectangle(width / 2, 100, width - 40, 14, 0x334155).setOrigin(0.5);
    this.timerBar = this.add.rectangle(20, 100, width - 40, 14, 0x3b82f6).setOrigin(0, 0.5);

    this.timerText = this.add.text(width / 2, 100, '15', {
      fontSize: '12px', color: '#ffffff', fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Question box
    const qBox = this.add.rectangle(width / 2, 195, width - 40, 100, 0x1e40af, 0.8);
    qBox.setStrokeStyle(2, 0x3b82f6);

    this.questionText = this.add.text(width / 2, 195, '', {
      fontSize: '18px', color: '#ffffff', fontFamily: 'Arial',
      wordWrap: { width: width - 80 }, align: 'center',
    }).setOrigin(0.5);

    this.feedbackText = this.add.text(width / 2, 260, '', {
      fontSize: '18px', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.showQuestion();
  }

  private showQuestion() {
    if (this.currentQ >= QUESTIONS.length) { this.showResult(); return; }

    this.answered = false;
    this.optionButtons.forEach(b => b.destroy());
    this.optionButtons = [];
    this.feedbackText.setText('');

    const q = QUESTIONS[this.currentQ];
    const { width } = this.scale;

    this.questionText.setText(`س${this.currentQ + 1}: ${q.question}`);

    this.timeLeft = 15;
    if (this.timerEvent) this.timerEvent.remove();
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft--;
        this.timerText.setText(String(this.timeLeft));
        const pct = this.timeLeft / 15;
        this.timerBar.width = (width - 40) * pct;
        this.timerBar.setFillStyle(pct > 0.5 ? 0x3b82f6 : pct > 0.25 ? 0xf59e0b : 0xef4444);
        if (this.timeLeft <= 0) { this.handleAnswer(-1); }
      },
      repeat: 14,
    });

    const cols = 2;
    const btnW = (width - 60) / cols;
    const btnH = 60;
    const startY = 310;

    q.options.forEach((opt, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * (btnW + 10) + btnW / 2;
      const y = startY + row * (btnH + 10);

      const bg = this.add.rectangle(0, 0, btnW, btnH, 0x334155).setStrokeStyle(2, 0x475569).setInteractive({ cursor: 'pointer' });
      const label = this.add.text(0, 0, opt, { fontSize: '15px', color: '#e2e8f0', fontFamily: 'Arial', wordWrap: { width: btnW - 20 }, align: 'center' }).setOrigin(0.5);

      const container = this.add.container(x, y, [bg, label]);
      container.setInteractive(new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH), Phaser.Geom.Rectangle.Contains);

      container.on('pointerover', () => { if (!this.answered) bg.setFillStyle(0x1e40af); });
      container.on('pointerout', () => { if (!this.answered) bg.setFillStyle(0x334155); });
      container.on('pointerdown', () => this.handleAnswer(i));

      this.optionButtons.push(container);
    });
  }

  private handleAnswer(idx: number) {
    if (this.answered) return;
    this.answered = true;
    if (this.timerEvent) this.timerEvent.remove();

    const q = QUESTIONS[this.currentQ];
    const correct = idx === q.correct;

    this.optionButtons.forEach((btn, i) => {
      const bg = btn.list[0] as Phaser.GameObjects.Rectangle;
      if (i === q.correct) bg.setFillStyle(0x16a34a);
      else if (i === idx && !correct) bg.setFillStyle(0xdc2626);
    });

    if (correct) {
      this.score += 10;
      this.scoreText.setText(`النقاط: ${this.score}`);
      this.feedbackText.setText('✅ إجابة صحيحة! +10').setColor('#34d399');
      this.cameras.main.flash(300, 0, 255, 100);
    } else if (idx === -1) {
      this.feedbackText.setText('⏰ انتهى الوقت!').setColor('#f59e0b');
    } else {
      this.feedbackText.setText(`❌ خطأ! الإجابة: ${q.options[q.correct]}`).setColor('#f87171');
      this.cameras.main.shake(300, 0.01);
    }

    this.time.delayedCall(2000, () => { this.currentQ++; this.showQuestion(); });
  }

  private showResult() {
    this.optionButtons.forEach(b => b.destroy());
    this.questionText.setText('');
    this.feedbackText.setText('');
    this.timerText.setText('');

    const { width, height } = this.scale;
    const pct = Math.round((this.score / (QUESTIONS.length * 10)) * 100);

    this.add.rectangle(width / 2, height / 2, width - 40, 280, 0x1e40af, 0.9).setStrokeStyle(3, 0x60a5fa);

    const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '⭐' : '💪';
    this.add.text(width / 2, height / 2 - 80, `${emoji} انتهت اللعبة!`, {
      fontSize: '26px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 30, `نقاطك: ${this.score} / ${QUESTIONS.length * 10}`, {
      fontSize: '20px', color: '#fbbf24', fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 10, `النسبة: ${pct}%`, {
      fontSize: '18px', color: '#34d399', fontFamily: 'Arial',
    }).setOrigin(0.5);

    const msg = pct >= 80 ? 'ممتاز! أداء رائع 🌟' : pct >= 60 ? 'جيد! واصل التحسّن' : 'تحتاج مزيداً من المراجعة';
    this.add.text(width / 2, height / 2 + 45, msg, {
      fontSize: '15px', color: '#e2e8f0', fontFamily: 'Arial',
    }).setOrigin(0.5);

    const restartBg = this.add.rectangle(width / 2, height / 2 + 95, 150, 44, 0x2563eb).setStrokeStyle(2, 0x60a5fa).setInteractive({ cursor: 'pointer' });
    this.add.text(width / 2, height / 2 + 95, '🔄 العب مجدداً', { fontSize: '15px', color: '#ffffff', fontFamily: 'Arial' }).setOrigin(0.5);
    restartBg.on('pointerdown', () => this.scene.restart());
    restartBg.on('pointerover', () => restartBg.setFillStyle(0x1d4ed8));
    restartBg.on('pointerout', () => restartBg.setFillStyle(0x2563eb));
  }
}
