import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Package, Users, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
// import { cn } from "@/lib/utils";

interface CoconutInput {
  id: string;
  date: string;
  count: number;
  pricePerUnit: number;
  totalPrice: number;
  clientName: string;
  paymentStatus: "pending" | "paid" | "partial";
}

interface LabourWage {
  id: string;
  date: string;
  workerName: string;
  days: number;
  ratePerDay: number;
  totalWage: number;
}

const InputManagement = () => {
  const [coconutInputs, setCoconutInputs] = useState<CoconutInput[]>([]);
  const [labourWages, setLabourWages] = useState<LabourWage[]>([]);


  const [coconutForm, setCoconutForm] = useState({
    count: "",
    pricePerUnit: "",
    clientName: "",
    paymentStatus: "pending" as const,
  });

  const [clientSearch, setClientSearch] = useState("");
  const [openClientPopover, setOpenClientPopover] = useState(false);
const [clients, setClients] = useState<string[]>([]);

  const [labourForm, setLabourForm] = useState({
    workerName: "",
    days: "",
    ratePerDay: "",
  });

  const [editingCoconutId, setEditingCoconutId] = useState<string | null>(null);
  const [editingLabourId, setEditingLabourId] = useState<string | null>(null);
  const [newClient, setNewClient] = useState("");

  // Filtering states
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [openDateFrom, setOpenDateFrom] = useState(false);
  const [openDateTo, setOpenDateTo] = useState(false);

  const filteredClients = clients.filter(client =>
    client.toLowerCase().includes(clientSearch.toLowerCase())
  );

  // Filter functions
  const filterRecords = (records: any[]) => {
    return records.filter(record => {
      const recordDate = new Date(record.date);
      const recordYear = recordDate.getFullYear().toString();

      // Check year filter (skip if "all" is selected)
      if (selectedYear && selectedYear !== "all" && recordYear !== selectedYear) {
        return false;
      }

      // Check date range
      if (dateFrom && recordDate < dateFrom) {
        return false;
      }
      if (dateTo && recordDate > dateTo) {
        return false;
      }

      return true;
    });
  };

  const filteredCoconutInputs = filterRecords(coconutInputs);
  const filteredLabourWages = filterRecords(labourWages);

  // Generate years for dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 }, (_, i) => (currentYear - i).toString());

  useEffect(() => {
    async function loadData() {
      const API = import.meta.env.VITE_API_URL;

      // Load clients from localStorage (no server endpoint)
      const savedClients = localStorage.getItem("clients");
      if (savedClients) {
        try {
          setClients(JSON.parse(savedClients));
        } catch (parseErr) {
          console.warn("Invalid clients in localStorage", parseErr);
        }
      }

      // Try to load coconut inputs from server, fallback to localStorage
      try {
        const cRes = await fetch(`${API}/api/coconut`);
        const cData = await cRes.json();
        setCoconutInputs(cData);
        localStorage.setItem("coconutInputs", JSON.stringify(cData));
      } catch (err) {
        console.warn("Could not load coconut inputs from server, using localStorage", err);
        const savedC = localStorage.getItem("coconutInputs");
        if (savedC) {
          try {
            setCoconutInputs(JSON.parse(savedC));
          } catch (parseErr) {
            console.warn("Invalid coconutInputs in localStorage", parseErr);
          }
        }
      }

      // Try to load labour wages from server, fallback to localStorage
      try {
        const lRes = await fetch(`${API}/api/labour`);
        const lData = await lRes.json();
        setLabourWages(lData);
        localStorage.setItem("labourWages", JSON.stringify(lData));
      } catch (err) {
        console.warn("Could not load labour wages from server, using localStorage", err);
        const savedL = localStorage.getItem("labourWages");
        if (savedL) {
          try {
            setLabourWages(JSON.parse(savedL));
          } catch (parseErr) {
            console.warn("Invalid labourWages in localStorage", parseErr);
          }
        }
      }
    }

    loadData();

    // Listen for localStorage changes (e.g., from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "coconutInputs" && e.newValue) {
        try {
          setCoconutInputs(JSON.parse(e.newValue));
        } catch (err) {
          console.warn("Invalid coconutInputs in storage event", err);
        }
      }
      if (e.key === "labourWages" && e.newValue) {
        try {
          setLabourWages(JSON.parse(e.newValue));
        } catch (err) {
          console.warn("Invalid labourWages in storage event", err);
        }
      }
      if (e.key === "clients" && e.newValue) {
        try {
          setClients(JSON.parse(e.newValue));
        } catch (err) {
          console.warn("Invalid clients in storage event", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleCoconutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const count = parseInt(coconutForm.count);
    const pricePerUnit = parseFloat(coconutForm.pricePerUnit);
    
    if (!count || !pricePerUnit || count <= 0 || pricePerUnit <= 0) {
      toast.error("Please enter valid positive numbers");
      return;
    }

    if (!coconutForm.clientName) {
      toast.error("Please select a client");
      return;
    }

      if (editingCoconutId) {
        handleUpdateCoconut();
        return;
      }

    const newInput: CoconutInput = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      count,
      pricePerUnit,
      totalPrice: count * pricePerUnit,
      clientName: coconutForm.clientName,
      paymentStatus: coconutForm.paymentStatus,
    };

    const updated = [newInput, ...coconutInputs];
    setCoconutInputs(updated);

    // Deduct input cost from initial capital (if present) and notify Reports
    try {
      const savedCap = localStorage.getItem("initialCapital");
      const currentCap = savedCap ? parseFloat(savedCap) : 0;
      const newCap = currentCap - newInput.totalPrice;
      localStorage.setItem("initialCapital", newCap.toString());
      // Dispatch event so Reports component can update in the same window
      window.dispatchEvent(new CustomEvent("capitalChanged", { detail: newCap }));
    } catch (err) {
      console.warn("Could not update initial capital", err);
    }

    // Try to save to server, fall back to localStorage on failure
    try {
     const API = import.meta.env.VITE_API_URL;

const res = await fetch(`${API}/api/coconut`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(newInput),
});

      if (!res.ok) throw new Error("Server error");
      toast.success("Coconut input recorded successfully!");
    } catch (err) {
      localStorage.setItem("coconutInputs", JSON.stringify(updated));
      toast.success("Saved locally (server unavailable)");
    }

    setCoconutForm({ count: "", pricePerUnit: "", clientName: "", paymentStatus: "pending" });
    setClientSearch("");
  };

  const handleLabourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const days = parseFloat(labourForm.days);
    const ratePerDay = parseFloat(labourForm.ratePerDay);
    
    if (!labourForm.workerName || !days || !ratePerDay || days <= 0 || ratePerDay <= 0) {
      toast.error("Please fill all fields with valid values");
      return;
    }
      if (editingLabourId) {
        handleUpdateLabour();
        return;
      }

    const newWage: LabourWage = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      workerName: labourForm.workerName,
      days,
      ratePerDay,
      totalWage: days * ratePerDay,
    };

    const updated = [newWage, ...labourWages];
    setLabourWages(updated);

    try {
     const API = import.meta.env.VITE_API_URL;

const res = await fetch(`${API}/api/labour`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(newWage),
});

      if (!res.ok) throw new Error("Server error");
      toast.success("Labour wage recorded successfully!");
    } catch (err) {
      localStorage.setItem("labourWages", JSON.stringify(updated));
      toast.success("Saved locally (server unavailable)");
    }

    setLabourForm({ workerName: "", days: "", ratePerDay: "" });
  };

  const handleDeleteCoconut = async (id: string) => {
    const updated = coconutInputs.filter(input => input.id !== id);
    setCoconutInputs(updated);
    try {
      const API = import.meta.env.VITE_API_URL;

const res = await fetch(`${API}/api/coconut/${id}`, {
  method: "DELETE",
});

if (!res.ok) throw new Error("Delete failed");
toast.success("Coconut input deleted successfully!");

    } catch (err) {
      localStorage.setItem("coconutInputs", JSON.stringify(updated));
      toast.success('Deleted locally (server unavailable)');
    }
  };

  const handleDeleteLabour = async (id: string) => {
    const updated = labourWages.filter(wage => wage.id !== id);
    setLabourWages(updated);
    try {
      const API = import.meta.env.VITE_API_URL;

const res = await fetch(`${API}/api/labour/${id}`, {
  method: "DELETE",
});

if (!res.ok) throw new Error("Delete failed");
toast.success("Labour wage deleted successfully!");

    } catch (err) {
      localStorage.setItem("labourWages", JSON.stringify(updated));
      toast.success('Deleted locally (server unavailable)');
    }
  };

  const handleEditCoconut = (input: CoconutInput) => {
    setEditingCoconutId(input.id);
    setCoconutForm({
      count: input.count.toString(),
      pricePerUnit: input.pricePerUnit.toString(),
      clientName: input.clientName,
      paymentStatus: input.paymentStatus,
    });
    setClientSearch(input.clientName);
  };

  const handleUpdateCoconut = async () => {
    const count = parseInt(coconutForm.count);
    const pricePerUnit = parseFloat(coconutForm.pricePerUnit);

    if (!count || !pricePerUnit || count <= 0 || pricePerUnit <= 0) {
      toast.error("Please enter valid positive numbers");
      return;
    }

    if (!coconutForm.clientName) {
      toast.error("Please select a client");
      return;
    }

    const updatedInput: CoconutInput = {
      ...coconutInputs.find(i => i.id === editingCoconutId)!,
      count,
      pricePerUnit,
      totalPrice: count * pricePerUnit,
      clientName: coconutForm.clientName,
      paymentStatus: coconutForm.paymentStatus,
    };

    const updated = coconutInputs.map(i => i.id === editingCoconutId ? updatedInput : i);
    setCoconutInputs(updated);

    try {
      const API = import.meta.env.VITE_API_URL;

const res = await fetch(`${API}/api/coconut/${editingCoconutId}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(updatedInput),
});

      if (!res.ok) throw new Error("Update failed");
      toast.success("Coconut input updated successfully!");
    } catch (err) {
      localStorage.setItem("coconutInputs", JSON.stringify(updated));
      toast.success("Updated locally (server unavailable)");
    }

    setEditingCoconutId(null);
    setCoconutForm({ count: "", pricePerUnit: "", clientName: "", paymentStatus: "pending" });
    setClientSearch("");
  };

  const handleEditLabour = (wage: LabourWage) => {
    setEditingLabourId(wage.id);
    setLabourForm({
      workerName: wage.workerName,
      days: wage.days.toString(),
      ratePerDay: wage.ratePerDay.toString(),
    });
  };

  const handleUpdateLabour = async () => {
    const days = parseFloat(labourForm.days);
    const ratePerDay = parseFloat(labourForm.ratePerDay);

    if (!labourForm.workerName || !days || !ratePerDay || days <= 0 || ratePerDay <= 0) {
      toast.error("Please fill all fields with valid values");
      return;
    }

    const updatedWage: LabourWage = {
      ...labourWages.find(w => w.id === editingLabourId)!,
      workerName: labourForm.workerName,
      days,
      ratePerDay,
      totalWage: days * ratePerDay,
    };

    const updated = labourWages.map(w => w.id === editingLabourId ? updatedWage : w);
    setLabourWages(updated);

    try {
      const API = import.meta.env.VITE_API_URL;

const res = await fetch(`${API}/api/labour/${editingLabourId}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(updatedWage),
});

      if (!res.ok) throw new Error("Update failed");
      toast.success("Labour wage updated successfully!");
    } catch (err) {
      localStorage.setItem("labourWages", JSON.stringify(updated));
      toast.success("Updated locally (server unavailable)");
    }

    setEditingLabourId(null);
    setLabourForm({ workerName: "", days: "", ratePerDay: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Input Management</h1>
          <p className="text-muted-foreground">Record coconut purchases and labour wages</p>
        </div>

        <Tabs defaultValue="coconut" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="coconut" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Coconut Input
            </TabsTrigger>
            <TabsTrigger value="labour" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Labour Wages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="coconut" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{editingCoconutId ? "Edit" : "Add"} Coconut Purchase</CardTitle>
                <CardDescription>Record new coconut input with count and pricing</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCoconutSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">Client Name</Label>
                      <Popover open={openClientPopover} onOpenChange={setOpenClientPopover}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openClientPopover}
                            className="w-full justify-between"
                          >
                            {coconutForm.clientName || "Select client..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search client..."
                              value={clientSearch}
                              onValueChange={setClientSearch}
                            />
                            <CommandEmpty>No client found.</CommandEmpty>
                            <CommandGroup>
                              {filteredClients.map((client) => (
                                <CommandItem
                                  key={client}
                                  value={client}
                                  onSelect={(currentValue) => {
                                    setCoconutForm({
                                      ...coconutForm,
                                      clientName: currentValue === coconutForm.clientName ? "" : currentValue,
                                    });
                                    setClientSearch(currentValue === coconutForm.clientName ? "" : currentValue);
                                    setOpenClientPopover(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      coconutForm.clientName === client ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {client}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                            <div className="p-2 border-t">
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Add new client..."
                                  value={newClient}
                                  onChange={(e) => setNewClient(e.target.value)}
                                />
                                <Button
                                  size="sm"
                                  onClick={async () => {
                                    if (!newClient.trim()) return;

                                    if (clients.includes(newClient.trim())) {
                                      toast.error("Client already exists!");
                                      return;
                                    }

                                    const newClientName = newClient.trim();
                                    const updatedClients = [...clients, newClientName];
                                    setClients(updatedClients);
                                    localStorage.setItem("clients", JSON.stringify(updatedClients));
                                    setNewClient("");

                                    // Try to save to server, but don't fail if it doesn't work
                                    try {
                                      const API = import.meta.env.VITE_API_URL;
                                      if (API) {
                                        await fetch(`${API}/api/clients`, {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({
                                            id: Date.now().toString(),
                                            name: newClientName,
                                          }),
                                        });
                                      }
                                    } catch (err) {
                                      console.warn("Could not save client to server, saved locally", err);
                                    }

                                    toast.success("New client added!");
                                  }}
                                >
                                  Add
                                </Button>
                              </div>
                            </div>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentStatus">Payment Status</Label>
                      <Select value={coconutForm.paymentStatus} onValueChange={(value: "pending" | "paid" | "partial") => setCoconutForm({ ...coconutForm, paymentStatus: value })}>
                        <SelectTrigger id="paymentStatus">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="count">Coconut Count</Label>
                      <Input
                        id="count"
                        type="number"
                        placeholder="Enter count"
                        value={coconutForm.count}
                        onChange={(e) => setCoconutForm({ ...coconutForm, count: e.target.value })}
                        required
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pricePerUnit">Price per Coconut ($)</Label>
                      <Input
                        id="pricePerUnit"
                        type="number"
                        step="0.01"
                        placeholder="Enter price"
                        value={coconutForm.pricePerUnit}
                        onChange={(e) => setCoconutForm({ ...coconutForm, pricePerUnit: e.target.value })}
                        required
                        min="0.01"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="w-full md:w-auto">
                      {editingCoconutId ? "Update" : "Add"} Coconut Input
                    </Button>
                    {editingCoconutId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingCoconutId(null);
                          setCoconutForm({ count: "", pricePerUnit: "", clientName: "", paymentStatus: "pending" });
                          setClientSearch("");
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Filter records by date range and year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Date From</Label>
                    <Popover open={openDateFrom} onOpenChange={setOpenDateFrom}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateFrom && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateFrom}
                          onSelect={(date) => {
                            setDateFrom(date);
                            setOpenDateFrom(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Date To</Label>
                    <Popover open={openDateTo} onOpenChange={setOpenDateTo}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateTo && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateTo}
                          onSelect={(date) => {
                            setDateTo(date);
                            setOpenDateTo(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDateFrom(undefined);
                      setDateTo(undefined);
                      setSelectedYear("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Coconut Inputs ({filteredCoconutInputs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coconutInputs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No coconut inputs recorded yet</p>
                  ) : (
                    coconutInputs.map((input) => (
                      <div key={input.id} className="p-4 border rounded-lg">
                        {editingCoconutId === input.id ? (
                          <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Client Name</Label>
                                <Popover open={openClientPopover} onOpenChange={setOpenClientPopover}>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      aria-expanded={openClientPopover}
                                      className="w-full justify-between"
                                    >
                                      {coconutForm.clientName || "Select client..."}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0">
                                    <Command>
                                      <CommandInput 
                                        placeholder="Search client..." 
                                        value={clientSearch}
                                        onValueChange={setClientSearch}
                                      />
                                      <CommandEmpty>No client found.</CommandEmpty>
                                      <CommandGroup>
                                        {filteredClients.map((client) => (
                                          <CommandItem
                                            key={client}
                                            value={client}
                                            onSelect={(currentValue) => {
                                              setCoconutForm({
                                                ...coconutForm,
                                                clientName: currentValue === coconutForm.clientName ? "" : currentValue,
                                              });
                                              setClientSearch(currentValue === coconutForm.clientName ? "" : currentValue);
                                              setOpenClientPopover(false);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                coconutForm.clientName === client ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            {client}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <div className="space-y-2">
                                <Label>Payment Status</Label>
                                <Select value={coconutForm.paymentStatus} onValueChange={(value: any) => setCoconutForm({ ...coconutForm, paymentStatus: value })}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="partial">Partial</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Count</Label>
                                <Input
                                  type="number"
                                  value={coconutForm.count}
                                  onChange={(e) => setCoconutForm({ ...coconutForm, count: e.target.value })}
                                  min="1"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Price per Unit ($)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={coconutForm.pricePerUnit}
                                  onChange={(e) => setCoconutForm({ ...coconutForm, pricePerUnit: e.target.value })}
                                  min="0.01"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleUpdateCoconut}>Save</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingCoconutId(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Client</p>
                                  <p className="font-semibold">{input.clientName}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Payment Status</p>
                                  <p className="font-semibold capitalize">{input.paymentStatus}</p>
                                </div>
                              </div>
                              <div className="mt-3">
                                <p className="font-semibold">{input.count} Coconuts</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(input.date).toLocaleDateString()} at ${input.pricePerUnit.toFixed(2)} each
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <p className="font-bold text-primary text-lg">${input.totalPrice.toFixed(2)}</p>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditCoconut(input)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteCoconut(input.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="labour" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{editingLabourId ? "Edit" : "Add"} Labour Wage</CardTitle>
                <CardDescription>Record labour costs for processing operations</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLabourSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workerName">Worker Name</Label>
                    <Input
                      id="workerName"
                      type="text"
                      placeholder="Enter worker name"
                      value={labourForm.workerName}
                      onChange={(e) => setLabourForm({ ...labourForm, workerName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="days">Days Worked</Label>
                      <Input
                        id="days"
                        type="number"
                        step="0.5"
                        placeholder="Enter days"
                        value={labourForm.days}
                        onChange={(e) => setLabourForm({ ...labourForm, days: e.target.value })}
                        required
                        min="0.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ratePerDay">Rate per Day ($)</Label>
                      <Input
                        id="ratePerDay"
                        type="number"
                        step="0.01"
                        placeholder="Enter rate"
                        value={labourForm.ratePerDay}
                        onChange={(e) => setLabourForm({ ...labourForm, ratePerDay: e.target.value })}
                        required
                        min="0.01"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="w-full md:w-auto">
                      {editingLabourId ? "Update" : "Add"} Labour Wage
                    </Button>
                    {editingLabourId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingLabourId(null);
                          setLabourForm({ workerName: "", days: "", ratePerDay: "" });
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Filter records by date range and year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Date From</Label>
                    <Popover open={openDateFrom} onOpenChange={setOpenDateFrom}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateFrom && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateFrom}
                          onSelect={(date) => {
                            setDateFrom(date);
                            setOpenDateFrom(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Date To</Label>
                    <Popover open={openDateTo} onOpenChange={setOpenDateTo}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateTo && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateTo}
                          onSelect={(date) => {
                            setDateTo(date);
                            setOpenDateTo(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDateFrom(undefined);
                      setDateTo(undefined);
                      setSelectedYear("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Labour Wages ({filteredLabourWages.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {labourWages.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No labour wages recorded yet</p>
                  ) : (
                    labourWages.map((wage) => (
                      <div key={wage.id} className="p-4 border rounded-lg">
                        {editingLabourId === wage.id ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Worker Name</Label>
                              <Input
                                type="text"
                                value={labourForm.workerName}
                                onChange={(e) => setLabourForm({ ...labourForm, workerName: e.target.value })}
                              />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Days Worked</Label>
                                <Input
                                  type="number"
                                  step="0.5"
                                  value={labourForm.days}
                                  onChange={(e) => setLabourForm({ ...labourForm, days: e.target.value })}
                                  min="0.5"
                                />
                              </div>
                               <div className="space-y-2">
                                <Label>Rate per Day ($)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={labourForm.ratePerDay}
                                  onChange={(e) => setLabourForm({ ...labourForm, ratePerDay: e.target.value })}
                                  min="0.01"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleUpdateLabour}>Save</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingLabourId(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold">{wage.workerName}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(wage.date).toLocaleDateString()} - {wage.days} day(s) at ${wage.ratePerDay.toFixed(2)}/day
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <p className="font-bold text-primary">${wage.totalWage.toFixed(2)}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditLabour(wage)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteLabour(wage.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InputManagement;