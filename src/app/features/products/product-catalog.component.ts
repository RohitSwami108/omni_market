import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProductService } from '../../core/services/product';
import { ProductItem, ProductFilters, PaginatedResponse } from '../../core/model/product.model';
import { InputErrorComponent } from '../../shared/components/input-error/input-error.component';
import { CategoryService } from '../../core/services/category';
import { Category } from '../../core/model/category.model';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputErrorComponent],
  templateUrl: './product-catalog.component.html',
  styleUrl: './product-catalog.component.scss'
})
export class ProductCatalogComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

  // 1. UI State Signals
  readonly isFilterDockOpen = signal<boolean>(true);
  readonly isDrawerOpen = signal<boolean>(false);
  readonly drawerMode = signal<'create' | 'edit'>('create');
  readonly selectedRowIds = signal<Set<string>>(new Set<string>());

  // 2. Filter & Search Signals
  readonly searchQuery = signal<string>('');
  readonly selectedCategories = signal<string[]>([]);
  readonly priceRange = signal<{ min: number; max: number }>({ min: 50, max: 2400 });

  // Aliases for backend consistency
  readonly searchTerm = this.searchQuery;
  readonly minPrice = computed(() => this.priceRange().min);
  readonly maxPrice = computed(() => this.priceRange().max);

  // 3. Sorting & Pagination Signals
  readonly sortField = signal<keyof ProductItem | string>('name');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);

  // Aliases
  readonly sortBy = this.sortField;
  readonly sortOrder = this.sortDirection;
  readonly pageNumber = this.currentPage;

  // 4. File Upload Simulation Signals
  readonly isDraggingOver = signal<boolean>(false);
  readonly uploadedFile = signal<{ name: string; size: string; progress: number } | null>({
    name: 'omnigateway-pro-render.webp',
    size: '2.4 MB',
    progress: 82
  });

  // 5. Drawer Form
  readonly productForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
    sku: new FormControl('', [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/)]),
    categoryId: new FormControl('', [Validators.required]),
    price: new FormControl(299.99, [Validators.required, Validators.min(0.01)]),
    stock: new FormControl(50, [Validators.required, Validators.min(0)]),
    description: new FormControl('')
  });

  // 6. Categories Definition
  private categoryOptions = signal<Category[]>([]);
  readonly productsList = signal<ProductItem[]>([]);
  readonly serverTotalCount = signal<number>(this.productsList().length);
  readonly isApiConnected = signal<boolean>(false);

  // Filtered & Sorted Display Products
  readonly filteredProducts = computed(() => {
    // If connected to API, the server already sorts and paginates
    if (this.isApiConnected()) {
      return this.productsList();
    }

    // Client-side fallback computation
    let list = this.productsList();
    const query = this.searchQuery().toLowerCase().trim();
    const cats = this.selectedCategories();
    const price = this.priceRange();

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
        // Backend not online or returned error: keep UI fully functional with fallback catalog
        console.warn('Catalog API unreachable (using offline preview mode):', err?.message || err);
        this.isApiConnected.set(false);
      }
    });
  }
  fetchCategoriesData() {
    this.categoryService.getAllCategories().subscribe({
      next: (res: Category[]) => {
        this.categoryOptions.set(res);
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      }
    })
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

  public changeSort(columnName: string): void {
    this.handleSort(columnName);
  }

  // Pagination
  public changePage(newPage: number): void {
    this.currentPage.set(newPage);
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
    this.fetchCatalogData();
  }

  public updatePriceRange(field: 'min' | 'max', event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.priceRange.update(r => ({ ...r, [field]: value }));
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

  // Action Drawer
  public openCreateDrawer(): void {
    this.drawerMode.set('create');
    this.productForm.reset({
      price: 199.99,
      stock: 25
    });
    this.isDrawerOpen.set(true);
  }

  public openEditDrawer(prod: ProductItem): void {
    this.drawerMode.set('edit');
    this.productForm.setValue({
      name: prod.name,
      sku: prod.sku,
      categoryId: prod.categoryId,
      price: prod.price,
      stock: prod.stock,
      description: `Industrial-grade enterprise configuration for ${prod.name}`
    });
    this.isDrawerOpen.set(true);
  }

  public closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  public deleteProduct(prod: ProductItem, event: MouseEvent): void {
    event.stopPropagation();
    this.productsList.update(list => list.filter(p => p.id !== prod.id));
  }

  public saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    const formVal = this.productForm.value;
    if (this.drawerMode() === 'create') {
      const newProd: ProductItem = {
        id: `prod-00${Date.now().toString().slice(-3)}`,
        name: formVal.name!,
        sku: formVal.sku!,
        categoryId: formVal.categoryId!,
        price: formVal.price!,
        stock: formVal.stock!,
        stockStatus: (formVal.stock! > 10 ? 'in_stock' : formVal.stock! > 0 ? 'low_stock' : 'out_of_stock'),
        imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=100&h=100&fit=crop&q=80',
        updatedAt: new Date().toISOString()
      };
      this.productService.createProduct(newProd).subscribe({
        next: (res) => {
          this.fetchCatalogData();
        }, error: () => {

        }
      })
    }
    this.closeDrawer();
  }

  // Drag and Drop
  public onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDraggingOver.set(true);
  }

  public onDragLeave(e: DragEvent): void {
    e.preventDefault();
    this.isDraggingOver.set(false);
  }

  public onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDraggingOver.set(false);
    if (e.dataTransfer?.files.length) {
      const file = e.dataTransfer.files[0];
      this.uploadedFile.set({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        progress: 100
      });
    }
  }

  public clearUploadedFile(): void {
    this.uploadedFile.set(null);
  }
}