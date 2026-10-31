import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../../../core/model/category.model';

@Component({
  selector: 'app-product-filter-dock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-filter-dock.component.html',
  styleUrl: './product-filter-dock.component.scss'
})
export class ProductFilterDockComponent {
  readonly categories = input<Category[]>([]);
  readonly selectedCategories = input<string[]>([]);
  readonly priceRange = input<{ min: number; max: number }>({ min: 50, max: 2400 });
  readonly selectedStockFilter = input<string>('all');

  readonly categoryToggled = output<string>();
  readonly priceRangeChanged = output<{ min: number; max: number }>();
  readonly stockFilterChanged = output<string>();
  readonly reset = output<void>();

  onMinPriceChange(event: Event): void {
    const min = +(event.target as HTMLInputElement).value;
    this.priceRangeChanged.emit({
      min,
      max: this.priceRange().max
    });
  }

  onMaxPriceChange(event: Event): void {
    const max = +(event.target as HTMLInputElement).value;
    this.priceRangeChanged.emit({
      min: this.priceRange().min,
      max
    });
  }
}

