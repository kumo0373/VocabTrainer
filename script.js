// استخدم Tesseract.js لاستخراج النصوص من الصور
const imageInput = document.getElementById('imageInput');
const extractTextBtn = document.getElementById('extractTextBtn');
const wordContainer = document.getElementById('wordContainer');
const wordsList = document.getElementById('wordsList');
const submitTranslations = document.getElementById('submitTranslations');
const testSection = document.getElementById('testSection');
const wordCountInput = document.getElementById('wordCount');
const testContainer = document.getElementById('testContainer');

let extractedWords = [];
let translations = {};

// تعبير عادي لتنظيف النصوص المستخرجة من الرموز غير المرغوبة
function cleanExtractedText(text) {
    return text.replace(/[0-9_\-|]/g, '').trim(); // إزالة الأرقام والرموز مثل _ و | 
}

// دالة لخلط ترتيب العناصر في مصفوفة (ترتيب عشوائي)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

extractTextBtn.addEventListener('click', () => {
    const file = imageInput.files[0];
    if (!file) return alert('يرجى رفع صورة!');

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.src = e.target.result;

        Tesseract.recognize(
            img.src,
            'ara', // اللغة العربية
            {
                logger: (m) => console.log(m),
            }
        ).then(({ data: { text } }) => {
            extractedWords = text
                .trim()
                .split('\n')
                .filter(word => word)
                .map(word => cleanExtractedText(word)); // تنظيف كل كلمة

            showWordsForTranslation(extractedWords);
        });
    };
    reader.readAsDataURL(file);
});

// عرض الكلمات لترجمتها
function showWordsForTranslation(words) {
    wordContainer.style.display = 'block';
    wordsList.innerHTML = '';

    words.forEach((word, index) => {
        const wordDiv = document.createElement('div');
        wordDiv.innerHTML = `
            <span>${word}</span>
            <input type="text" id="translation-${index}" placeholder="أدخل الترجمة الإنجليزية">
        `;
        wordsList.appendChild(wordDiv);
    });
}

// حفظ الترجمات في كائن
submitTranslations.addEventListener('click', () => {
    extractedWords.forEach((word, index) => {
        const translation = document.getElementById(`translation-${index}`).value.trim();
        if (translation) {
            translations[word] = translation.toLowerCase(); // حفظ الترجمات بحروف صغيرة
        }
    });
    alert('تم حفظ الترجمات بنجاح!');
    testSection.style.display = 'block';
    // إخفاء الترجمة بعد حفظها عند الضغط على زر ابدأ التسميع
});

// اختبار التسميع مع تصحيح الإجابات
document.getElementById('startTest').addEventListener('click', () => {
    const count = parseInt(wordCountInput.value, 10);

    // إذا كان العدد المطلوب أكبر من الكلمات المتاحة، إظهار رسالة
    if (count > extractedWords.length) {
        alert(`لقد اخترت عددًا أكبر من الكلمات المتاحة. اختر عددًا أقل أو يساوي ${extractedWords.length}`);
        return;
    }

    // إخفاء قائمة الكلمات بعد الضغط على زر ابدأ التسميع
    wordsList.style.display = 'none'; // إخفاء الترجمة

    // عرض الكلمات بشكل عشوائي
    const testWords = shuffleArray(extractedWords.slice(0, count));

    testContainer.innerHTML = '';
    testWords.forEach((word, index) => {
        const testDiv = document.createElement('div');
        testDiv.innerHTML = `
            <span>${word}</span>
            <input type="text" id="answer-${index}" placeholder="أدخل الترجمة الإنجليزية">
            <span id="result-${index}" class="result"></span>
        `;
        testContainer.appendChild(testDiv);
    });

    const submitTest = document.createElement('button');
    submitTest.innerText = 'تصحيح الإجابات';
    testContainer.appendChild(submitTest);

    submitTest.addEventListener('click', () => {
        let correctAnswers = 0;
        testWords.forEach((word, index) => {
            const answer = document.getElementById(`answer-${index}`).value.trim().toLowerCase(); // تجاهل الفرق بين الحروف الكبيرة والصغيرة
            const resultElement = document.getElementById(`result-${index}`);
            const inputElement = document.getElementById(`answer-${index}`);

            if (answer === translations[word].toLowerCase()) { // المقارنة تكون بالحروف الصغيرة
                resultElement.textContent = 'إجابة صحيحة ✅';
                resultElement.style.color = 'green';
                correctAnswers++;
            } else {
                resultElement.textContent = `إجابة خاطئة ❌ (الصحيح: ${translations[word]})`;
                resultElement.style.color = 'red';
            }

            // تعطيل الحقل بعد التصحيح
            inputElement.disabled = true;
        });

        // حساب الدرجة وعرضها
        const score = (correctAnswers / testWords.length) * 100;
        const scoreElement = document.createElement('div');
        scoreElement.innerHTML = `الدرجة: ${score}%`;
        testContainer.appendChild(scoreElement);

        // إضافة زرار لرفع صورة جديدة
        const newTestButton = document.createElement('button');
        newTestButton.innerText = 'رفع صورة جديدة';
        testContainer.appendChild(newTestButton);

        newTestButton.addEventListener('click', () => {
            // إعادة تحميل الصفحة أو إعادة تهيئة النظام لرفع صورة جديدة
            location.reload();
        });
    });
});
