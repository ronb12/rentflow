"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Calendar, Download, Plus } from "lucide-react";

interface OwnerStatement {
  id: string;
  ownerId: string;
  statementPeriodStart: number;
  statementPeriodEnd: number;
  totalCollections: number;
  totalExpenses: number;
  netAmount: number;
  status: string;
  generatedAt: number;
  createdAt: number;
}

export default function OwnerStatementsPage() {
  const [statements, setStatements] = useState<OwnerStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [formData, setFormData] = useState({
    ownerId: "",
    periodStart: "",
    periodEnd: "",
  });

  useEffect(() => {
    fetchStatements();
  }, []);

  const fetchStatements = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/accounting/owner-statements");
      if (!response.ok) throw new Error("Failed to fetch statements");
      
      const data = await response.json();
      setStatements(data.statements || []);
    } catch (error) {
      console.error("Error fetching statements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      if (!formData.ownerId || !formData.periodStart || !formData.periodEnd) {
        alert("Please fill in all fields");
        return;
      }

      const response = await fetch("/api/accounting/owner-statements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to generate statement");

      await fetchStatements();
      setShowGenerate(false);
      setFormData({ ownerId: "", periodStart: "", periodEnd: "" });
    } catch (error) {
      console.error("Error generating statement:", error);
      alert("Failed to generate statement. Please try again.");
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Owner Statements</h1>
        <Button onClick={() => setShowGenerate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Generate Statement
        </Button>
      </div>

      {/* Generate Form */}
      {showGenerate && (
        <Card>
          <CardHeader>
            <CardTitle>Generate Owner Statement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Owner ID</Label>
                <Input
                  value={formData.ownerId}
                  onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                  placeholder="Enter owner ID"
                />
              </div>

              <div className="space-y-2">
                <Label>Period Start</Label>
                <Input
                  type="date"
                  value={formData.periodStart}
                  onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Period End</Label>
                <Input
                  type="date"
                  value={formData.periodEnd}
                  onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleGenerate}>Generate Statement</Button>
              <Button variant="outline" onClick={() => {
                setShowGenerate(false);
                setFormData({ ownerId: "", periodStart: "", periodEnd: "" });
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statements List - Table */}
      {loading ? (
        <div className="text-center py-8">Loading statements...</div>
      ) : statements.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No owner statements generated yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Owner</th>
                <th className="text-left px-3 py-2 font-medium">Period</th>
                <th className="text-left px-3 py-2 font-medium">Collections</th>
                <th className="text-left px-3 py-2 font-medium">Expenses</th>
                <th className="text-left px-3 py-2 font-medium">Net</th>
                <th className="text-left px-3 py-2 font-medium">Generated</th>
                <th className="text-left px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {statements.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{s.ownerId}</td>
                  <td className="px-3 py-2">{formatDate(s.statementPeriodStart)} – {formatDate(s.statementPeriodEnd)}</td>
                  <td className="px-3 py-2 text-green-700 font-medium">{formatCurrency(s.totalCollections)}</td>
                  <td className="px-3 py-2 text-red-700 font-medium">{formatCurrency(s.totalExpenses)}</td>
                  <td className="px-3 py-2">
                    <span className={`font-bold ${s.netAmount >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(s.netAmount)}</span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{formatDate(s.generatedAt)}</td>
                  <td className="px-3 py-2">
                    <a href={`/api/accounting/owner-statements/${s.id}/pdf`} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" /> PDF
                      </Button>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

