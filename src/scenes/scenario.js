export const textCmdAliases = new Map([
  ["Всё ок, готова к следующему шагу", "continue"],
  ["Идем дальше", "continue"],
  ["Продолжить", "continue"],
  ["Следующий шаг", "continue"],
  ["Всё ок, готова к следующему шагу", "continue"],
  ["Всё ок, ещё в процессе", "in_process"],
  ["Нужна помощь", "need_help"],
  ["Начать сначала", "start_over"],
]);

const reminders = [
  {
    delay: 24,
    message: "Как ты? Нужна ли тебе поддержка?",
    buttons: [
      [{ text: "Всё ок, готова к следующему шагу" }],
      [{ text: "Всё ок, ещё в процессе" }],
    ],
  },
  {
    delay: 48,
    message: "Как ты? Нужна ли тебе поддержка?",
    buttons: [[{ text: "Идем дальше" }, { text: "Нужна помощь" }]],
  },
  {
    delay: 96,
    message:
      "Вижу, планы сложились иным образом! Благодарю за твоё внимание! Желаю всего замечательного! В любое время ты можешь продолжить наш марафон или начать сначала.",
    buttons: [[{ text: "Продолжить" }, { text: "Начать сначала" }]],
  },
];

export const scenario = [
  {
    name: "start",
    title: "Начало марафона",
    steps: [
      {
        message: {
          text: `Добро пожаловать на марафон! Я рада видеть тебя! Тебе предстоит пройти четыре задания-медитации. После каждого задания нажимай кнопку "Продолжить" и дождись следующего задания, оно придет через какое-то время. Если не получается пройти задание, я тебе напомню. А сейчас жми дальше`,
          image: "start.jpg",
          // video: "start.mp4",
        },
        buttons: [[{ text: "Продолжить" }]],
      },
    ],
    reminders,
  },
  {
    name: "step_1",
    title: "Первый шаг",
    steps: [
      {
        message: {
          text: "Это описание первого шага",
          image: "step.jpg",
          // video: "step.mp4",
        },
        buttons: [[{ text: "Продолжить" }]],
      },
      {
        message: {
          text: "Что ты почувствовала? Что важного дало тебе это задание?",
        },
        transitionCondition: (msg) => !!msg.text,
      },
      {
        message: {
          text: "Спасибо за твою обратную связь!",
        },
        buttons: [[{ text: "Следующий шаг" }]],
      },
    ],
    reminders,
  },
  {
    name: "step_2",
    title: "Второй шаг",
    steps: [
      {
        message: {
          text: "Это описание второго шага",
          image: "step.jpg",
          // video: "step.mp4",
        },
        buttons: [[{ text: "Продолжить" }]],
      },
      {
        message: {
          text: "Что ты почувствовала? Что важного дало тебе это задание?",
        },
        transitionCondition: (msg) => !!msg.text,
      },
      {
        message: {
          text: "Спасибо за твою обратную связь!",
        },
        buttons: [[{ text: "Следующий шаг" }]],
      },
    ],
    reminders,
  },
  {
    name: "step_3",
    title: "Третий шаг",
    steps: [
      {
        message: {
          text: "Это описание третьего шага",
          image: "step.jpg",
          // video: "step.mp4",
        },
        buttons: [[{ text: "Продолжить" }]],
      },
      {
        message: {
          text: "Что ты почувствовала? Что важного дало тебе это задание?",
        },
        transitionCondition: (msg) => !!msg.text,
      },
      {
        message: {
          text: "Спасибо за твою обратную связь!",
        },
        buttons: [[{ text: "Следующий шаг" }]],
      },
    ],
    reminders,
  },
  {
    name: "step_4",
    title: "Четвертый шаг",
    steps: [
      {
        message: {
          text: "Это описание четвертого шага",
          image: "step.jpg",
          // video: "step.mp4",
        },
        buttons: [[{ text: "Продолжить" }]],
      },
      {
        message: {
          text: "Что ты почувствовала? Что важного дало тебе это задание?",
        },
        transitionCondition: (msg) => !!msg.text,
      },
      {
        message: {
          text: "Спасибо за твою обратную связь!",
        },
        buttons: [[{ text: "Следующий шаг" }]],
      },
    ],
    reminders,
  },
  {
    name: "congratulation",
    title: "Поздравляю!",
    steps: [
      {
        message: {
          text: "Наш марафон закончился, поздравляю!",
          image: "end.jpg",
          video: "",
        },
        buttons: [[{ text: "Продолжить" }]],
      },
    ],
  },
  {
    name: "gratitude",
    title: "Благодарность",
    steps: [
      {
        message: {
          text: "Благодарю за участие",
          image: "namaste.jpg",
        },
        buttons: [[{ text: "Начать сначала" }]],
      },
    ],
    reminders: [
      {
        delay: 24,
        message:
          "У вас есть возможность записаться на консультацию, оплата - пожертвование. Если вам интересно напишите мне @sym_sergei_vasilenko",
      },
    ],
  },
];
