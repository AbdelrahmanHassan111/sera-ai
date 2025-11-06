import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, CheckCircle, Calendar, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAppStore } from '@/store/useAppStore';
import { generateId, getCategoryIcon } from '@/lib/utils';
import type { LifestylePlanItem } from '@/types/domain';

export const LifestylePlanner: React.FC = () => {
  const { showToast } = useToast();
  const {
    lifestylePlan,
    addLifestylePlanItem,
    updateLifestylePlanItem,
    removeLifestylePlanItem,
    toggleLifestylePlanItem,
  } = useAppStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<LifestylePlanItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily' as LifestylePlanItem['frequency'],
    category: 'lifestyle' as LifestylePlanItem['category'],
  });

  const frequencyGroups = {
    daily: lifestylePlan.filter((item) => item.frequency === 'daily'),
    weekly: lifestylePlan.filter((item) => item.frequency === 'weekly'),
    monthly: lifestylePlan.filter((item) => item.frequency === 'monthly'),
    screening: lifestylePlan.filter((item) => item.frequency === 'screening'),
  };

  const handleAdd = () => {
    if (!formData.title.trim()) {
      showToast('Please enter a title', 'warning');
      return;
    }

    const newItem: LifestylePlanItem = {
      id: generateId('plan'),
      title: formData.title,
      description: formData.description,
      frequency: formData.frequency,
      category: formData.category,
      completed: false,
    };

    addLifestylePlanItem(newItem);
    showToast('Added to lifestyle plan', 'success');
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!editingItem) return;

    updateLifestylePlanItem(editingItem.id, {
      title: formData.title,
      description: formData.description,
      frequency: formData.frequency,
      category: formData.category,
    });

    showToast('Item updated', 'success');
    setEditingItem(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    removeLifestylePlanItem(id);
    showToast('Item removed', 'info');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      frequency: 'daily',
      category: 'lifestyle',
    });
  };

  const openEditModal = (item: LifestylePlanItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      frequency: item.frequency,
      category: item.category,
    });
  };

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-semibold text-text mb-2">Lifestyle Planner</h1>
              <p className="text-gray-600">
                Track actions and screenings based on your genetic profile
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </div>

          {lifestylePlan.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text mb-2">No Plan Items Yet</h3>
                <p className="text-gray-600 mb-6">
                  Add items from your recommendations or create custom ones
                </p>
                <Button onClick={() => setShowAddModal(true)}>Add Your First Item</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Daily Tasks */}
              {frequencyGroups.daily.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {frequencyGroups.daily.map((item) => (
                        <PlanItem
                          key={item.id}
                          item={item}
                          onToggle={() => toggleLifestylePlanItem(item.id)}
                          onEdit={() => openEditModal(item)}
                          onDelete={() => handleDelete(item.id)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Weekly Tasks */}
              {frequencyGroups.weekly.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {frequencyGroups.weekly.map((item) => (
                        <PlanItem
                          key={item.id}
                          item={item}
                          onToggle={() => toggleLifestylePlanItem(item.id)}
                          onEdit={() => openEditModal(item)}
                          onDelete={() => handleDelete(item.id)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Monthly Tasks */}
              {frequencyGroups.monthly.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {frequencyGroups.monthly.map((item) => (
                        <PlanItem
                          key={item.id}
                          item={item}
                          onToggle={() => toggleLifestylePlanItem(item.id)}
                          onEdit={() => openEditModal(item)}
                          onDelete={() => handleDelete(item.id)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Screenings */}
              {frequencyGroups.screening.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Screenings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {frequencyGroups.screening.map((item) => (
                        <PlanItem
                          key={item.id}
                          item={item}
                          onToggle={() => toggleLifestylePlanItem(item.id)}
                          onEdit={() => openEditModal(item)}
                          onDelete={() => handleDelete(item.id)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal || editingItem !== null}
        onClose={() => {
          setShowAddModal(false);
          setEditingItem(null);
          resetForm();
        }}
        title={editingItem ? 'Edit Item' : 'Add Lifestyle Item'}
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Take vitamin D supplement"
            required
          />

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional details..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) =>
                setFormData({ ...formData, frequency: e.target.value as any })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="screening">Screening / As Needed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Category</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as any })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="exercise">Exercise</option>
              <option value="diet">Diet</option>
              <option value="medication">Medication</option>
              <option value="screening">Screening</option>
              <option value="lifestyle">Lifestyle</option>
            </select>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setEditingItem(null);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={editingItem ? handleEdit : handleAdd}
              className="flex-1"
            >
              {editingItem ? 'Update' : 'Add'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

interface PlanItemProps {
  item: LifestylePlanItem;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const PlanItem: React.FC<PlanItemProps> = ({ item, onToggle, onEdit, onDelete }) => {
  return (
    <div
      className={`flex items-start gap-3 p-4 border rounded-lg transition-all ${
        item.completed
          ? 'bg-gray-50 border-gray-200 opacity-75'
          : 'bg-white border-gray-300 hover:border-primary'
      }`}
    >
      <button
        onClick={onToggle}
        className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          item.completed
            ? 'bg-primary border-primary'
            : 'border-gray-300 hover:border-primary'
        }`}
        aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {item.completed && <CheckCircle className="w-4 h-4 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4
            className={`font-medium ${
              item.completed ? 'text-gray-500 line-through' : 'text-text'
            }`}
          >
            {item.title}
          </h4>
          <Badge size="sm" variant="default">
            {getCategoryIcon(item.category)} {item.category}
          </Badge>
        </div>

        {item.description && (
          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
        )}

        {item.linkedRecommendationId && (
          <Badge size="sm" variant="primary" className="mt-2">
            Linked to recommendation
          </Badge>
        )}
      </div>

      <div className="flex gap-1">
        <button
          onClick={onEdit}
          className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded transition-colors"
          aria-label="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          aria-label="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

