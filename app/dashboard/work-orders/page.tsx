"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench, Plus, Search, Calendar, User, Building2, AlertCircle, CheckCircle, Clock, Filter, Edit, Trash2 } from "lucide-react";
import { WorkOrderEditModal } from "@/components/modals/work-order-edit-modal";
import { WorkOrderAssignModal } from "@/components/modals/work-order-assign-modal";
import { WorkOrderScheduleModal } from "@/components/modals/work-order-schedule-modal";

export default function WorkOrdersPage() {
  const [recentRequests, setRecentRequests] = useState<Array<{ id: string; tenant_id: string; issue_type: string; description: string; priority: string; status: string; created_at: number }>>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/maintenance-requests');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        if (active) setRecentRequests((Array.isArray(data) ? data : []).slice(0, 5));
      } catch {
        if (active) setRecentRequests([]);
      } finally {
        if (active) setLoadingRequests(false);
      }
    })();
    return () => { active = false };
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);
  const [newAssignee, setNewAssignee] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    tenantName: "",
    property: "",
    priority: "medium",
    assignedTo: "",
    dueDate: "",
    estimatedCost: ""
  });

  // Sample work order data
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refreshWorkOrders() {
    try {
      const res = await fetch('/api/work-orders');
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setWorkOrders(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || 'Failed to load work orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refreshWorkOrders(); }, []);

  const [newWorkOrder, setNewWorkOrder] = useState({
    title: "",
    description: "",
    tenantName: "",
    property: "",
    priority: "medium",
    assignedTo: "",
    dueDate: "",
    estimatedCost: ""
  });

  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const workOrder = {
        id: `WO-${String(workOrders.length + 1).padStart(3, '0')}`,
        title: newWorkOrder.title,
        description: newWorkOrder.description,
        tenantName: newWorkOrder.tenantName,
        property: newWorkOrder.property,
        priority: newWorkOrder.priority,
        status: "pending",
        assignedTo: newWorkOrder.assignedTo,
        createdDate: new Date().toISOString().split('T')[0],
        dueDate: newWorkOrder.dueDate,
        estimatedCost: parseFloat(newWorkOrder.estimatedCost),
        actualCost: null
      };

      setWorkOrders(prev => [workOrder, ...prev]);
      setNewWorkOrder({ 
        title: "", description: "", tenantName: "", property: "", 
        priority: "medium", assignedTo: "", dueDate: "", estimatedCost: "" 
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating work order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (workOrderId: string, newStatus: string) => {
    setWorkOrders(prev => 
      prev.map(workOrder => 
        workOrder.id === workOrderId ? { ...workOrder, status: newStatus } : workOrder
      )
    );
  };

  const handleAssignTechnician = (workOrder: any) => {
    setSelectedWorkOrder(workOrder);
    setNewAssignee(workOrder.assignedTo);
    setShowAssignModal(true);
  };

  const handleScheduleWorkOrder = (workOrder: any) => {
    setSelectedWorkOrder(workOrder);
    setNewDueDate(workOrder.dueDate);
    setShowScheduleModal(true);
  };

  const handleUpdateAssignee = (assignee: string) => {
    if (!selectedWorkOrder) return;
    
    setWorkOrders(prev => 
      prev.map(workOrder => 
        workOrder.id === selectedWorkOrder.id 
          ? { ...workOrder, assignedTo: assignee.trim() }
          : workOrder
      )
    );
    
    setShowAssignModal(false);
    setSelectedWorkOrder(null);
    setNewAssignee("");
  };

  const handleUpdateDueDate = (dueDate: string) => {
    if (!selectedWorkOrder) return;
    
    setWorkOrders(prev => 
      prev.map(workOrder => 
        workOrder.id === selectedWorkOrder.id 
          ? { ...workOrder, dueDate: dueDate }
          : workOrder
      )
    );
    
    setShowScheduleModal(false);
    setSelectedWorkOrder(null);
    setNewDueDate("");
  };

  const handleEditWorkOrder = (workOrder: any) => {
    setSelectedWorkOrder(workOrder);
    setEditForm({
      title: workOrder.title,
      description: workOrder.description,
      tenantName: workOrder.tenantName,
      property: workOrder.property,
      priority: workOrder.priority,
      assignedTo: workOrder.assignedTo,
      dueDate: workOrder.dueDate,
      estimatedCost: workOrder.estimatedCost.toString()
    });
    setShowEditModal(true);
  };

  const handleUpdateWorkOrder = (updatedWorkOrder: any) => {
    setWorkOrders(prev => 
      prev.map(workOrder => 
        workOrder.id === updatedWorkOrder.id 
          ? updatedWorkOrder
          : workOrder
      )
    );
    
    setShowEditModal(false);
    setSelectedWorkOrder(null);
    setEditForm({
      title: "",
      description: "",
      tenantName: "",
      property: "",
      priority: "medium",
      assignedTo: "",
      dueDate: "",
      estimatedCost: ""
    });
  };

  const handleDeleteWorkOrder = (workOrderId: string) => {
    if (confirm('Are you sure you want to delete this work order?')) {
      setWorkOrders(prev => prev.filter(wo => wo.id !== workOrderId));
    }
  };

  const filteredWorkOrders = workOrders.filter(workOrder => {
    const matchesSearch = workOrder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workOrder.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workOrder.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workOrder.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || workOrder.status === filterStatus;
    const matchesPriority = filterPriority === "all" || workOrder.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalWorkOrders = workOrders.length;
  const pendingWorkOrders = useMemo(() => workOrders.filter(wo => wo.status === "pending").length, [workOrders]);
  const inProgressWorkOrders = useMemo(() => workOrders.filter(wo => wo.status === "in progress" || wo.status === "in_progress").length, [workOrders]);
  const completedWorkOrders = useMemo(() => workOrders.filter(wo => wo.status === "completed").length, [workOrders]);
  const totalEstimatedCost = useMemo(() => workOrders.reduce((sum, wo) => sum + (wo.estimated_cost || 0), 0), [workOrders]);
  const totalActualCost = useMemo(() => workOrders.reduce((sum, wo) => sum + (wo.actual_cost || 0), 0), [workOrders]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Work Order Management</h1>
        <p className="text-muted-foreground">Create, assign, and track maintenance and repair work orders.</p>
      </div>

      {/* Recent Maintenance Requests (from renters) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recent Maintenance Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRequests ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : recentRequests.length === 0 ? (
            <div className="text-sm text-muted-foreground">No recent requests.</div>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((r) => (
                <div key={r.id} className="flex items-start justify-between rounded-md border p-3">
                  <div className="mr-3">
                    <div className="font-medium capitalize">{r.issue_type}</div>
                    <div className="text-sm text-muted-foreground break-words">{r.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">Tenant: {r.tenant_id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium capitalize">{r.status}</div>
                    <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 text-sm">
            <a href="/dashboard/maintenance/manage" className="text-blue-600 hover:underline">Open full maintenance manager »</a>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkOrders}</div>
            <p className="text-xs text-muted-foreground">All work orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingWorkOrders}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressWorkOrders}</div>
            <p className="text-xs text-muted-foreground">Currently being worked on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedWorkOrders}</div>
            <p className="text-xs text-muted-foreground">Finished this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalActualCost || totalEstimatedCost}</div>
            <p className="text-xs text-muted-foreground">
              {totalActualCost ? 'Actual cost' : 'Estimated cost'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search work orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Work Order
          </Button>
        </div>
      </div>

      {/* Create Work Order Form (local create to API) */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Work Order</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateWorkOrder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Work Order Title</Label>
                  <Input
                    id="title"
                    value={newWorkOrder.title}
                    onChange={(e) => setNewWorkOrder(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter work order title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={newWorkOrder.priority}
                    onChange={(e) => setNewWorkOrder(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="tenantName">Tenant Name</Label>
                  <Input
                    id="tenantName"
                    value={newWorkOrder.tenantName}
                    onChange={(e) => setNewWorkOrder(prev => ({ ...prev, tenantName: e.target.value }))}
                    placeholder="Enter tenant name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="property">Property Address</Label>
                  <Input
                    id="property"
                    value={newWorkOrder.property}
                    onChange={(e) => setNewWorkOrder(prev => ({ ...prev, property: e.target.value }))}
                    placeholder="Enter property address"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="assignedTo">Assign To</Label>
                  <Input
                    id="assignedTo"
                    value={newWorkOrder.assignedTo}
                    onChange={(e) => setNewWorkOrder(prev => ({ ...prev, assignedTo: e.target.value }))}
                    placeholder="Enter technician name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newWorkOrder.dueDate}
                    onChange={(e) => setNewWorkOrder(prev => ({ ...prev, dueDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedCost">Estimated Cost</Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    value={newWorkOrder.estimatedCost}
                    onChange={(e) => setNewWorkOrder(prev => ({ ...prev, estimatedCost: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={newWorkOrder.description}
                  onChange={(e) => setNewWorkOrder(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter detailed description of the work needed"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Work Order'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Work Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Work Orders ({filteredWorkOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading…</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : filteredWorkOrders.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No work orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Work Order ID</th>
                    <th className="text-left p-2">Title</th>
                    <th className="text-left p-2">Tenant</th>
                    <th className="text-left p-2">Property</th>
                    <th className="text-left p-2">Priority</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Assigned To</th>
                    <th className="text-left p-2">Due Date</th>
                    <th className="text-left p-2">Cost</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkOrders.map((workOrder) => (
                    <tr key={workOrder.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{workOrder.id}</td>
                      <td className="p-2">{workOrder.title || '-'}</td>
                      <td className="p-2">{workOrder.tenant_id || '-'}</td>
                      <td className="p-2">{workOrder.property || '-'}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(workOrder.priority)}`}>
                          {workOrder.priority}
                        </span>
                      </td>
                      <td className="p-2">
                        <select
                          value={workOrder.status}
                          onChange={(e) => handleStatusChange(workOrder.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workOrder.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-2">{workOrder.assigned_to || ''}</td>
                      <td className="p-2">{workOrder.due_date ? new Date(workOrder.due_date).toLocaleDateString() : ''}</td>
                      <td className="p-2">
                        {workOrder.actualCost ? (
                          <span>${workOrder.actual_cost || 0}</span>
                        ) : (
                          <span>${workOrder.estimated_cost || 0}</span>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAssignTechnician(workOrder)}
                            title="Assign Technician"
                          >
                            <User className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleScheduleWorkOrder(workOrder)}
                            title="Schedule/Update Due Date"
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditWorkOrder(workOrder)}
                            title="Edit Work Order"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteWorkOrder(workOrder.id)}
                            title="Delete Work Order"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Technician Modal */}
      <WorkOrderAssignModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedWorkOrder(null);
          setNewAssignee("");
        }}
        workOrder={selectedWorkOrder}
        onSave={handleUpdateAssignee}
      />

      {/* Schedule Work Order Modal */}
      <WorkOrderScheduleModal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setSelectedWorkOrder(null);
          setNewDueDate("");
        }}
        workOrder={selectedWorkOrder}
        onSave={handleUpdateDueDate}
      />

      {/* Edit Work Order Modal */}
      <WorkOrderEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedWorkOrder(null);
          setEditForm({
            title: "",
            description: "",
            tenantName: "",
            property: "",
            priority: "medium",
            assignedTo: "",
            dueDate: "",
            estimatedCost: ""
          });
        }}
        workOrder={selectedWorkOrder}
        onSave={handleUpdateWorkOrder}
      />
    </div>
  );
}

