import { Component, input, computed } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartData, ChartOptions } from 'chart.js';
import { MatCardModule } from '@angular/material/card';

import type { Ingredient } from '../../../../core/models/ingredient.models';

/**
 * A professional palette derived from Material Design's primary hue scale.
 * Using dark-variant tones keeps the chart readable and enterprise-appropriate.
 */
const PALETTE = [
  '#1565C0', '#00695C', '#4527A0', '#AD1457',
  '#C62828', '#E65100', '#2E7D32', '#0277BD',
  '#37474F', '#6A1B9A',
];

@Component({
  selector: 'app-inventory-chart',
  imports: [BaseChartDirective, MatCardModule],
  templateUrl: './inventory-chart.component.html',
  styleUrl: './inventory-chart.component.scss',
})
export class InventoryChartComponent {
  /** The full ingredient list, passed down from the Dashboard. */
  readonly ingredients = input<Ingredient[]>([]);

  /** Aggregates ingredients by category and builds the Chart.js dataset. */
  readonly chartData = computed<ChartData<'doughnut'>>(() => {
    const categoryMap = new Map<string, number>();

    for (const item of this.ingredients()) {
      categoryMap.set(
        item.category,
        (categoryMap.get(item.category) ?? 0) + 1,
      );
    }

    const labels = [...categoryMap.keys()];

    return {
      labels,
      datasets: [
        {
          data: [...categoryMap.values()],
          backgroundColor: PALETTE.slice(0, labels.length),
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,0.9)',
          hoverOffset: 6,
        },
      ],
    };
  });

  readonly chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          padding: 16,
          font: { size: 13, family: 'Roboto, sans-serif' },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = (ctx.dataset.data as number[]).reduce(
              (a, b) => a + b,
              0,
            );
            const pct = total > 0
              ? Math.round(((ctx.parsed as number) / total) * 100)
              : 0;
            return ` ${ctx.label}: ${ctx.parsed as number} item${(ctx.parsed as number) !== 1 ? 's' : ''} (${pct}%)`;
          },
        },
      },
    },
  };

  /** True when there are no ingredients to chart. */
  readonly isEmpty = computed(() => this.ingredients().length === 0);
}
