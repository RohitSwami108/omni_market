import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductItem } from '../../../../core/model/product.model';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-table.component.html',
  styleUrl: './product-table.component.scss'
})
export class ProductTableComponent {
  readonly products = input<ProductItem[]>([]);
  readonly selectedRowIds = input<Set<string>>(new Set<string>());
  readonly sortField = input<keyof ProductItem | string>('name');
  readonly sortDirection = input<'asc' | 'desc'>('asc');
  readonly isAllSelected = input<boolean>(false);

  readonly sort = output<keyof ProductItem | string>();
  readonly toggleSelectAll = output<void>();
  readonly toggleSelectRow = output<string>();
  readonly edit = output<ProductItem>();
  readonly delete = output<{ product: ProductItem; event: MouseEvent }>();

  handleSort(field: keyof ProductItem | string): void {
    this.sort.emit(field);
  }

  onRowClick(product: ProductItem): void {
    this.toggleSelectRow.emit(product.id);
  }

  onCheckboxClick(event: Event, id: string): void {
    event.stopPropagation();
    this.toggleSelectRow.emit(id);
  }

  onTitleClick(event: MouseEvent, product: ProductItem): void {
    event.stopPropagation();
    this.edit.emit(product);
  }

  onEditClick(event: MouseEvent, product: ProductItem): void {
    event.stopPropagation();
    this.edit.emit(product);
  }

  onDeleteClick(event: MouseEvent, product: ProductItem): void {
    event.stopPropagation();
    this.delete.emit({ product, event });
  }
}

