function getQuizWords() {
  const result = [];
  document.querySelectorAll(".question__answers").forEach((el) => {
    const pair = [...el.querySelectorAll(".question__answer")].map(
      (el) => el.dataset.value
    );
    result.push(pair);
  });
  return result;
}

const words = getQuizWords();

const correctWords = words.map((arr) => {
  const randomIndex = Math.floor(Math.random() * arr.length);
  const randomWord = arr[randomIndex];
  return randomWord;
});

console.log(words, correctWords);

function getAudioUrl(word) {
  return `https://api.dictionaryapi.dev/media/pronunciations/en/${word}-us.mp3`;
}

class Info {
  /** @param {HTMLElement} $el - The DOM reference */
  constructor($el) {
    this.$el = $el;
  }

  updateOrder(order) {
    console.log(order);
    this.$el.querySelector(".quiz__order").textContent = `${order}/5`;
  }
}

class Question {
  /**
   * Create an instance of Question
   * @param {HTMElement} $el - The DOM reference
   */
  constructor($el, { word }) {
    this.$el = $el;
    this.word = word;
    this.audio = this.initAudio();
    this.addListener();
  }

  initAudio() {
    const url = getAudioUrl(this.word);
    return new Audio(url);
  }

  //
  show() {
    this.$el.removeAttribute("hidden");
  }

  hide() {
    this.$el.setAttribute("hidden", "");
  }

  //
  hanldeCheck(value) {
    // update style
    this.$el.querySelectorAll(".question__answers button").forEach((el) => {
      el.setAttribute("disabled", "");

      const cls1 =
        el.dataset.value === this.word
          ? "question__answer-right"
          : "question__answer-wrong";

      const cls2 = el.dataset.value === value && "selected";

      el.classList.add(cls1);

      cls2 && el.classList.add(cls2);
    });

    // emit
    const myEvent = new CustomEvent("answer:check", {
      bubbles: true,
    });
    this.$el.dispatchEvent(myEvent);

    // update progess
    // update score
    // go to next question
  }

  addListener() {
    this.$el.querySelector(".question__audio").addEventListener("click", () => {
      this.audio.play();
    });

    this.$el.querySelectorAll(".question__answers button").forEach((el) => {
      el.addEventListener("click", (e) => {
        const userSelectedWord = e.target.dataset.value;
        this.hanldeCheck(userSelectedWord);
      });
    });
  }
}

class Next {
  /** @param {HTMLElement} $el - The DOM reference */
  constructor($el) {
    this.$el = $el;
    this.addListener();
  }

  show() {
    this.$el.removeAttribute("hidden");
  }

  hide() {
    this.$el.setAttribute("hidden", "");
  }

  addListener() {
    this.$el.addEventListener("click", () => {
      this.hide();

      const myEvent = new CustomEvent("question:next", {
        bubbles: true,
      });
      this.$el.dispatchEvent(myEvent);
    });
  }
}

class Quiz {
  constructor(id) {
    this.id = id;
    this.index = 0;
    this.$el = document.getElementById(id);
    this.info = this.initInfo();
    this.questions = this.initQuestions();
    this.next = this.initNext();
    this.$dialogEnd = document.querySelector(".dialog__end");
    this.$dialogBegin = document.querySelector(".dialog__begin");
    this.init();
    this.addListener();
  }

  init() {
    this.$dialogBegin.showModal();
  }

  initInfo() {
    return new Info(this.$el.querySelector(".quiz__info"));
  }

  initQuestions() {
    return [...this.$el.querySelectorAll(".question")].map(
      (el, index) => new Question(el, { word: correctWords[index] })
    );
  }

  initNext() {
    return new Next(this.$el.querySelector(".question__next"));
  }

  //
  moveIndex(direction = "forward") {
    if (direction === "forward") {
      this.questions.forEach((q, index) => {
        // hide current question
        if (index === this.index) {
          q.hide();
          return;
        }

        // show the next question
        if (index === this.index + 1) {
          q.show();
        }
      });

      this.index++;
    }
  }

  playAudioOnQuestionStart() {
    this.questions[this.index].audio.play();
  }

  addListener() {
    this.$el.addEventListener("answer:check", () => {
      if (this.index === this.questions.length - 1) {
        this.next.$el.textContent = "Score";
      }
      this.next.show();
    });

    this.$el.addEventListener("question:next", () => {
      if (this.index !== this.questions.length - 1) {
        this.moveIndex("forward");
        this.playAudioOnQuestionStart();
        this.info.updateOrder(this.index + 1);
      } else {
        this.$dialogEnd.showModal();
      }
    });

    const $reload = this.$dialogEnd.querySelector(".dialog__reload");
    if (!$reload) {
      throw new Error("Opps, please check your selector!");
    } else {
      $reload.addEventListener("click", () => {
        window.location.reload();
      });
    }

    this.$dialogBegin
      .querySelector(".dialog__play")
      .addEventListener("click", () => {
        this.$dialogBegin.close();
        this.playAudioOnQuestionStart();
      });
  }
}

new Quiz("quiz");
