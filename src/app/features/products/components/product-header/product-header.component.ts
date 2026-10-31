import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-header.component.html',
  styleUrl: './product-header.component.scss'
})
export class ProductHeaderComponent {
  readonly totalCount = input<number>(0);
  readonly searchQuery = input<string>('');
  readonly isFilterDockOpen = input<boolean>(true);
  readonly activeFilterCount = input<number>(0);
  readonly selectedCount = input<number>(0);

  readonly searchChange = output<string>();
  readonly toggleFilterDock = output<void>();
  readonly addProduct = output<void>();
  readonly exportBulk = output<void>();
  readonly archiveBulk = output<void>();

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchChange.emit(value);
  }
}

