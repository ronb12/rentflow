"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Calendar, TrendingUp, TrendingDown, Filter, Download } from "lucide-react";

interface Transaction {
  id: string;
  leaseId: string | null;
  invoiceId: string | null;
  transactionType: string;
  amount: number;
  dueDate: number | null;
  paidDate: number | null;
  paymentMethod: string | null;
  status: string;
  lateFeeAmount: number;
  notes: string | null;
  createdAt: number;
}

export default function RentLedgerPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [balance, setBalance] = useState({ total: 0, outstanding: 0, paid: 0 });

  useEffect(() => {
    fetchTransactions();
  }, [filterStatus, filterType]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      
      const response = await fetch(`/api/accounting/rent-ledger?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      
      const data = await response.json();
      let filtered = data.transactions || [];
      
      if (filterType !== "all") {
        filtered = filtered.filter((t: Transaction) => t.transactionType === filterType);
      }
      
      setTransactions(filtered);
      calculateBalance(filtered);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBalance = (trans: Transaction[]) => {
    const total = trans.reduce((sum, t) => sum + t.amount + t.lateFeeAmount, 0);
    const paid = trans
      .filter(t => t.status === "paid")
      .reduce((sum, t) => sum + t.amount + t.lateFeeAmount, 0);
    const outstanding = total - paid;
    
    setBalance({ total, paid, outstanding });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Rent Ledger</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balance.total)}</div>
            <p className="text-xs text-muted-foreground">All transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(balance.outstanding)}</div>
            <p className="text-xs text-muted-foreground">Unpaid amounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(balance.paid)}</div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="late_fee">Late Fee</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No transactions found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Late Fee</th>
                    <th className="text-left p-2">Due Date</th>
                    <th className="text-left p-2">Paid Date</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{formatDate(transaction.createdAt)}</td>
                      <td className="p-2 capitalize">{transaction.transactionType.replace("_", " ")}</td>
                      <td className="p-2 font-medium">{formatCurrency(transaction.amount)}</td>
                      <td className="p-2">
                        {transaction.lateFeeAmount > 0 ? (
                          <span className="text-red-600">{formatCurrency(transaction.lateFeeAmount)}</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-2">{formatDate(transaction.dueDate)}</td>
                      <td className="p-2">{formatDate(transaction.paidDate)}</td>
                      <td className="p-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            transaction.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : transaction.status === "overdue"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

