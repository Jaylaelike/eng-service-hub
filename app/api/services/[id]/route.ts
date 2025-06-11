import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const CSV_FILE_PATH = path.join(process.cwd(), "data", "services.csv")

interface Service {
  id: string
  service_name: string
  url_services: string
  updateAt: string
  createAt: string
  category: string
}

// Parse CSV content to JSON
function parseCSV(csvContent: string): Service[] {
  const lines = csvContent.trim().split("\n")
  if (lines.length <= 1) return []

  const headers = lines[0].split(",").map((h) => h.trim())
  const services: Service[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim())
    if (values.length === headers.length) {
      const service: any = {}
      headers.forEach((header, index) => {
        service[header] = values[index]
      })
      services.push(service as Service)
    }
  }

  return services
}

// Convert JSON to CSV
function jsonToCSV(services: Service[]): string {
  if (services.length === 0) {
    return "id,service_name,url_services,updateAt,createAt,category\n"
  }

  const headers = ["id", "service_name", "url_services", "updateAt", "createAt", "category"]
  const csvContent = [
    headers.join(","),
    ...services.map((service) => headers.map((header) => service[header as keyof Service]).join(",")),
  ].join("\n")

  return csvContent
}

// Read services from CSV
async function readServices(): Promise<Service[]> {
  try {
    const csvContent = await fs.readFile(CSV_FILE_PATH, "utf-8")
    return parseCSV(csvContent)
  } catch (error) {
    return []
  }
}

// Write services to CSV
async function writeServices(services: Service[]): Promise<void> {
  const csvContent = jsonToCSV(services)
  await fs.writeFile(CSV_FILE_PATH, csvContent, "utf-8")
}

// PUT - Update service
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { service_name, url_services, category } = body

    if (!service_name || !url_services || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const services = await readServices()
    const serviceIndex = services.findIndex((service) => service.id === id)

    if (serviceIndex === -1) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    services[serviceIndex] = {
      ...services[serviceIndex],
      service_name,
      url_services,
      category,
      updateAt: new Date().toISOString(),
    }

    await writeServices(services)

    return NextResponse.json(services[serviceIndex])
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
  }
}

// DELETE - Delete service
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const services = await readServices()
    const filteredServices = services.filter((service) => service.id !== id)

    if (services.length === filteredServices.length) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    await writeServices(filteredServices)

    return NextResponse.json({ message: "Service deleted successfully" })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
  }
}
