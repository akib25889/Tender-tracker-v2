import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  AlertCircle,
  ExternalLink,
  Layers,
  FolderGit2,
  Sparkles,
} from 'lucide-react';
import { useTenders } from '../context/TenderContext';
import { useCategoriesQuery, useTendersQuery } from '../hooks/useTenderQueries';
import { TenderCategory } from '../types/tender';

const COLOR_OPTIONS = [
  { label: 'Blue', value: 'blue', dot: 'bg-blue-500' },
  { label: 'Purple', value: 'purple', dot: 'bg-purple-500' },
  { label: 'Emerald', value: 'emerald', dot: 'bg-emerald-500' },
  { label: 'Amber', value: 'amber', dot: 'bg-amber-500' },
  { label: 'Rose', value: 'rose', dot: 'bg-rose-500' },
  { label: 'Teal', value: 'teal', dot: 'bg-teal-500' },
  { label: 'Indigo', value: 'indigo', dot: 'bg-indigo-500' },
  { label: 'Cyan', value: 'cyan', dot: 'bg-cyan-500' },
];

export const getBadgeClasses = (color?: string) => {
  switch (color) {
    case 'purple':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'emerald':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'amber':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'rose':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'teal':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'indigo':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'cyan':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200';
  }
};

export const CategoriesPage: React.FC = () => {
  const {
    categories: contextCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    tenders: contextTenders,
  } = useTenders();

  const { data: queriedCategories } = useCategoriesQuery();
  const { data: queriedTenders } = useTendersQuery();

  const categories = queriedCategories || contextCategories || [];
  const tenders = queriedTenders || contextTenders || [];

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUsage, setFilterUsage] = useState<'ALL' | 'IN_USE' | 'UNUSED'>('ALL');

  // Modal / Drawer state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TenderCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catColor, setCatColor] = useState('blue');
  const [formError, setFormError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Delete confirmation modal
  const [deletingCat, setDeletingCat] = useState<TenderCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats calculation
  const stats = useMemo(() => {
    const total = categories.length;
    const inUse = categories.filter((c) => tenders.some((t) => t.category === c.name)).length;
    const unused = total - inUse;

    // Find most populated category
    let topCat = 'None';
    let maxCount = 0;
    categories.forEach((c) => {
      const count = tenders.filter((t) => t.category === c.name).length;
      if (count > maxCount) {
        maxCount = count;
        topCat = c.name;
      }
    });

    return { total, inUse, unused, topCat, maxCount };
  }, [categories, tenders]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        const matchesSearch =
          cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!matchesSearch) return false;

        const count = tenders.filter((t) => t.category === cat.name).length;
        if (filterUsage === 'IN_USE') return count > 0;
        if (filterUsage === 'UNUSED') return count === 0;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, searchTerm, filterUsage, tenders]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDesc('');
    setCatColor('blue');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: TenderCategory) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
    setCatColor(cat.color_badge || 'blue');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = catName.trim();
    if (!trimmedName) {
      setFormError('Category name is required.');
      return;
    }

    // Check duplicate
    const exists = categories.find(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase() && c.id !== editingCategory?.id
    );
    if (exists) {
      setFormError(`A category named "${trimmedName}" already exists.`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        const updated = await updateCategory(editingCategory.id, {
          name: trimmedName,
          description: catDesc.trim() || undefined,
          color_badge: catColor,
        });
        if (updated) {
          setNotification({
            type: 'success',
            message: `Category "${updated.name}" updated successfully.`,
          });
          setIsModalOpen(false);
        } else {
          setFormError('Failed to update category. Please try again.');
        }
      } else {
        const created = await addCategory({
          name: trimmedName,
          description: catDesc.trim() || undefined,
          color_badge: catColor,
        });
        if (created) {
          setNotification({
            type: 'success',
            message: `Category "${created.name}" created and synced to database.`,
          });
          setIsModalOpen(false);
        } else {
          setFormError('Failed to create category. Please try again.');
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCat) return;

    const inUseCount = tenders.filter((t) => t.category === deletingCat.name).length;
    if (inUseCount > 0) {
      setNotification({
        type: 'error',
        message: `Cannot delete "${deletingCat.name}" because it is currently assigned to ${inUseCount} tender(s).`,
      });
      setDeletingCat(null);
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await deleteCategory(deletingCat.id);
      if (ok) {
        setNotification({
          type: 'success',
          message: `Category "${deletingCat.name}" deleted from database.`,
        });
      } else {
        setNotification({
          type: 'error',
          message: 'Failed to delete category.',
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Error deleting category.',
      });
    } finally {
      setIsSubmitting(false);
      setDeletingCat(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-xs transition-all ${
            notification.type === 'success'
              ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 hover:opacity-75 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Tools &amp; Addons</span>
            <span>•</span>
            <span className="font-semibold text-[#0F172A]">Taxonomy Management</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            Scope of Work (SOW) Corporate Categories
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Database-backed enterprise categories assigned to tenders across all pipeline gates.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Total Categories
            </span>
            <span className="font-display text-2xl font-bold text-[#0F172A] mt-1 block">
              {stats.total}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Tags className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Assigned in Pipeline
            </span>
            <span className="font-display text-2xl font-bold text-emerald-600 mt-1 block">
              {stats.inUse}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <FolderGit2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Unassigned Taxonomies
            </span>
            <span className="font-display text-2xl font-bold text-[#64748B] mt-1 block">
              {stats.unused}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Top Pipeline Sector
            </span>
            <span className="font-display text-sm font-bold text-[#0F172A] mt-1 truncate block" title={stats.topCat}>
              {stats.topCat}
            </span>
            <span className="text-[10px] text-[#64748B] block mt-0.5">
              {stats.maxCount} active tender{stats.maxCount === 1 ? '' : 's'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Categories Card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        {/* Card Header & Controls */}
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="text-xs text-[#64748B]">
            Total registered categories in database:{' '}
            <strong className="text-[#0F172A] text-sm">{categories.length}</strong>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-hidden focus:ring-1 focus:ring-[#2563EB] w-48 sm:w-60"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center bg-[#E2E8F0]/60 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setFilterUsage('ALL')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filterUsage === 'ALL'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                All ({categories.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterUsage('IN_USE')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filterUsage === 'IN_USE'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                In Use ({stats.inUse})
              </button>
              <button
                type="button"
                onClick={() => setFilterUsage('UNUSED')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filterUsage === 'UNUSED'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Unused ({stats.unused})
              </button>
            </div>
          </div>
        </div>

        {/* Categories Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                <th className="py-3 px-4 w-64">Category Name</th>
                <th className="py-3 px-4">Scope &amp; Description</th>
                <th className="py-3 px-4 text-center w-28">Tenders</th>
                <th className="py-3 px-4 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[#64748B]">
                    <Tags className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
                    <p className="font-semibold text-[#0F172A]">No categories found</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">
                      {searchTerm
                        ? 'Try adjusting your search criteria.'
                        : 'Click "Add New Category" above to register your first corporate category.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const inUseCount = tenders.filter((t) => t.category === cat.name).length;
                  return (
                    <tr key={cat.id} className="hover:bg-[#F8FAFC] transition-colors group">
                      {/* Category Name & Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${getBadgeClasses(
                            cat.color_badge
                          )}`}
                        >
                          <span className="w-2 h-2 rounded-full bg-current opacity-85 shrink-0" />
                          <span className="truncate">{cat.name}</span>
                        </span>
                      </td>

                      {/* Scope & Description */}
                      <td className="py-3 px-4 text-[#475569] text-xs">
                        {cat.description ? (
                          <span className="line-clamp-2 leading-relaxed">{cat.description}</span>
                        ) : (
                          <span className="text-[#94A3B8] italic">Imported from active tenders.</span>
                        )}
                      </td>

                      {/* Assigned Tenders */}
                      <td className="py-3 px-4 text-center">
                        {inUseCount > 0 ? (
                          <Link
                            to={`/tenders?category=${encodeURIComponent(cat.name)}`}
                            className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] hover:text-[#1D4ED8] transition-colors"
                            title={`View ${inUseCount} tender(s) in ${cat.name}`}
                          >
                            <span>{inUseCount}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </Link>
                        ) : (
                          <span className="font-mono text-xs font-semibold text-[#94A3B8] px-2 py-0.5">
                            0
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            title="Edit Category"
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingCat(cat)}
                            title={
                              inUseCount > 0
                                ? `Assigned to ${inUseCount} active tender(s). Cannot delete.`
                                : 'Delete Category'
                            }
                            disabled={inUseCount > 0}
                            className={`p-1.5 rounded-lg transition-colors ${
                              inUseCount > 0
                                ? 'text-[#CBD5E1] cursor-not-allowed opacity-50'
                                : 'text-[#64748B] hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl border border-[#E2E8F0] max-w-lg w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <Tags className="w-4 h-4 text-[#2563EB]" />
                <h3 className="font-bold text-sm text-[#0F172A]">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cloud & Cyber Security"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:outline-hidden focus:ring-1 focus:ring-[#2563EB]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1.5">
                  Badge Theme Color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCatColor(c.value)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                        catColor === c.value
                          ? 'ring-2 ring-offset-1 ring-[#2563EB] font-bold border-transparent'
                          : 'border-[#E2E8F0] opacity-75 hover:opacity-100'
                      } ${getBadgeClasses(c.value)}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Scope &amp; Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Cloud migration, FedRAMP/ISO 27001 architectures, perimeter security, and SOC operations."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:outline-hidden focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#475569] rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg font-semibold shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl border border-[#E2E8F0] max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#0F172A]">Delete Category</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Are you sure you want to delete <strong className="text-[#0F172A]">"{deletingCat.name}"</strong>?
                </p>
              </div>
            </div>

            <p className="text-xs text-[#64748B] bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
              This category has 0 linked tenders and can be safely removed. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setDeletingCat(null)}
                className="px-3 py-1.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#475569] rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
