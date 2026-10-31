import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product';
import { CategoryService } from '../../core/services/category';
import { ProductItem, ProductFilters, PaginatedResponse } from '../../core/model/product.model';
import { Category } from '../../core/model/category.model';
import { ProductHeaderComponent } from './components/product-header/product-header.component';
import { ProductFilterDockComponent } from './components/product-filter-dock/product-filter-dock.component';
import { ProductTableComponent } from './components/product-table/product-table.component';
import { ProductPaginationComponent } from './components/product-pagination/product-pagination.component';
import { ProductDrawerComponent } from './components/product-drawer/product-drawer.component';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [
    CommonModule,
    ProductHeaderComponent,
    ProductFilterDockComponent,
    ProductTableComponent,
    ProductPaginationComponent,
    ProductDrawerComponent
  ],
  templateUrl: './product-catalog.component.html',
  styleUrl: './product-catalog.component.scss'
})
export class ProductCatalogComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

  // 1. UI & Drawer State Signals
  readonly isFilterDockOpen = signal<boolean>(true);
  readonly isDrawerOpen = signal<boolean>(false);
  readonly drawerMode = signal<'create' | 'edit'>('create');
  readonly selectedProductForEdit = signal<ProductItem | null>(null);
  readonly selectedRowIds = signal<Set<string>>(new Set<string>());

  // 2. Filter & Search Signals
  readonly searchQuery = signal<string>('');
  readonly selectedCategories = signal<string[]>([]);
  readonly priceRange = signal<{ min: number; max: number }>({ min: 50, max: 2400 });
  readonly stockFilter = signal<string>('all');

  // 3. Sorting & Pagination Signals
  readonly sortField = signal<keyof ProductItem | string>('name');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);

  // 4. Data State Signals
  readonly categoryOptions = signal<Category[]>([]);
  readonly productsList = signal<ProductItem[]>([]);
  readonly serverTotalCount = signal<number>(0);
  readonly isApiConnected = signal<boolean>(false);

  // Filtered & Sorted Display Products (client fallback if offline preview)
  readonly filteredProducts = computed(() => {
    let list = this.productsList();

    if (this.isApiConnected()) {
      return list;
    }

    const query = this.searchQuery().toLowerCase().trim();
    const cats = this.selectedCategories();
    const price = this.priceRange();
    const stockStatus = this.stockFilter();

    if (query) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.categoryId.toLowerCase().includes(query)
      );
    }

    if (cats.length > 0) {
      list = list.filter(p => cats.includes(p.categoryId));
    }

    list = list.filter(p => p.price >= price.min && p.price <= price.max);

    if (stockStatus === 'in_stock') {
      list = list.filter(p => p.stock > 0);
    } else if (stockStatus === 'low_stock') {
      list = list.filter(p => p.stock <= 10 && p.stock > 0);
    }

    const field = this.sortField() as keyof ProductItem;
    const dir = this.sortDirection() === 'asc' ? 1 : -1;

    return [...list].sort((a, b) => {
      const valA = a[field] ?? '';
      const valB = b[field] ?? '';
      if (typeof valA === 'string') {
        return (valA as string).localeCompare(valB as string) * dir;
      }
      return ((valA as number) - (valB as number)) * dir;
    });
  });

  readonly totalRecordsCount = computed(() => {
    return this.isApiConnected() ? this.serverTotalCount() : this.filteredProducts().length;
  });

  readonly isAllSelected = computed(() => {
    const list = this.filteredProducts();
    if (list.length === 0) return false;
    return list.every(p => this.selectedRowIds().has(p.id));
  });

  ngOnInit(): void {
    this.fetchCatalogData();
    this.fetchCategoriesData();
  }

  // Fetch catalog data from backend API with graceful fallback
  public fetchCatalogData(): void {
    const activeFilters: ProductFilters = {
      searchTerm: this.searchQuery(),
      sortBy: String(this.sortField()),
      sortOrder: this.sortDirection(),
      pageNumber: this.currentPage(),
      pageSize: this.pageSize(),
      minPrice: this.priceRange().min,
      maxPrice: this.priceRange().max,
      categories: this.selectedCategories()
    };

    this.productService.getProducts(activeFilters).subscribe({
      next: (response: PaginatedResponse<ProductItem>) => {
        if (response && Array.isArray(response.items)) {
          this.productsList.set(response.items);
          this.serverTotalCount.set(response.totalCount);
          this.isApiConnected.set(true);
        }
      },
      error: (err) => {
        console.warn('Catalog API unreachable (using offline preview mode):', err?.message || err);
        this.isApiConnected.set(false);
      }
    });
  }

  public fetchCategoriesData(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (res: Category[]) => {
        this.categoryOptions.set(res);
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      }
    });
  }

  // Search
  public onSearchChange(term: string): void {
    this.searchQuery.set(term);
    this.currentPage.set(1);
    this.fetchCatalogData();
  }

  // Sorting
  public handleSort(field: keyof ProductItem | string): void {
    if (this.sortField() === field) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
    this.fetchCatalogData();
  }

  // Pagination
  public changePage(newPage: number): void {
    this.currentPage.set(newPage);
    this.fetchCatalogData();
  }

  public changePageSize(newSize: number): void {
    this.pageSize.set(newSize);
    this.currentPage.set(1);
    this.fetchCatalogData();
  }

  // Dock & Filter actions
  public toggleFilterDock(): void {
    this.isFilterDockOpen.update(v => !v);
  }

  public toggleCategory(cat: string): void {
    this.selectedCategories.update(list => {
      return list.includes(cat) ? list.filter(c => c !== cat) : [...list, cat];
    });
    this.currentPage.set(1);
    this.fetchCatalogData();
  }

  public updatePriceRange(range: { min: number; max: number }): void {
    this.priceRange.set(range);
    this.currentPage.set(1);
    this.fetchCatalogData();
  }

  public updateStockFilter(status: string): void {
    this.stockFilter.set(status);
    this.currentPage.set(1);
    this.fetchCatalogData();
  }

  public resetFilters(): void {
    this.selectedCategories.set([]);
    this.priceRange.set({ min: 0, max: 5000 });
    this.stockFilter.set('all');
    this.currentPage.set(1);
    this.fetchCatalogData();
  }

  // Row Selection
  public toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedRowIds.set(new Set<string>());
    } else {
      this.selectedRowIds.set(new Set(this.filteredProducts().map(p => p.id)));
    }
  }

  public toggleSelectRow(id: string): void {
    this.selectedRowIds.update(set => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // Bulk actions
  public onExportBulk(): void {
    const selectedIds = Array.from(this.selectedRowIds());
    const selected = this.filteredProducts().filter(p => selectedIds.includes(p.id));
    const json = JSON.stringify(selected, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnimarket-products-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  public onArchiveBulk(): void {
    const selectedIds = Array.from(this.selectedRowIds());
    this.productsList.update(list => list.filter(p => !selectedIds.includes(p.id)));
    this.selectedRowIds.set(new Set());
  }

  // Action Drawer
  public openCreateDrawer(): void {
    this.drawerMode.set('create');
    this.selectedProductForEdit.set(null);
    this.isDrawerOpen.set(true);
  }

  public openEditDrawer(prod: ProductItem): void {
    this.drawerMode.set('edit');
    this.selectedProductForEdit.set(prod);
    this.isDrawerOpen.set(true);
  }

  public closeDrawer(): void {
    this.isDrawerOpen.set(false);
    this.selectedProductForEdit.set(null);
  }

  public deleteProduct(prod: ProductItem, event: MouseEvent): void {
    event.stopPropagation();
    this.productsList.update(list => list.filter(p => p.id !== prod.id));
    this.productService.deleteProduct(prod.id).subscribe({
      next: () => {
        this.fetchCatalogData();
      },
      error: (err) => {
        console.error('Error deleting product:', err);
      }
    });
  }

  public onSaveProduct(payload: { mode: 'create' | 'edit'; data: any }): void {
    const formVal = payload.data;
    const stockVal = formVal.stock ?? 0;
    const stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' =
      stockVal > 10 ? 'in_stock' : stockVal > 0 ? 'low_stock' : 'out_of_stock';

    if (payload.mode === 'create') {
      const newProd: ProductItem = {
        id: `prod-00${Date.now().toString().slice(-3)}`,
        name: formVal.name!,
        sku: formVal.sku!,
        categoryId: formVal.categoryId!,
        price: formVal.price!,
        stock: stockVal,
        stockStatus,
        imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=100&h=100&fit=crop&q=80',
        updatedAt: new Date().toISOString()
      };
      this.productService.createProduct(newProd).subscribe({
        next: () => {
          this.fetchCatalogData();
        },
        error: (err) => {
          console.warn('Failed to persist create to API, updating local preview:', err);
          this.productsList.update(list => [newProd, ...list]);
        }
      });
    } else {
      const current = this.selectedProductForEdit();
      if (current) {
        const updatedProd: ProductItem = {
          ...current,
          name: formVal.name!,
          sku: formVal.sku!,
          categoryId: formVal.categoryId!,
          price: formVal.price!,
          stock: stockVal,
          stockStatus,
          updatedAt: new Date().toISOString()
        };
        this.productService.updateProduct(current.id, updatedProd).subscribe({
          next: () => {
            this.fetchCatalogData();
          },
          error: (err) => {
            console.warn('Failed to persist update to API, updating local preview:', err);
            this.productsList.update(list =>
              list.map(p => (p.id === current.id ? updatedProd : p))
            );
          }
        });
      }
    }
    this.closeDrawer();
  }
}
