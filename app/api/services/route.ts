import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

const CSV_FILE_PATH = path.join(process.cwd(), "data", "services.csv")

interface Service {
  id: string
  service_name: string
  url_services: string
  updateAt: string
  createAt: string
  category: string
}

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), "data")
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
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
  await ensureDataDirectory()

  try {
    const csvContent = await fs.readFile(CSV_FILE_PATH, "utf-8")
    return parseCSV(csvContent)
  } catch (error) {
    // If file doesn't exist, create it with sample data
    const sampleServices: Service[] = [
      {
        id: uuidv4(),
        service_name: "Google Analytics",
        url_services: "https://analytics.google.com",
        updateAt: new Date().toISOString(),
        createAt: new Date().toISOString(),
        category: "Analytics",
      },
      {
        id: uuidv4(),
        service_name: "Figma",
        url_services: "https://figma.com",
        updateAt: new Date().toISOString(),
        createAt: new Date().toISOString(),
        category: "Design",
      },
      {
        id: uuidv4(),
        service_name: "Vercel",
        url_services: "https://vercel.com",
        updateAt: new Date().toISOString(),
        createAt: new Date().toISOString(),
        category: "Web Development",
      },
      {
        id: uuidv4(),
        service_name: "Shopify",
        url_services: "https://shopify.com",
        updateAt: new Date().toISOString(),
        createAt: new Date().toISOString(),
        category: "E-commerce",
      },
      {
        id: uuidv4(),
        service_name: "Mailchimp",
        url_services: "https://mailchimp.com",
        updateAt: new Date().toISOString(),
        createAt: new Date().toISOString(),
        category: "Marketing",
      },
    ]

    await writeServices(sampleServices)
    return sampleServices
  }
}

// Write services to CSV
async function writeServices(services: Service[]): Promise<void> {
  await ensureDataDirectory()
  const csvContent = jsonToCSV(services)
  await fs.writeFile(CSV_FILE_PATH, csvContent, "utf-8")
}

// GET - Fetch all services
export async function GET() {
  try {
    const services = await readServices()
    return NextResponse.json(services)
  } catch (error) {
    console.error("Error reading services:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}

// POST - Create new service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { service_name, url_services, category } = body

    if (!service_name || !url_services || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const services = await readServices()
    const newService: Service = {
      id: uuidv4(),
      service_name,
      url_services,
      category,
      createAt: new Date().toISOString(),
      updateAt: new Date().toISOString(),
    }

    services.push(newService)
    await writeServices(services)

    return NextResponse.json(newService, { status: 201 })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}
