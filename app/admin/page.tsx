"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Home, ExternalLink, Search } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

interface Service {
  id: string
  service_name: string
  url_services: string
  updateAt: string
  createAt: string
  category: string
}

interface ServiceFormData {
  service_name: string
  url_services: string
  category: string
}

export default function AdminPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<ServiceFormData>({
    service_name: "",
    url_services: "",
    category: "",
  })

  const queryClient = useQueryClient()

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await fetch("/api/services")
      if (!response.ok) throw new Error("Failed to fetch services")
      return response.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to create service")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      setIsDialogOpen(false)
      resetForm()
      toast({ title: "Service created successfully" })
    },
    onError: () => {
      toast({ title: "Failed to create service", variant: "destructive" })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ServiceFormData }) => {
      const response = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update service")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      setIsDialogOpen(false)
      resetForm()
      toast({ title: "Service updated successfully" })
    },
    onError: () => {
      toast({ title: "Failed to update service", variant: "destructive" })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete service")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      toast({ title: "Service deleted successfully" })
    },
    onError: () => {
      toast({ title: "Failed to delete service", variant: "destructive" })
    },
  })

  const resetForm = () => {
    setFormData({ service_name: "", url_services: "", category: "" })
    setEditingService(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      service_name: service.service_name,
      url_services: service.url_services,
      category: service.category,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      deleteMutation.mutate(id)
    }
  }

  const categories = [
    "Electrical",
    "Planning",
    "Broadcasting",
    "Management",
    "Notification",
    "Gaming",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="glass-effect border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Service Management</h1>
              <p className="text-slate-300 mt-1">Manage your service directory with ease</p>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
                <Home className="w-4 h-4 mr-2" />
                Back to Hub
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Services</CardTitle>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{services.length}</div>
              <p className="text-xs opacity-80 mt-1">Active services</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Categories</CardTitle>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Badge className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{new Set(services.map((s: Service) => s.category)).size}</div>
              <p className="text-xs opacity-80 mt-1">Unique categories</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Recent Updates</CardTitle>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Edit className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {
                  services.filter((s: Service) => {
                    const updateDate = new Date(s.updateAt)
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return updateDate > weekAgo
                  }).length
                }
              </div>
              <p className="text-xs opacity-80 mt-1">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Service Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Services Directory</h2>
            <p className="text-slate-300">Manage all your services in one place</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={resetForm}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-0 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold gradient-text">
                  {editingService ? "Edit Service" : "Add New Service"}
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  {editingService ? "Update the service information." : "Fill in the details to add a new service."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="service_name" className="text-sm font-semibold text-slate-700">
                      Service Name
                    </Label>
                    <Input
                      id="service_name"
                      value={formData.service_name}
                      onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                      required
                      className="h-11 border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="url_services" className="text-sm font-semibold text-slate-700">
                      Service URL
                    </Label>
                    <Input
                      id="url_services"
                      type="url"
                      value={formData.url_services}
                      onChange={(e) => setFormData({ ...formData, url_services: e.target.value })}
                      required
                      className="h-11 border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category" className="text-sm font-semibold text-slate-700">
                      Category
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      required
                    >
                      <SelectTrigger className="h-11 border-slate-200 focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold h-11 px-8"
                  >
                    {editingService ? "Update" : "Create"} Service
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Services Table */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="font-semibold text-slate-700">Service Name</TableHead>
                  <TableHead className="font-semibold text-slate-700">Category</TableHead>
                  <TableHead className="font-semibold text-slate-700">URL</TableHead>
                  <TableHead className="font-semibold text-slate-700">Created</TableHead>
                  <TableHead className="font-semibold text-slate-700">Updated</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
                        <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse delay-75"></div>
                        <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse delay-150"></div>
                      </div>
                      <p className="text-slate-600 mt-2">Loading services...</p>
                    </TableCell>
                  </TableRow>
                ) : services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                        <Plus className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-slate-600 text-lg">No services found. Add your first service!</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service: Service) => (
                    <TableRow key={service.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium text-slate-800">{service.service_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
                        >
                          {service.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <a
                          href={service.url_services}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          Visit <ExternalLink className="w-3 h-3" />
                        </a>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {new Date(service.createAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {new Date(service.updateAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(service)}
                            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(service.id)}
                            disabled={deleteMutation.isPending}
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
