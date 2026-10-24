import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { InputErrorComponent } from '../../shared/components/input-error/input-error.component';

export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  imageUrl: string;
  updatedAt: string;
}

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputErrorComponent],
  templateUrl: './product-catalog.component.html',
  styleUrl: './product-catalog.component.scss'
})
export class ProductCatalogComponent {
  // UI State Signals
  readonly isFilterDockOpen = signal<boolean>(true);
  readonly isDrawerOpen = signal<boolean>(false);
  readonly drawerMode = signal<'create' | 'edit'>('create');
  
  // Table Interaction Signals
  readonly searchQuery = signal<string>('');
  readonly selectedCategories = signal<string[]>(['Electronics', 'Networking']);
  readonly priceRange = signal<{ min: number; max: number }>({ min: 50, max: 2400 });
  readonly sortField = signal<keyof ProductItem>('name');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly selectedRowIds = signal<Set<string>>(new Set<string>());

  // File Upload Simulation Signals
  readonly isDraggingOver = signal<boolean>(false);
  readonly uploadedFile = signal<{ name: string; size: string; progress: number } | null>({
    name: 'omnigateway-pro-render.webp',
    size: '2.4 MB',
    progress: 82
  });

  // Drawer Form
  readonly productForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
    sku: new FormControl('', [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/)]),
    category: new FormControl('Electronics', [Validators.required]),
    price: new FormControl(299.99, [Validators.required, Validators.min(0.01)]),
    stock: new FormControl(50, [Validators.required, Validators.min(0)]),
    description: new FormControl('')
  });

  // Category Catalog with Counts
  readonly categoryOptions = [
    { name: 'Electronics', count: 142 },
    { name: 'Networking', count: 68 },
    { name: 'Industrial Hardware', count: 89 },
    { name: 'Wearables & IoT', count: 34 },
    { name: 'Enterprise Servers', count: 51 }
  ];

  // Mock Enterprise Dataset
  private readonly rawProducts = signal<ProductItem[]>([
    {
      id: 'prod-001',
      name: 'OmniGateway Enterprise X1 Edge Hub',
      sku: 'OGW-EDG-9021',
      category: 'Networking',
      price: 1249.00,
      stock: 48,
      stockStatus: 'in_stock',
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=100&h=100&fit=crop&q=80',
      updatedAt: '2026-10-24 14:20'
    },
    {
      id: 'prod-002',
      name: 'TitanWave 10Gbps Managed SFP+ Switch',
      sku: 'TW-SFP-10G-24P',
      category: 'Networking',
      price: 899.50,
      stock: 6,
      stockStatus: 'low_stock',
      imageUrl: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=100&h=100&fit=crop&q=80',
      updatedAt: '2026-10-24 11:05'
    },
    {
      id: 'prod-003',
      name: 'AeroThermal Multi-Sensor Array IP67',
      sku: 'ATA-SEN-IP67',
      category: 'Wearables & IoT',
      price: 349.00,
      stock: 0,
      stockStatus: 'out_of_stock',
      imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=100&h=100&fit=crop&q=80',
      updatedAt: '2026-10-23 18:44'
    },
    {
      id: 'prod-004',
      name: 'OptiCore 2U Rackmount Dual Xeon Server',
      sku: 'OC-2U-XEON-96C',
      category: 'Enterprise Servers',
      price: 3899.00,
      stock: 14,
      stockStatus: 'in_stock',
      imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=100&h=100&fit=crop&q=80',
      updatedAt: '2026-10-24 09:12'
    },
    {
      id: 'prod-005',
      name: 'QuantumPoint Industrial Laser Scanner',
      sku: 'QP-LSR-SCAN-4K',
      category: 'Industrial Hardware',
      price: 1540.00,
      stock: 32,
      stockStatus: 'in_stock',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop&q=80',
      updatedAt: '2026-10-22 16:30'
    },
    {
      id: 'prod-006',
      name: 'CipherLock HSM Crypto Key Accelerator',
      sku: 'CLK-HSM-PCI-E5',
      category: 'Electronics',
      price: 2199.00,
      stock: 5,
      stockStatus: 'low_stock',
      imageUrl: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=100&h=100&fit=crop&q=80',
      updatedAt: '2026-10-24 08:15'
    },
    {
      id: 'prod-007',
      name: 'VortexPulse 32-Channel PoE Controller',
      sku: 'VP-POE-32CH-UL',
      category: 'Networking',
      price: 649.99,
      stock: 112,
      stockStatus: 'in_stock',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&h=100&fit=crop&q=80',
      updatedAt: '2026-10-21 20:00'
    }
  ]);

  // Filtered & Sorted Products
  readonly filteredProducts = computed(() => {
    let list = this.rawProducts();
    const query = this.searchQuery().toLowerCase().trim();
    const cats = this.selectedCategories();
    const price = this.priceRange();

    if (query) {
      list = list.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.sku.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    if (cats.length > 0) {
      list = list.filter(p => cats.includes(p.category));
    }

    list = list.filter(p => p.price >= price.min && p.price <= price.max);

    // Sorting
    const field = this.sortField();
    const dir = this.sortDirection() === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      const valA = a[field];
      const valB = b[field];
      if (typeof valA === 'string') {
        return (valA as string).localeCompare(valB as string) * dir;
      }
      return ((valA as number) - (valB as number)) * dir;
    });
  });

  readonly totalRecordsCount = computed(() => this.filteredProducts().length);

  readonly isAllSelected = computed(() => {
    const list = this.filteredProducts();
    if (list.length === 0) return false;
    return list.every(p => this.selectedRowIds().has(p.id));
  });

  // Action methods
  toggleFilterDock() {
    this.isFilterDockOpen.update(v => !v);
  }

  toggleCategory(cat: string) {
    this.selectedCategories.update(list => {
      return list.includes(cat) ? list.filter(c => c !== cat) : [...list, cat];
    });
  }

  updatePriceRange(field: 'min' | 'max', event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.priceRange.update(r => ({ ...r, [field]: value }));
  }

  handleSort(field: keyof ProductItem) {
    if (this.sortField() === field) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedRowIds.set(new Set<string>());
    } else {
      this.selectedRowIds.set(new Set(this.filteredProducts().map(p => p.id)));
    }
  }

  toggleSelectRow(id: string) {
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

  openCreateDrawer() {
    this.drawerMode.set('create');
    this.productForm.reset({
      category: 'Electronics',
      price: 199.99,
      stock: 25
    });
    this.isDrawerOpen.set(true);
  }

  openEditDrawer(prod: ProductItem) {
    this.drawerMode.set('edit');
    this.productForm.setValue({
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      price: prod.price,
      stock: prod.stock,
      description: `Industrial-grade enterprise configuration for ${prod.name}`
    });
    this.isDrawerOpen.set(true);
  }

  closeDrawer() {
    this.isDrawerOpen.set(false);
  }

  deleteProduct(prod: ProductItem, event: MouseEvent) {
    event.stopPropagation();
    this.rawProducts.update(list => list.filter(p => p.id !== prod.id));
  }

  saveProduct() {
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
        category: formVal.category!,
        price: formVal.price!,
        stock: formVal.stock!,
        stockStatus: (formVal.stock! > 10 ? 'in_stock' : formVal.stock! > 0 ? 'low_stock' : 'out_of_stock'),
        imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=100&h=100&fit=crop&q=80',
        updatedAt: 'Just now'
      };
      this.rawProducts.update(list => [newProd, ...list]);
    }
    this.closeDrawer();
  }

  // Drag and drop handlers
  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDraggingOver.set(true);
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.isDraggingOver.set(false);
  }

  onDrop(e: DragEvent) {
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

  clearUploadedFile() {
    this.uploadedFile.set(null);
  }
}
