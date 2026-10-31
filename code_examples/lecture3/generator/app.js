// ========================================================
// 1. САГА / ГЕНЕРАТОР
// Возвращает ТОЛЬКО простые объекты (инструкции к действию)
// ========================================================
function* myDataSaga() {
  try {
    // 1. Инструкция запросить пользователя
    const user = yield { 
      type: 'FETCH', 
      url: 'https://jsonplaceholder.typicode.com/users/1',
      description: 'Загрузить профиль пользователя'
    };

    // 2. Инструкция запросить посты по ID полученного пользователя
    const posts = yield { 
      type: 'FETCH', 
      url: `https://jsonplaceholder.typicode.com/posts?userId=${user.id}`,
      description: `Загрузить посты для пользователя "${user.name}"`
    };

    // 3. Инструкция запросить комментарии к первому посту
    const comments = yield { 
      type: 'FETCH', 
      url: `https://jsonplaceholder.typicode.com/comments?postId=${posts[0].id}`,
      description: `Загрузить комментарии к посту "${posts[0].title.slice(0, 20)}..."`
    };

    return `Готово! Обработано ${comments.length} комментариев.`;

  } catch (err) {
    // Обработка при вызове .throw()
    log(`⚠️ [catch внутри генератора]: Сбой: ${err.message}`);
    yield { type: 'ERROR_STATE' };

  } finally {
    // Вызывается всегда: при завершении или при .return()
    log('🧹 [finally]: Генератор закрыт, ресурсы очищены.');
  }
}

// ========================================================
// 2. ВНЕШНИЙ РАННЕР (По клику на кнопку)
// Читает объекты эффектов и выполняет реальную работу
// ========================================================
let saga = null;
let lastApiData = null; // Данные, которые передадим в yield на следующем шаге

const logEl = document.getElementById('log');
const btnNext = document.getElementById('btn-next');
const btnCancel = document.getElementById('btn-cancel');
const btnThrow = document.getElementById('btn-throw');
const btnReset = document.getElementById('btn-reset');

function log(text) {
  logEl.textContent += '\n' + text;
}

function updateButtons(isRunning) {
  btnCancel.disabled = !isRunning;
  btnThrow.disabled = !isRunning;
}

// КНОПКА «СЛЕДУЮЩИЙ ШАГ» (.next)
btnNext.addEventListener('click', async () => {
  if (!saga) {
    saga = myDataSaga();
    logEl.textContent = '🚀 Процесс запущен';
    updateButtons(true);
  }

  btnNext.disabled = true;

  // 1. Вызываем .next() и передаем результат выполнения прошлого запроса
  const step = saga.next(lastApiData);

  if (step.done) {
    log(`🏁 Финал: ${step.value}`);
    saga = null;
    lastApiData = null;
    updateButtons(false);
    btnNext.disabled = false;
    return;
  }

  const effect = step.value;
  log(`\n📦 Генератор вернул объект-эффект:\n${JSON.stringify(effect, null, 2)}`);

  // 2. Внешний код сам решает, как исполнить этот объект
  if (effect.type === 'FETCH') {
    log(`⏳ Исполняем: ${effect.description}...`);
    
    const response = await fetch(effect.url);
    lastApiData = await response.json();

    log(`✅ Ответ получен! Нажмите кнопку снова для следующего шага.`);
  }

  btnNext.disabled = false;
});

// КНОПКА «ОТМЕНА» (.return)
btnCancel.addEventListener('click', () => {
  if (!saga) return;

  log('\n🛑 Нажата кнопка «Отмена» -> вызываем saga.return()');
  saga.return(); // Принудительно завершает генератор и вызывает finally

  saga = null;
  lastApiData = null;
  updateButtons(false);
});

// КНОПКА «СБОЙ» (.throw)
btnThrow.addEventListener('click', () => {
  if (!saga) return;

  log('\n⚡ Имитируем сбой сети -> вызываем saga.throw()');
  saga.throw(new Error('500 Server Crash')); // Пробрасывает ошибку в catch генератора

  saga = null;
  lastApiData = null;
  updateButtons(false);
});

// КНОПКА «СБРОС»
btnReset.addEventListener('click', () => {
  if (saga) saga.return();
  saga = null;
  lastApiData = null;
  logEl.textContent = 'Очищено. Нажмите «Следующий шаг»...';
  updateButtons(false);
  btnNext.disabled = false;
});