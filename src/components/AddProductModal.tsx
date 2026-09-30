import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Upload, ImageIcon, Star, AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import { Category, NewProductForm } from '../types';

const API_BASE = 'http://localhost:8000/api';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Dark Chocolate', slug: 'dark-chocolate' },
  { id: 2, name: 'Hot Chocolate', slug: 'hot-chocolate' },
];

const EMPTY_FORM: NewProductForm = {
  name: '',
  slug: '',
  description: '',
  price: '',
  discountPrice: '',
  categoryId: '',
  stockQuantity: '0',
  sku: '',
  status: 'Active',
  tags: '',
  sizes: [{ label: '', price: '', isPopular: false }],
};

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const AddProductModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState<NewProductForm>(EMPTY_FORM);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories on mount
  useEffect(() => {
    fetch(`${API_BASE}/categories.php`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
      })
      .catch(() => setCategories(DEFAULT_CATEGORIES));
  }, []);

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setForm(f => ({
      ...f,
      name: val,
      slug: toSlug(val),
    }));
    if (fieldErrors.name) setFieldErrors(e => ({ ...e, name: '' }));
  };

  const handleField = (key: keyof NewProductForm, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    if (fieldErrors[key]) setFieldErrors(e => ({ ...e, [key]: '' }));
  };

  // Size rows
  const addSizeRow = () => setForm(f => ({ ...f, sizes: [...f.sizes, { label: '', price: '', isPopular: false }] }));
  const removeSizeRow = (i: number) => setForm(f => ({ ...f, sizes: f.sizes.filter((_, idx) => idx !== i) }));
  const updateSize = (i: number, key: 'label' | 'price' | 'isPopular', val: string | boolean) => {
    setForm(f => {
      const sizes = [...f.sizes];
      sizes[i] = { ...sizes[i], [key]: val };
      return { ...f, sizes };
    });
  };

  // Image handling
  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const combined = [...imageFiles, ...files].slice(0, 5);
    setImageFiles(combined);
    const previews = combined.map(f => URL.createObjectURL(f));
    setImagePreviews(previews);
    setFieldErrors(err => ({ ...err, images: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (i: number) => {
    const updated = imageFiles.filter((_, idx) => idx !== i);
    setImageFiles(updated);
    setImagePreviews(updated.map(f => URL.createObjectURL(f)));
  };

  // Client-side validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 3)           errs.name        = 'Name must be at least 3 characters.';
    if (!form.slug.trim())                      errs.slug        = 'Slug is required.';
    if (!form.description.trim())               errs.description = 'Description is required.';
    if (!form.price || parseFloat(form.price) <= 0)
                                                errs.price       = 'Price must be greater than 0.';
    if (form.discountPrice && parseFloat(form.discountPrice) >= parseFloat(form.price))
                                                errs.discountPrice = 'Discount price must be less than price.';
    if (!form.categoryId)                       errs.categoryId  = 'Please select a category.';
    if (form.stockQuantity === '' || parseInt(form.stockQuantity) < 0)
                                                errs.stockQuantity = 'Stock must be 0 or more.';
    if (imageFiles.length === 0)                errs.images      = 'Upload at least 1 product image.';
    const validSizes = form.sizes.filter(s => s.label.trim() && parseFloat(s.price) > 0);
    if (validSizes.length === 0)                errs.sizes       = 'Add at least one size with a valid price.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setSubmitting(true);
    const fd = new FormData();
    fd.append('name',           form.name.trim());
    fd.append('slug',           form.slug.trim());
    fd.append('description',    form.description.trim());
    fd.append('price',          form.price);
    fd.append('discount_price', form.discountPrice);
    fd.append('category_id',    form.categoryId);
    fd.append('stock_quantity', form.stockQuantity);
    fd.append('sku',            form.sku.trim());
    fd.append('status',         form.status);
    fd.append('tags',           form.tags.trim());
    const validSizes = form.sizes.filter(s => s.label.trim() && parseFloat(s.price) > 0);
    fd.append('sizes',          JSON.stringify(validSizes));
    imageFiles.forEach(file => fd.append('images[]', file));

    try {
      const res = await fetch(`${API_BASE}/admin/products/create.php`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fields) setFieldErrors(data.fields);
        setSubmitError(data.error || 'Failed to create product.');
      } else {
        onSuccess();
        onClose();
      }
    } catch {
      setSubmitError('Network error. Is the PHP server running on localhost:8000?');
    } finally {
      setSubmitting(false);
    }
  };

  // Input class helpers
  const inputCls = (field: string) =>
    `w-full px-3 py-2.5 text-sm rounded-lg border ${
      fieldErrors[field]
        ? 'border-red-400 bg-red-50 focus:ring-red-300'
        : 'border-stone-300 bg-white focus:ring-amber-300'
    } focus:outline-none focus:ring-2 transition`;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-6 px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 bg-stone-900 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-serif font-bold text-amber-400 uppercase tracking-wider">Add New Product</h2>
            <p className="text-xs text-stone-400 mt-0.5">Fill all required fields. Product will appear on the storefront immediately.</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white transition p-1">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Name + Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Product Name *</label>
              <input type="text" value={form.name} onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. 85% Dark Chocolate"
                className={inputCls('name')} />
              {fieldErrors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{fieldErrors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Slug *</label>
              <input type="text" value={form.slug} onChange={e => handleField('slug', toSlug(e.target.value))}
                placeholder="auto-generated"
                className={inputCls('slug')} />
              {fieldErrors.slug && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{fieldErrors.slug}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Description *</label>
            <textarea value={form.description} onChange={e => handleField('description', e.target.value)}
              rows={4} placeholder="Full product description..."
              className={`${inputCls('description')} resize-none`} />
            {fieldErrors.description && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{fieldErrors.description}</p>}
          </div>

          {/* Price + Discount + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Price (₹) *</label>
              <input type="number" min="1" step="0.01" value={form.price} onChange={e => handleField('price', e.target.value)}
                placeholder="595"
                className={inputCls('price')} />
              {fieldErrors.price && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{fieldErrors.price}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Discount Price (₹)</label>
              <input type="number" min="0" step="0.01" value={form.discountPrice} onChange={e => handleField('discountPrice', e.target.value)}
                placeholder="Optional"
                className={inputCls('discountPrice')} />
              {fieldErrors.discountPrice && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{fieldErrors.discountPrice}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Category *</label>
              <select value={form.categoryId} onChange={e => handleField('categoryId', e.target.value)}
                className={inputCls('categoryId')}>
                <option value="">Select category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {fieldErrors.categoryId && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{fieldErrors.categoryId}</p>}
            </div>
          </div>

          {/* Stock + SKU + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Stock Quantity *</label>
              <input type="number" min="0" value={form.stockQuantity} onChange={e => handleField('stockQuantity', e.target.value)}
                className={inputCls('stockQuantity')} />
              {fieldErrors.stockQuantity && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{fieldErrors.stockQuantity}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">SKU</label>
              <input type="text" value={form.sku} onChange={e => handleField('sku', e.target.value)}
                placeholder="Optional unique code"
                className={inputCls('sku')} />
              {fieldErrors.sku && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{fieldErrors.sku}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Status *</label>
              <div className="flex items-center gap-3 mt-3">
                <button type="button"
                  onClick={() => setForm(f => ({ ...f, status: f.status === 'Active' ? 'Inactive' : 'Active' }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${form.status === 'Active' ? 'bg-green-500' : 'bg-stone-300'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.status === 'Active' ? 'left-6' : 'left-0.5'}`} />
                </button>
                <span className={`text-sm font-semibold ${form.status === 'Active' ? 'text-green-600' : 'text-stone-400'}`}>
                  {form.status}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Tags <span className="text-stone-400 normal-case font-normal">(comma-separated, optional)</span></label>
            <input type="text" value={form.tags} onChange={e => handleField('tags', e.target.value)}
              placeholder="dark chocolate, single origin, andhra"
              className={inputCls('tags')} />
          </div>

          {/* Size / Price Variants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Size Variants & Prices *</label>
              <button type="button" onClick={addSizeRow}
                className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-semibold transition">
                <Plus size={13}/> Add Size
              </button>
            </div>
            <div className="space-y-2">
              {form.sizes.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input type="text" value={s.label} onChange={e => updateSize(i, 'label', e.target.value)}
                    placeholder="e.g. 50g" className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300" />
                  <span className="text-stone-400 text-sm">₹</span>
                  <input type="number" min="1" value={s.price} onChange={e => updateSize(i, 'price', e.target.value)}
                    placeholder="Price" className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300" />
                  <button type="button" onClick={() => updateSize(i, 'isPopular', !s.isPopular)}
                    title="Mark as popular" className={`p-1.5 rounded-lg transition ${s.isPopular ? 'text-amber-500 bg-amber-50' : 'text-stone-300 hover:text-amber-400'}`}>
                    <Star size={15} fill={s.isPopular ? 'currentColor' : 'none'} />
                  </button>
                  {form.sizes.length > 1 && (
                    <button type="button" onClick={() => removeSizeRow(i)} className="text-red-400 hover:text-red-600 transition p-1.5 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {fieldErrors.sizes && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{fieldErrors.sizes}</p>}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">Product Images * <span className="text-stone-400 normal-case font-normal">(max 5, JPG/PNG/WebP, ≤ 2MB each)</span></label>

            {/* Image previews */}
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-stone-200 group">
                    <img src={src} alt={`Preview ${i+1}`} className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-0.5 left-0.5 bg-amber-500 text-white text-[9px] font-bold px-1 rounded">PRIMARY</span>
                    )}
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 5 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 hover:border-amber-400 hover:text-amber-500 transition">
                    <Plus size={20} />
                    <span className="text-[10px] mt-0.5">Add</span>
                  </button>
                )}
              </div>
            )}

            {imagePreviews.length === 0 && (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-xl py-10 flex flex-col items-center gap-2 transition ${
                  fieldErrors.images ? 'border-red-300 bg-red-50' : 'border-stone-300 hover:border-amber-400 bg-stone-50 hover:bg-amber-50/50'
                }`}>
                <Upload size={28} className={fieldErrors.images ? 'text-red-400' : 'text-stone-400'} />
                <span className="text-sm text-stone-500">Click to upload images</span>
                <span className="text-xs text-stone-400">JPG, PNG, WebP · Max 2MB each · Up to 5 files</span>
              </button>
            )}

            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
              multiple className="hidden" onChange={handleImageAdd} />
            {fieldErrors.images && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{fieldErrors.images}</p>}
          </div>

          {/* Server error banner */}
          {submitError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="px-6 py-2.5 text-sm font-semibold text-stone-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider">
              {submitting
                ? <><Loader size={15} className="animate-spin" /> Saving...</>
                : <><CheckCircle2 size={15} /> Add Product</>
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
