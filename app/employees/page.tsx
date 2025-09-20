"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { Plus, Users, Mail, Phone, Calendar, Search, MapPin, CreditCard, Briefcase, Key } from "lucide-react"
import Link from "next/link"

interface Employee {
  id: string
  name: string
  email: string
  phone: string
  primary_phone: string
  status: string
  created_at: string
  first_name: string
  paternal_last_name: string
  position: string
  salary: number
  hire_date: string
  department: string
  city: string
  state: string
  employee_id: string
  access_level: string
  has_login?: boolean
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
    employeeType: "A"
  })
  const [generatingLogin, setGeneratingLogin] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    // Filter employees based on search term
    const filtered = employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.primary_phone && employee.primary_phone.includes(searchTerm)) ||
      (employee.first_name && employee.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (employee.paternal_last_name && employee.paternal_last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (employee.position && employee.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (employee.department && employee.department.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredEmployees(filtered)
  }, [searchTerm, employees])

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees")
      if (response.ok) {
        const result = await response.json()
        // Handle the nested data structure from the API
        const employees = result.success ? result.data : []
        setEmployees(employees)
        setFilteredEmployees(employees)
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "terminated":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getPositionColor = (position: string) => {
    switch (position?.toLowerCase()) {
      case "manager":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "trainer":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "receptionist":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "maintenance":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      case "instructor":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getInitials = (name: string) => {
    if (!name) return "N/A"
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const generateLogin = (employee: Employee) => {
    setSelectedEmployee(employee)
    setLoginForm({
      username: employee.email.split('@')[0] || employee.first_name?.toLowerCase() + employee.paternal_last_name?.toLowerCase(),
      password: generateRandomPassword(),
      employeeType: "A"
    })
    setShowLoginModal(true)
  }

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleCreateLogin = async () => {
    if (!selectedEmployee || !loginForm.username || !loginForm.password) return

    setGeneratingLogin(true)
    try {
      const response = await fetch("/api/employee-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: selectedEmployee.id,
          username: loginForm.username,
          password: loginForm.password,
          employee_type: loginForm.employeeType
        }),
      })

      if (response.ok) {
        alert("Login credentials created successfully!")
        setShowLoginModal(false)
        fetchEmployees() // Refresh to show updated status
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error creating login:", error)
      alert("Error creating login credentials")
    } finally {
      setGeneratingLogin(false)
    }
  }

  return (
    <AuthenticatedLayout 
      title="Employees"
      showBackButton
      backHref="/"
      headerActions={
        <Button asChild>
          <Link href="/employees/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Link>
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees by name, email, phone, position, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading employees...</p>
            </div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? "No employees found" : "No employees found"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? `No employees match "${searchTerm}". Try a different search term.`
                  : "Get started by adding your first employee."
                }
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link href="/employees/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Employee
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {getInitials(employee.name)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">{employee.name}</h3>
                        <Badge className={getStatusColor(employee.status)} variant="secondary">
                          {employee.status}
                        </Badge>
                        {employee.position && (
                          <Badge className={getPositionColor(employee.position)} variant="secondary">
                            {employee.position}
                          </Badge>
                        )}
                        {employee.department && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" variant="secondary">
                            {employee.department}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{employee.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{employee.primary_phone || employee.phone}</span>
                        </div>
                        {(employee.city || employee.state) && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{[employee.city, employee.state].filter(Boolean).join(', ')}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Hired {formatDate(employee.hire_date || employee.created_at)}</span>
                        </div>
                        {employee.salary && (
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            <span>{formatCurrency(employee.salary)}/mo</span>
                          </div>
                        )}
                        {employee.employee_id && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            <span>ID: {employee.employee_id}</span>
                          </div>
                        )}
                        {employee.access_level && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {employee.access_level}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Generate Login Button */}
                    <div className="flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateLogin(employee)}
                        className="flex items-center gap-1"
                      >
                        <Key className="h-3 w-3" />
                        Generate Login
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Generate Login Modal */}
        {showLoginModal && selectedEmployee && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Generate Login for {selectedEmployee.name}
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter username"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password"
                      type="text"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="employeeType">Employee Type</Label>
                    <Select
                      value={loginForm.employeeType}
                      onValueChange={(value) => setLoginForm(prev => ({ ...prev, employeeType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Type A - Full Access (Everything)</SelectItem>
                        <SelectItem value="B">Type B - Limited Access (No Payments)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    <strong>Access Levels:</strong><br/>
                    <strong>Type A:</strong> Full access to all features<br/>
                    <strong>Type B:</strong> Access to everything except payments section
                  </div>
                </div>
                
                <div className="flex gap-2 mt-6">
                  <Button
                    onClick={handleCreateLogin}
                    disabled={generatingLogin || !loginForm.username || !loginForm.password}
                    className="flex-1"
                  >
                    {generatingLogin ? "Creating..." : "Create Login"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowLoginModal(false)}
                    disabled={generatingLogin}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
