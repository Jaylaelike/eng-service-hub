"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, ExternalLink, Settings } from "lucide-react"
import Link from "next/link"

interface Service {
  id: string
  service_name: string
  url_services: string
  updateAt: string
  createAt: string
  category: string
}

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const {
    data: services = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await fetch("/api/services")
      if (!response.ok) throw new Error("Failed to fetch services")
      return response.json()
    },
  })

  // Get unique categories
  const categories = Array.from(new Set(services.map((service: Service) => service.category)))

  // Filter services based on search term and category
  const filteredServices = services.filter((service: Service) => {
    const matchesSearch =
      service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">Error loading services. Please try again later.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="glass-effect border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Engineer Service Hub</h1>
              <p className="text-slate-600 mt-1">Discover Engineering services for Engineer Department Thaipbs.</p>
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm" className="bg-white/50 hover:bg-white/80 border-white/30">
                <Settings className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-slate-800 mb-4">
            Find the Perfect
            <span className="gradient-text"> Service</span>
          </h2>
        
        </div>

        {/* Search and Filter Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="glass-effect rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search for services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-0 bg-white/70 focus:bg-white shadow-sm"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[220px] h-12 border-0 bg-white/70 shadow-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8 text-center">
          <p className="text-slate-600 text-lg">
            {isLoading
              ? "Loading amazing services..."
              : `${filteredServices.length} service${filteredServices.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-white/50 border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="h-6 bg-slate-200 rounded-lg w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded-lg w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-10 bg-slate-200 rounded-lg w-full mt-4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-700 mb-2">No services found</h3>
            <p className="text-slate-500 text-lg">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service: Service) => (
              <Card
                key={service.id}
                className="card-hover bg-white/80 border-0 shadow-lg hover:shadow-2xl backdrop-blur-sm"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl font-bold text-slate-800 leading-tight">
                      {service.service_name}
                    </CardTitle>
                  </div>
                  <CardDescription className="mt-3">
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-3 py-1"
                    >
                      {service.category}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-slate-500 space-y-1">
                      <p>Created: {new Date(service.createAt).toLocaleDateString()}</p>
                      <p>Updated: {new Date(service.updateAt).toLocaleDateString()}</p>
                    </div>
                    <Button
                      asChild
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <a
                        href={service.url_services}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        Visit Service
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
