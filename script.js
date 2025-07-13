function speakText(btn){
  const text = btn.parentElement.textContent.replace("🔊", "").trim();
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

// Backend configuration
const APP_URL = 'https://script.google.com/macros/s/AKfycbya0EHlfInCNU8toTn0nNeHxJSIesb9V7ms4t1ZC7dflc9AJuraEHg4tS897fNNBsRm/exec';
// Replace with the token configured in your Apps Script, or leave blank
const APP_TOKEN = 'OPTIONAL_SECRET_TOKEN';

// Simple custom modal utilities to avoid browser alert/prompt headings
function showAlert(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content">
        <p>${message}</p>
        <button id="modal-ok">OK</button>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#modal-ok').addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve();
    });
  });
}

function showPrompt(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content">
        <p>${message}</p>
        <input type="text" id="modal-input" />
        <div class="modal-buttons">
          <button id="modal-submit">Submit</button>
          <button id="modal-cancel">Cancel</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const remove = () => document.body.removeChild(overlay);
    overlay.querySelector('#modal-submit').addEventListener('click', () => {
      const value = overlay.querySelector('#modal-input').value;
      remove();
      resolve(value);
    });
    overlay.querySelector('#modal-cancel').addEventListener('click', () => {
      remove();
      resolve(null);
    });
  });
}

    // Listen for clicks on nav links to toggle active sections
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        // Remove active class from all nav links and sections
        navLinks.forEach(nav => nav.classList.remove('active'));
        sections.forEach(sec => sec.classList.remove('active'));
        // Add active class to clicked link and corresponding section
        link.classList.add('active');
        const targetID = link.getAttribute('data-section');
        document.getElementById(targetID).classList.add('active');
        // Scroll to top of the section for better user experience
        document.getElementById(targetID).scrollIntoView({ behavior: 'smooth' });
      });
    });

// Quiz check answers functionality
document.querySelectorAll('.check-btn').forEach(button => {
  button.addEventListener('click', function() {
    const quiz = this.closest('.quiz');
    const questions = quiz.querySelectorAll('li');
    let correctAnswers = 0;

    questions.forEach(question => {
      const selectedAnswer = question.querySelector('input[type="radio"]:checked');
      const allAnswers = question.querySelectorAll('label');

      // Reset styles
      allAnswers.forEach(answer => answer.removeAttribute('data-result'));

      if (selectedAnswer) {
        if (selectedAnswer.hasAttribute('data-correct')) {
          correctAnswers++;
          selectedAnswer.parentElement.setAttribute('data-result', 'right');
        } else {
          selectedAnswer.parentElement.setAttribute('data-result', 'wrong');
        }
      }
    });

    const totalQuestions = questions.length;
    const messageSpan = quiz.querySelector('.quiz-msg');
    messageSpan.textContent = `You got ${correctAnswers}/${totalQuestions} correct.`;
  });
});
async function submitQuiz(button, week, level) {
  const studentName = await showPrompt("Please enter your full name:");
  if (!studentName || studentName.trim() === '') {
    await showAlert("You must enter your name to submit the quiz.");
    return;
  }

  const quizElement = button.closest('.quiz');
  const answers = [];
  const responses = [];

  Array.from(quizElement.querySelectorAll('li')).forEach((li, index) => {
    const questionText = li.querySelector('p') ? li.querySelector('p').innerText : '';
    const textarea = li.querySelector('textarea');

    if (textarea) {
      responses.push({ answer: textarea.value });
      return;
    }

    const selectedOption = li.querySelector('input[type="radio"]:checked');
    const correctOption = li.querySelector('input[data-correct="true"]');

    const isCorrect = selectedOption ? selectedOption.hasAttribute('data-correct') : false;

    answers.push({
      questionNumber: index + 1,
      questionText,
      studentAnswer: selectedOption ? selectedOption.value : 'No answer',
      correctAnswer: correctOption.value,
      isCorrect
    });
  });

  const score = answers.filter(a => a.isCorrect).length;
  const totalQuestions = answers.length;
  const scoreText = `${score}/${totalQuestions}`;

  const payload = {
    studentName,
    week,
    level,
    score: scoreText
  };

  if (responses.length > 0) {
    payload.responses = responses;
  }

  if (APP_TOKEN) {
    payload.token = APP_TOKEN;
  }

  await fetch(APP_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  await showAlert('Quiz responses submitted successfully!');
}
