'use client';

import { useState } from 'react';
import { Set } from '@/db/schema';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { updateSetAction, deleteSetAction } from './actions';

interface SetsTableProps {
  sets: Set[];
  workoutExerciseId: string;
}

export function SetsTable({ sets, workoutExerciseId }: SetsTableProps) {
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'reps' | 'weight' | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [deleteSetId, setDeleteSetId] = useState<string | null>(null);

  async function handleEdit(setId: string, field: 'reps' | 'weight', currentValue: number | string | null) {
    setEditingSetId(setId);
    setEditingField(field);
    setEditValue(currentValue?.toString() ?? '');
  }

  async function handleSave(setId: string) {
    if (!editingField) return;

    const value = editValue === '' ? undefined : parseFloat(editValue);

    await updateSetAction({
      setId,
      [editingField]: value,
    });

    setEditingSetId(null);
    setEditingField(null);
    setEditValue('');
  }

  async function handleDelete(setId: string) {
    await deleteSetAction({ setId });
    setDeleteSetId(null);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, setId: string) {
    if (e.key === 'Enter') {
      handleSave(setId);
    } else if (e.key === 'Escape') {
      setEditingSetId(null);
      setEditingField(null);
    }
  }

  if (sets.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        No sets yet. Add your first set to get started.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Set</TableHead>
            <TableHead>Reps</TableHead>
            <TableHead>Weight (kg)</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sets.map((set) => (
            <TableRow key={set.id}>
              <TableCell className="font-medium">{set.setNumber}</TableCell>
              <TableCell>
                {editingSetId === set.id && editingField === 'reps' ? (
                  <Input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleSave(set.id)}
                    onKeyDown={(e) => handleKeyDown(e, set.id)}
                    className="w-20"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => handleEdit(set.id, 'reps', set.reps)}
                    className="text-left hover:underline"
                  >
                    {set.reps ?? '-'}
                  </button>
                )}
              </TableCell>
              <TableCell>
                {editingSetId === set.id && editingField === 'weight' ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleSave(set.id)}
                    onKeyDown={(e) => handleKeyDown(e, set.id)}
                    className="w-24"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => handleEdit(set.id, 'weight', set.weight)}
                    className="text-left hover:underline"
                  >
                    {set.weight ? parseFloat(set.weight).toFixed(2) : '-'}
                  </button>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteSetId(set.id)}
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteSetId !== null} onOpenChange={(open) => !open && setDeleteSetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Set</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this set? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSetId && handleDelete(deleteSetId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
