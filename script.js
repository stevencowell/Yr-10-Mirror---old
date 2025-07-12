function speakText(btn){
  const text = btn.parentElement.textContent.replace("🔊", "").trim();
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
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
  </script>
<script>
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
</script>
<script>
async function submitQuiz(button, week) {
  const studentName = prompt("Please enter your full name:");
  if (!studentName || studentName.trim() === '') {
    alert("You must enter your name to submit the quiz.");
    return;
  }

  const quizElement = button.closest('.quiz');
  const answers = Array.from(quizElement.querySelectorAll('li')).map((li, index) => {
    const questionText = li.querySelector('p').innerText;
    const selectedOption = li.querySelector('input[type="radio"]:checked');
    const correctOption = li.querySelector('input[data-correct="true"]');

    const isCorrect = selectedOption ? selectedOption.hasAttribute('data-correct') : false;

    return {
      questionNumber: index + 1,
      questionText,
      studentAnswer: selectedOption ? selectedOption.value : 'No answer',
      correctAnswer: correctOption.value,
      isCorrect
    };
  });

  const score = answers.filter(a => a.isCorrect).length;
  const totalQuestions = answers.length;
  const scoreText = `${score}/${totalQuestions}`;

  const payload = {
    studentName,
    week,
    score: scoreText
  };

  await fetch('https://script.google.com/macros/s/AKfycbya0EHlfInCNU8toTn0nNeHxJSIesb9V7ms4t1ZC7dflc9AJuraEHg4tS897fNNBsRm/exec', {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  alert('Quiz responses submitted successfully!');
}
