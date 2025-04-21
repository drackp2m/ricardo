import { urls } from "./config.js";
import { getWeekDays } from "./utils.js";

window.onload = function () {
  const GOOGLE_SCRIPT_URL = urls.googleSheets;
  const userUuid = localStorage.getItem("userUuid");
  const { from, to } = getWeekDays(1, true);
  const body = new URLSearchParams({
    action: "getEntriesBetweenDates",
    userUuid,
    from,
    to,
  });

  fetch(`${GOOGLE_SCRIPT_URL}`, { method: "POST", body })
    .then((res) => res.json())
    .then((response) => {
      const entries = response.entries;
      const chartLabels = entries.map((entry) => entry.date);
      // Preprocesado de datos para los dos modos
      const dataModes = {
        floating: entries.map((entry) => {
          let inDec = parseHourToDecimal(entry.in);
          let outDec = parseHourToDecimal(entry.out);
          if (inDec === null || outDec === null) return null;
          if (outDec < inDec) outDec += 24;
          return [inDec, outDec];
        }),
        time: entries.map((entry) => {
          let inDec = parseHourToDecimal(entry.in);
          let outDec = parseHourToDecimal(entry.out);
          if (inDec === null || outDec === null) return null;
          if (outDec < inDec) outDec += 24;
          return outDec - inDec;
        }),
      };

      // Función para calcular min/max según modo
      function getMinMax(mode) {
        if (mode === "floating") {
          const all = dataModes.floating.flat().filter((x) => x !== null);
          return [Math.floor(Math.min(...all)), Math.ceil(Math.max(...all))];
        } else {
          const all = dataModes.time.filter((x) => x !== null);
          return [0, Math.ceil(Math.max(...all, 8))];
        }
      }

      // Inicialización del gráfico
      const ctx = document.getElementById("myChart").getContext("2d");
      let chartInstance = null;
      function renderChart(mode) {
        let datasets = [];
        // Siempre usa los mismos labels (chartLabels)
        // Solo cambia los datos de las barras
        if (mode === "floating") {
          datasets = [
            {
              label: "Entrada-Salida",
              data: dataModes.floating,
              backgroundColor: "rgba(67,176,71,0.7)",
              borderRadius: 0,
            },
          ];
        } else {
          datasets = [
            {
              label: "Worked",
              data: dataModes.time,
              backgroundColor: "rgba(67,176,71,0.7)",
              borderRadius: 0,
            },
          ];
        }
        const [minHour, maxHour] = getMinMax(mode);
        if (!chartInstance) {
          chartInstance = new Chart(ctx, {
            type: "bar",
            data: {
              labels: chartLabels.map((dateStr) => {
                const date = new Date(dateStr);
                return date.toLocaleDateString("en-US", {
                  weekday: "short",
                });
              }),
              datasets,
            },
            options: {
              indexAxis: "x",
              layout: {
                padding: {
                  left: 48 // Reserva 48px para los ticks del eje Y dentro del canvas
                }
              },
              animation: {
                duration: 800,
                delay: function(context) {
                  return context.dataIndex * 100;
                },
                transitions: {
                  active: {
                    animation: {
                      x: { duration: 600, easing: 'easeOutCubic' },
                      y: { duration: 600, easing: 'easeOutCubic' }
                    }
                  }
                }
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      if (mode === "floating") {
                        const [start, end] = context.raw;
                        return `Worked ${formatHour(
                          end - start
                        )}, from ${formatHour(start)} to ${formatHour(end)}`;
                      } else {
                        return `Worked ${formatHour(context.raw)}`;
                      }
                    },
                    title: function (context) {
                      const date = new Date(entries[context[0].dataIndex].date);
                      const formatted = date.toLocaleDateString("en-US");
                      const day = date.toLocaleDateString("en-US", {
                        weekday: "short",
                      });
                      return `${formatted} ${day}`;
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
                  min: minHour,
                  max: maxHour,
                  grid: { display: false },
                  ticks: {
                    callback: (val, idx, ticks) => {
                      if (mode === "floating") {
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
                    autoSkip: true,
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
        if (d == null) return "-";
        const sign = d < 0 ? "-" : "";
        d = Math.abs(d);
        const h = Math.floor(d);
        const m = Math.round((d % 1) * 60);
        return `${sign}${h}:${m.toString().padStart(2, "0")}`;
      }

      let currentMode = "floating";
      renderChart(currentMode);

      document
        .getElementById("chartModeToggle")
        .addEventListener("change", (e) => {
          currentMode = e.target.checked ? "floating" : "time";
          renderChart(currentMode);
        });
    });
  function parseHourToDecimal(hhmm) {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(":").map(Number);
    return h + m / 60;
  }
};
