import 'https://cdn.jsdelivr.net/npm/chart.js/dist/chart.umd.min.js';

import { formatDateToString } from '../../../script/utils.js';

/**
 * @typedef {import('../../../definition/google-sheets/get-entries-between-dates.response.mjs').GetEntriesBetweenDatesResponse} GetEntriesBetweenDatesResponse
 */

// @ts-ignore
const Chart = window.Chart;

export class ChartManager {
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {GetEntriesBetweenDatesResponse[]} entries
   * @param {'range'|'total'} mode
   */
  constructor(ctx, entries, mode = 'range') {
    this.ctx = ctx;
    this.entries = entries;
    this.mode = mode;
    this.chartInstance = null;

    this.dataModes = this.#computeDataModes(entries);
    this.labels = this.#computeLabels(entries);

    this.#render();
  }

  /**
   * @param {'range'|'total'} mode
   */
  setMode(mode) {
    this.mode = mode;

    this.#render();
  }

  /**
   * @param {GetEntriesBetweenDatesResponse[]} entries
   */
  updateData(entries) {
    this.entries = entries;

    this.dataModes = this.#computeDataModes(entries);
    this.labels = this.#computeLabels(entries);

    this.#render();
  }

  /**
   * @param {GetEntriesBetweenDatesResponse[]} entries
   */
  #computeLabels(entries) {
    return entries.map((entry) =>
      new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })
    );
  }

  /**
   * @param {GetEntriesBetweenDatesResponse[]} entries
   */
  #computeDataModes(entries) {
    return {
      range: entries.map((entry) => this.#getInOut(entry, 'range')),
      total: entries.map((entry) => this.#getInOut(entry, 'total')),
    };
  }

  /**
   * @param {GetEntriesBetweenDatesResponse} entry
   * @param {'range'|'total'} mode
   * @returns {number[]|number|null[]|null}
   */
  #getInOut(entry, mode) {
    let inDec = this.#parseHourToDecimal(entry.in);
    let outDec = this.#parseHourToDecimal(entry.out);

    if (inDec === null || outDec === null) {
      return mode === 'range' ? [null, null] : null;
    }

    if (outDec < inDec) {
      outDec += 24;
    }

    return mode === 'range' ? [inDec, outDec] : outDec - inDec;
  }

  /**
   * @param {string} hhmm
   * @returns {number|null}
   */
  #parseHourToDecimal(hhmm) {
    if (!hhmm) {
      return null;
    }

    const [h, m] = hhmm.split(':').map(Number);

    return h + m / 60;
  }

  /**
   * @param {'range'|'total'} mode
   * @returns {number[]}
   */
  #getMinMax(mode) {
    if (mode === 'range') {
      const all = this.dataModes.range.flat().filter((x) => x !== null);

      if (all.length === 0) {
        return [15, 23];
      }

      return [Math.floor(Math.min(...all)), Math.ceil(Math.max(...all))];
    } else {
      const all = /** @type {number[]} */ (this.dataModes.total.filter((x) => x !== null));

      return [0, Math.ceil(Math.max(...all, 8))];
    }
  }

  /**
   * @param {number} decimalHour
   * @returns {string}
   */
  #formatHour(decimalHour) {
    if (decimalHour == null) {
      return '-';
    }

    const sign = decimalHour < 0 ? '-' : '';
    decimalHour = Math.abs(decimalHour) % 24;
    const hours = Math.floor(decimalHour);
    const minutes = Math.round((decimalHour % 1) * 60);

    return `${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
  }

  #render() {
    document.getElementById('loading').style.display = 'none';

    if (!this.chartInstance) {
      this.chartInstance = new Chart(this.ctx, this.#getChartConfig());
    } else {
      const config = this.#getChartConfig();
      this.chartInstance.data.labels = config.data.labels;
      this.chartInstance.data.datasets[0].data = config.data.datasets[0].data;
      this.chartInstance.data.datasets[0].label = config.data.datasets[0].label;
      this.chartInstance.options.scales.y.min = config.options.scales.y.min;
      this.chartInstance.options.scales.y.max = config.options.scales.y.max;
      this.chartInstance.update();
    }
  }

  #getChartConfig() {
    const datasets =
      this.mode === 'range'
        ? [
            {
              label: 'In/Out',
              data: this.dataModes.range,
              backgroundColor: 'rgba(67,176,71,0.7)',
              borderRadius: 0,
            },
          ]
        : [
            {
              label: 'Worked',
              data: this.dataModes.total,
              backgroundColor: 'rgba(67,176,71,0.7)',
              borderRadius: 0,
            },
          ];

    const [minHour, maxHour] = this.#getMinMax(this.mode);

    return {
      type: 'bar',
      data: { labels: this.labels, datasets },
      options: {
        indexAxis: 'x',
        animation: {
          duration: 500,
          delay: function (context) {
            return context.dataIndex * 50;
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (context) => {
                const date = new Date(this.entries[context[0].dataIndex].date);

                return formatDateToString(date);
              },
              label: (context) => {
                if (this.mode === 'range') {
                  const [start, end] = context.raw;

                  return `In ${this.#formatHour(start)}, out ${this.#formatHour(end)}`;
                } else {
                  return `Worked ${this.#formatHour(context.raw)}`;
                }
              },
            },
          },
        },
        responsive: true,
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { display: false },
            min: minHour,
            max: maxHour,
            ticks: {
              callback: (val) => {
                if (this.mode === 'range') {
                  return (Math.floor(val) % 24).toString();
                } else {
                  return val + 'h';
                }
              },
              stepSize: 2,
              autoSkip: false,
              includeBounds: false,
            },
          },
        },
      },
    };
  }
}
