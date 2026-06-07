import React from "react";
import { Plus, Trash2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "../../atoms/Button";
import Input from "../../atoms/Input";
import Select from "../../atoms/Select";
import StatusBadge from "../../molecules/StatusBadge";

interface ExpensesTabProps {
  expenses: any[];
  currentUser: any;
  expenseSearch: string;
  setExpenseSearch: (search: string) => void;
  expenseCatFilter: string;
  setExpenseCatFilter: (cat: string) => void;
  expenseStatusFilter: string;
  setExpenseStatusFilter: (status: string) => void;
  onOpenAddModal: () => void;
  onDeleteExpense: (id: string) => void;
}

export default function ExpensesTab({
  expenses,
  currentUser,
  expenseSearch,
  setExpenseSearch,
  expenseCatFilter,
  setExpenseCatFilter,
  expenseStatusFilter,
  setExpenseStatusFilter,
  onOpenAddModal,
  onDeleteExpense,
}: ExpensesTabProps) {
  // Filter expenses
  const filteredExpenses = (expenses || []).filter((exp) => {
    const matchesSearch =
      exp.supplierName?.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      exp.description?.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      exp.invoiceNumber?.toLowerCase().includes(expenseSearch.toLowerCase());

    const matchesCategory = expenseCatFilter === "All" || exp.category === expenseCatFilter;
    const matchesStatus = expenseStatusFilter === "All" || exp.status === expenseStatusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Unique categories of expenses
  const categoriesList = Array.from(new Set((expenses || []).map((e) => e.category)));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Actions & Filters Bar */}
      <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/60 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <Input
            type="text"
            placeholder="Search supplier, description, invoice..."
            value={expenseSearch}
            onChange={(e) => setExpenseSearch(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          {/* Category Filter */}
          <Select
            value={expenseCatFilter}
            onChange={(e) => setExpenseCatFilter(e.target.value)}
            className="min-w-[120px]"
          >
            <option value="All">All Categories</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
          {/* Status Filter */}
          <Select
            value={expenseStatusFilter}
            onChange={(e) => setExpenseStatusFilter(e.target.value)}
            className="min-w-[120px]"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </Select>
        </div>
        <Button onClick={onOpenAddModal}>
          Log Expense
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        </Button>
      </div>

      {/* Invoices Ledger Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/40 text-[10px] text-text-secondary uppercase tracking-wider">
                <th className="p-4">Supplier Name</th>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Date</th>
                <th className="p-4">Category</th>
                <th className="p-4">Description</th>
                <th className="p-4">Status</th>
                <th className="p-4">Amount</th>
                {currentUser?.role === "admin" && <th className="p-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={currentUser?.role === "admin" ? 8 : 7}
                    className="p-8 text-center text-xs text-text-secondary uppercase tracking-wider"
                  >
                    No matching expenses found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="p-4 text-xs font-semibold text-text-primary">
                      {exp.supplierName || "-"}
                    </td>
                    <td className="p-4 text-xs text-text-secondary font-mono">
                      {exp.invoiceNumber || "-"}
                    </td>
                    <td className="p-4 text-xs text-text-muted">
                      {new Date(exp.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="text-[9px] uppercase bg-zinc-900 px-2 py-0.5 rounded font-bold text-text-secondary border border-zinc-800">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-text-secondary max-w-xs truncate">
                      {exp.description}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={exp.status} />
                    </td>
                    <td className="p-4 text-xs font-mono font-bold text-text-primary">
                      ${(exp.amount / 100).toFixed(2)}
                    </td>
                    {currentUser?.role === "admin" && (
                      <td className="p-4 text-right">
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="text-text-muted hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
