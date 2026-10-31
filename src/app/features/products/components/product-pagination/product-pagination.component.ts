import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-pagination.component.html',
  styleUrl: './product-pagination.component.scss'
})
export class ProductPaginationComponent {
  readonly currentPage = input<number>(1);
  readonly pageSize = input<number>(10);
  readonly totalCount = input<number>(0);
  readonly displayedCount = input<number>(0);

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  readonly totalPages = computed(() => {
    const total = this.totalCount();
    const size = this.pageSize();
    return Math.max(1, Math.ceil(total / size));
  });

  readonly startRecord = computed(() => {
    if (this.totalCount() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly endRecord = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalCount());
  });

  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, -1, total];
    }

    if (current >= total - 3) {
      return [1, -1, total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, -1, current - 1, current, current + 1, -1, total];
  });

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(event: Event): void {
    const newSize = +(event.target as HTMLSelectElement).value;
    this.pageSizeChange.emit(newSize);
  }
}

