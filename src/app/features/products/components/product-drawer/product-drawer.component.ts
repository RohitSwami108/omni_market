import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProductItem } from '../../../../core/model/product.model';
import { Category } from '../../../../core/model/category.model';
import { InputErrorComponent } from '../../../../shared/components/input-error/input-error.component';

@Component({
  selector: 'app-product-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputErrorComponent],
  templateUrl: './product-drawer.component.html',
  styleUrl: './product-drawer.component.scss'
})
export class ProductDrawerComponent {
  readonly isOpen = input<boolean>(false);
  readonly mode = input<'create' | 'edit'>('create');
  readonly categories = input<Category[]>([]);
  readonly product = input<ProductItem | null>(null);

  readonly close = output<void>();
  readonly save = output<{ mode: 'create' | 'edit'; data: any }>();

  readonly isDraggingOver = signal<boolean>(false);
  readonly uploadedFile = signal<{ name: string; size: string; progress: number } | null>({
    name: 'omnigateway-pro-render.webp',
    size: '2.4 MB',
    progress: 82
  });

  readonly productForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
    sku: new FormControl('', [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/)]),
    categoryId: new FormControl('', [Validators.required]),
    price: new FormControl<number>(299.99, [Validators.required, Validators.min(0.01)]),
    stock: new FormControl<number>(50, [Validators.required, Validators.min(0)]),
    description: new FormControl('')
  });

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const currentMode = this.mode();
      const currentProd = this.product();

      if (open) {
        if (currentMode === 'edit' && currentProd) {
          this.productForm.setValue({
            name: currentProd.name,
            sku: currentProd.sku,
            categoryId: currentProd.categoryId,
            price: currentProd.price,
            stock: currentProd.stock,
            description: `Industrial-grade enterprise configuration for ${currentProd.name}`
          });
        } else if (currentMode === 'create') {
          this.productForm.reset({
            name: '',
            sku: '',
            categoryId: this.categories()[0]?.id || '',
            price: 199.99,
            stock: 25,
            description: ''
          });
        }
      }
    });
  }

  onSave(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    this.save.emit({
      mode: this.mode(),
      data: this.productForm.value
    });
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDraggingOver.set(true);
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    this.isDraggingOver.set(false);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDraggingOver.set(false);
    if (e.dataTransfer?.files.length) {
      const file = e.dataTransfer.files[0];
      this.handleFile(file);
    }
  }

  onFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    this.uploadedFile.set({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      progress: 100
    });
  }

  clearUploadedFile(): void {
    this.uploadedFile.set(null);
  }
}

