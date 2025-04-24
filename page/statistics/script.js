import '../../script.js';
import 'https://cdn.jsdelivr.net/npm/chart.js';

import { fetchPage } from './utils.js';

window.onload = async function () {
  let currentMode = 'range';
  const ctx = document.getElementById("myChart").getContext("2d");
  let chartInstance = null;

  let actualPage = 0;

  let entries = await fetchPage(actualPage, true);
  let chartLabels = entries;
  let dataModes = { range: entries, total: entries };

  chartLabels = entries.map((entry) =>
    new Date(entry.date).toLocaleDateString("en-US", {
      weekday: "short",
    })
  );

  dataModes = {
    range: entries.map((entry) => {
      return getInOut(entry, "range");
    }),
    total: entries.map((entry) => {
      return getInOut(entry, "total");
    }),
  };

  renderChart(dataModes, chartLabels, entries);

  document.getElementById("showWorkedHours").addEventListener("change", (e) => {
    currentMode = e.target.checked ? "total" : "range";

    renderChart(dataModes, chartLabels, entries);
  });

  function getMinMax(mode, dataModes) {
    if (mode === "range") {
      const all = dataModes.range.flat().filter((x) => x !== null);
      return [Math.floor(Math.min(...all)), Math.ceil(Math.max(...all))];
    } else {
      const all = dataModes.total.filter((x) => x !== null);
      return [0, Math.ceil(Math.max(...all, 8))];
    }
  }

  function getInOut(entry, mode) {
    let inDec = parseHourToDecimal(entry.in);
    let outDec = parseHourToDecimal(entry.out);

    if (inDec === null || outDec === null) {
      return mode == "range" ? [null, null] : null;
    }

    if (outDec < inDec) {
      outDec += 24;
    }

    return mode == "range" ? [inDec, outDec] : outDec - inDec;
  }

  function renderChart(dataModes, labels, entries) {
    let datasets = [];

    if (currentMode === "range") {
      datasets = [
        {
          label: "In/Out",
          data: dataModes.range,
          backgroundColor: "rgba(67,176,71,0.7)",
          borderRadius: 0,
        },
      ];
    } else {
      datasets = [
        {
          label: "Worked",
          data: dataModes.total,
          backgroundColor: "rgba(67,176,71,0.7)",
          borderRadius: 0,
        },
      ];
    }

    const [minHour, maxHour] = getMinMax(currentMode, dataModes);

    if (!chartInstance) {
      chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets,
        },
        options: {
          indexAxis: "x",
          animation: {
            duration: 400,
            delay: function (context) {
              return context.dataIndex * 100;
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: function (context) {
                  const date = new Date(entries[context[0].dataIndex].date);
                  const formatted = date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return formatted;
                },
                label: function (context) {
                  if (currentMode == "range") {
                    const [start, end] = context.raw;

                    return `In ${formatHour(start)}, out ${formatHour(end)}`;
                  } else {
                    return `Worked ${formatHour(context.raw)}`;
                  }
                },
              },
            },
          },
          responsive: true,
          scales: {
            x: {
              grid: { display: false },
            },
            y: {
              grid: { display: false },
              min: minHour,
              max: maxHour,
              ticks: {
                callback: (val, idx, ticks) => {
                  if (currentMode === "range") {
                    if (ticks.length <= 2) {
                      return Math.floor(val).toString();
                    }

                    if (idx === 0 || idx === ticks.length - 1) {
                      return Math.floor(val).toString();
                    }

                    return Math.floor(val).toString();
                  } else {
                    return val + "h";
                  }
                },
                stepSize: 2,
                autoSkip: false,
                includeBounds: false,
              },
            },
          },
        },
      });
    } else {
      chartInstance.data.datasets[0].data = datasets[0].data;
      chartInstance.data.datasets[0].label = datasets[0].label;
      chartInstance.options.scales.y.min = minHour;
      chartInstance.options.scales.y.max = maxHour;
      chartInstance.update();
    }
  }

  function formatHour(d) {
    if (d == null) {
      return "-";
    }

    const sign = d < 0 ? "-" : "";
    d = Math.abs(d);
    const h = Math.floor(d);
    const m = Math.round((d % 1) * 60);

    return `${sign}${h}:${m.toString().padStart(2, "0")}`;
  }

  function parseHourToDecimal(hhmm) {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(":").map(Number);
    return h + m / 60;
  }
};
