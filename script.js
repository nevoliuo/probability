document.addEventListener("DOMContentLoaded", () => {
  // Навигация
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", () => {
      document
        .querySelectorAll(".menu-item")
        .forEach((i) => i.classList.remove("active"));
      document
        .querySelectorAll(".section")
        .forEach((s) => s.classList.remove("active"));
      item.classList.add("active");
      const target = item.dataset.target;
      if (target) document.getElementById(target)?.classList.add("active");
    });
  });

  // Общие опции для графиков
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 1.5,
    animation: { duration: 0 },
    layout: { padding: 20 },
    elements: { point: { radius: 3 } },
    plugins: { legend: { position: "top", labels: { font: { size: 14 } } } },
  };

  // Инициализация Pᵤ графика (вероятность с учётом удачи)
  const fav = document.getElementById("favorable");
  const tot = document.getElementById("total");
  const luckSlider = document.getElementById("luckRange");
  const luckValue = document.getElementById("luckValue");
  const baseProbEl = document.getElementById("baseProb");
  const luckProbEl = document.getElementById("luckProb");
  const ctxProb = document.getElementById("probChart").getContext("2d");
  const accent = getComputedStyle(document.documentElement)
    .getPropertyValue("--accent")
    .trim();

  const probChart = new Chart(ctxProb, {
    type: "line",
    data: {
      labels: Array.from({ length: 101 }, (_, i) => i),
      datasets: [
        {
          label: "Pᵤ",
          data: [],
          borderColor: accent,
          tension: 0.3,
          fill: false,
          pointRadius: 0,
        },
        {
          label: "U",
          data: [],
          type: "scatter",
          pointBackgroundColor: "#55efc4",
          pointRadius: 6,
          showLine: false,
        },
      ],
    },
    options: {
        ...commonOptions,
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Уровень удачи (U)",
                    font: { size: 14 }
                }
            },
            y: {
                title: {
                    display: true,
                    text: "Вероятность (Pᵤ)",
                    font: { size: 14 }
                },
                beginAtZero: true,
                max: 1,
                ticks: {
                    callback: function(value) {
                        return (value * 100).toFixed(0)
                    }
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${(context.parsed.y * 100).toFixed(2)}%`;
                    }
                }
            }
        }
    }
});

  function updateProb() {
    const k = +fav.value;
    const n = +tot.value;
    const U = +luckSlider.value;
    const base = n ? k / n : 0;
    const mod = Math.min(base * (1 + U / 100), 1);

    baseProbEl.textContent = base.toFixed(2);
    luckProbEl.textContent = mod.toFixed(2);
    luckValue.textContent = U;

    probChart.data.datasets[0].data = Array.from({ length: 101 }, (_, i) =>
      Math.min((k / n) * (1 + i / 100), 1)
    );
    probChart.data.datasets[1].data = [{ x: U, y: mod }];
    probChart.update();
  }
  [fav, tot, luckSlider].forEach((el) =>
    el.addEventListener("input", updateProb)
  );
  updateProb();

  // 1. Классическая вероятность
  new Chart(document.getElementById("chartClassical").getContext("2d"), {
    type: "line",
    data: {
      labels: ["1", "2", "3", "4", "5", "6"],
      datasets: [
        {
          label: "P(выпадения грани)",
          data: [1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6],
          borderColor: accent,
          fill: false,
          pointRadius: 4,
          tension: 0.2,
        },
      ],
    },
    options: {
      ...commonOptions,
      scales: {
        x: { title: { display: true, text: "Исходы (грани кубика)" } },
        y: {
          title: { display: true, text: "Вероятность" },
          beginAtZero: true,
          max: 1,
        },
      },
    },
  });

  // 2. Частотная (Закон больших чисел)
  const freqData = [];
  let heads = 0;
  for (let i = 1; i <= 1000; i++) {
    if (Math.random() < 0.5) heads++;
    freqData.push(heads / i);
  }
  new Chart(document.getElementById("chartFrequency").getContext("2d"), {
    type: "line",
    data: {
      labels: freqData.map((_, i) => i + 1),
      datasets: [
        { data: freqData, borderColor: accent, fill: false, pointRadius: 0 },
      ],
    },
    options: {
      ...commonOptions,
      scales: {
        x: {
          title: { display: true, text: "Количество бросков" },
          ticks: { autoSkip: true, maxTicksLimit: 20 },
        },
        y: {
          title: { display: true, text: "Частота орлов" },
          beginAtZero: true,
          max: 1,
        },
      },
    },
  });

  // 3. Аксиоматическая вероятность
  new Chart(document.getElementById("chartAxiomatic").getContext("2d"), {
    type: "bar",
    data: {
      labels: ["P(A)", "P(B)", "P(A∪B)"],
      datasets: [
        { data: [0.3, 0.4, 0.7], backgroundColor: [accent, accent, accent] },
      ],
    },
    options: {
      ...commonOptions,
      scales: {
        x: { title: { display: true, text: "События" } },
        y: {
          title: { display: true, text: "Вероятность" },
          beginAtZero: true,
          max: 1,
        },
      },
    },
  });

  // 4. Байесовская вероятность (распределения Бета)
  function gamma(n) {
    let r = 1;
    for (let i = 2; i < n; i++) r *= i;
    return r;
  }
  const xs = Array.from({ length: 200 }, (_, i) => i / 199);
  const pdf = (x, a, b) =>
    (Math.pow(x, a - 1) * Math.pow(1 - x, b - 1)) /
    ((gamma(a) * gamma(b)) / gamma(a + b));
  new Chart(document.getElementById("chartBayesian").getContext("2d"), {
    type: "line",
    data: {
      labels: xs,
      datasets: [
        {
          label: "Beta(2,2)",
          data: xs.map((v) => pdf(v, 2, 2)),
          borderColor: accent,
          fill: false,
          pointRadius: 0,
        },
        {
          label: "Beta(10,4)",
          data: xs.map((v) => pdf(v, 10, 4)),
          borderColor: getComputedStyle(document.documentElement)
            .getPropertyValue("--accent-light")
            .trim(),
          fill: false,
          pointRadius: 0,
        },
      ],
    },
    options: {
      ...commonOptions,
      scales: {
        x: { title: { display: true, text: "Вероятность успеха" } },
        y: {
          title: { display: true, text: "Плотность вероятности" },
          beginAtZero: true,
        },
      },
    },
  });

  // 5. Геометрическая вероятность (круг vs квадрат)
  new Chart(document.getElementById("chartGeometric").getContext("2d"), {
    type: "bar",
    data: {
      labels: ["Внутри", "Снаружи"],
      datasets: [
        {
          data: [Math.PI / 4, 1 - Math.PI / 4],
          backgroundColor: [accent, "#555"],
        },
      ],
    },
    options: {
      ...commonOptions,
      scales: {
        x: { title: { display: true, text: "Область" } },
        y: {
          title: { display: true, text: "Вероятность" },
          beginAtZero: true,
          max: 1,
        },
      },
    },
  });

  // 6. Индуктивное обучение (эмпирическая частота)
  const indData = [];
  let icount = 0;
  for (let i = 1; i <= 500; i++) {
    if (Math.random() < 0.5) icount++;
    indData.push(icount / i);
  }
  new Chart(document.getElementById("chartInductive").getContext("2d"), {
    type: "line",
    data: {
      labels: indData.map((_, i) => i + 1),
      datasets: [
        { data: indData, borderColor: accent, fill: false, pointRadius: 0 },
      ],
    },
    options: {
      ...commonOptions,
      scales: {
        x: { title: { display: true, text: "Количество испытаний" } },
        y: {
          title: { display: true, text: "Эмпирическая частота" },
          beginAtZero: true,
          max: 1,
        },
      },
    },
  });

  // Данные и график реальной жизни
  const events = [
    { label: "Дежавю", k: 7, n: 10 },
    { label: "Увидеть лицо умершего в незнакомце", k: 4, n: 10 },
    { label: "Фантомный запах", k: 3, n: 10 },
    { label: "Узнать незнакомую мелодии", k: 4, n: 10 },
    { label: "Выиграть в мини-лотерею", k: 206, n: 1000000 },
  ];

  let realLifeChart;
  function initRealLife() {
    const ctx = document.getElementById("realLifeChart").getContext("2d");
    const col = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent")
      .trim();
    const chart = new Chart(ctx, {
      type: "bar", // или 'line', если вы переделывали в линейный
      data: {
        labels: events.map((e) => e.label),
        datasets: [
          {
            label: "Базовая вероятность",
            data: events.map((e) => e.k / e.n),
            backgroundColor: "#555",
          },
          {
            label: "С учётом удачи",
            data: events.map((e) => e.k / e.n),
            backgroundColor: col,
          },
        ],
      },
      options: {
        ...commonOptions,
        scales: {
          x: {
            title: {
              display: true,
              text: "События",
            },
          },
          y: {
            title: {
              display: true,
              text: "Вероятность (0–1)",
            },
            beginAtZero: true,
            max: 1,
          },
        },
      },
    });

    return chart;
  }

  realLifeChart = initRealLife();

  document.getElementById("luckImpact").addEventListener("input", function (e) {
    const U = +e.target.value;
    document.getElementById("luckImpactValue").textContent = U;

    // Обновляем график реальной жизни
    const mod = events.map((ev) => Math.min((ev.k / ev.n) * (1 + U / 100), 1));
    if (realLifeChart) {
      realLifeChart.data.datasets[1].data = mod;
      realLifeChart.update();
    }
  });

  // Обновление реальной жизни по ползунку
  document.getElementById("luckRange").addEventListener("input", (e) => {
    const U = +e.target.value;
    document.getElementById("luckValue").textContent = U;
    const mod = events.map((ev) => Math.min((ev.k / ev.n) * (1 + U / 100), 1));
    realLifeChart.data.datasets[1].data = mod;
    realLifeChart.update();
  });
  // Тест удачи
  function calculateLuck() {
    const birthDate = new Date(document.getElementById("birthdate").value);
    let dateSum = 0;

    if (birthDate) {
      const dateStr = birthDate.toISOString().replace(/-/g, "").slice(0, 8);
      dateSum = [...dateStr].reduce((a, d) => a + parseInt(d), 0);
      dateSum = (dateSum % 20) + 1;
    }

    const luckyDays = Math.min(
      +document.getElementById("luckyDays").value || 0,
      31
    );
    const subjectiveLuck = Math.min(
      +document.getElementById("subjectiveLuck").value || 0,
      10
    );
    const family = +document.getElementById("family").value;
    const murka = +document.getElementById("murka").value;
    const lottery = +document.getElementById("lottery").value;
    const control = Math.min(
      +document.getElementById("control").value || 0,
      10
    );
    const kindness = +document.getElementById("kindness").value;
    const belief = +document.getElementById("belief").value;

    const luckFromDate = dateSum * 0.5;
    const luckFromDays = (luckyDays / 31) * 15;
    const luckFromFeeling = subjectiveLuck * 2;
    const luckFromControl = control * 1.5;

    const score =
      luckFromDate +
      luckFromDays +
      luckFromFeeling +
      family +
      murka +
      lottery +
      luckFromControl +
      kindness +
      belief;

    // Исправление ошибки в нормализации
    const normalizedScore = Math.min(
      Math.max(Math.round((score / 80) * 100), 0),
      100
    );

    // Обновляем интерфейс
    document.getElementById("result").innerHTML = `
      <div class="luck-test-result">
        <strong>Коэффициент удачи:</strong> ${normalizedScore}
      </div>`;

    // Синхронизация с ползунком и графиком реальной жизни
    const luckImpact = document.getElementById("luckImpact");
    luckImpact.value = normalizedScore;
    document.getElementById("luckImpactValue").textContent = normalizedScore;

    const mod = events.map((ev) =>
      Math.min((ev.k / ev.n) * (1 + normalizedScore / 100), 1)
    );
    if (realLifeChart) {
      realLifeChart.data.datasets[1].data = mod;
      realLifeChart.update();
    }
  }

  // Исправление инициализации кнопки
  document
    .querySelector('button[onclick="calculateLuck()"]')
    .addEventListener("click", calculateLuck);
});
