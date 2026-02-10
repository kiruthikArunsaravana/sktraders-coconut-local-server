import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Lock, Eye, EyeOff, Settings, Minus } from "lucide-react";
import { toast } from "sonner";

interface OutputProduct {
  id: string;
  date: string;
  productType: "coconut" | "husk" | "shell";
  weight?: number;
  pricePerKg?: number;
  loads?: number;
  pricePerLoad?: number;
  totalPrice: number;
}

interface CoconutInput {
  id: string;
  date: string;
  count: number;
  pricePerUnit: number;
  totalPrice: number;
}

interface LabourWage {
  id: string;
  date: string;
  workerName: string;
  days: number;
  ratePerDay: number;
  totalWage: number;
}

const Reports = () => {
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  
  // Initial capital state
  const [isCapitalUnlocked, setIsCapitalUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newCapital, setNewCapital] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [reduceCount, setReduceCount] = useState<string>("1");
  const [reducedCount, setReducedCount] = useState<number>(0);
  const [newYear, setNewYear] = useState("");

  // Load initial capital and password from localStorage
  const [initialCapital, setInitialCapital] = useState<number>(() => {
    const saved = localStorage.getItem("initialCapital");
    return saved ? parseFloat(saved) : 0;
  });

  // Listen for capital changes made elsewhere in the app
  useEffect(() => {
    const onCapitalChange = (e: any) => {
      if (e?.detail !== undefined) setInitialCapital(Number(e.detail));
      else {
        const saved = localStorage.getItem("initialCapital");
        if (saved) setInitialCapital(parseFloat(saved));
      }
    };

    window.addEventListener("capitalChanged", onCapitalChange as EventListener);
    // also listen to storage in case other windows changed it
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "initialCapital" && ev.newValue) setInitialCapital(parseFloat(ev.newValue));
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("capitalChanged", onCapitalChange as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  
  // Default password set as requested (can be changed in Settings)
  const storedPassword = localStorage.getItem("capitalPassword") || "Kiruthik8975@";
  
  const handleUnlock = () => {
    if (passwordInput === storedPassword) {
      setIsCapitalUnlocked(true);
      setPasswordInput("");
      toast.success("Capital unlocked successfully!");
    } else {
      toast.error("Incorrect password");
    }
  };
  
  const handleLock = () => {
    setIsCapitalUnlocked(false);
  };
  
  const [outputs, setOutputs] = useState<OutputProduct[]>([]);
  const [coconutInputs, setCoconutInputs] = useState<CoconutInput[]>([]);
  const [labourWages, setLabourWages] = useState<LabourWage[]>([]);

  useEffect(() => {
    async function loadData() {
      const API = import.meta.env.VITE_API_URL;

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

      // Outputs are not fetched from server, keep as localStorage
      const savedO = localStorage.getItem("outputs");
      if (savedO) setOutputs(JSON.parse(savedO));
    }
    loadData();
  }, []);

  const filteredOutputs = useMemo(() => {
    return outputs.filter((output) => {
      const outputDate = new Date(output.date);
      const matchesProduct = selectedProduct === "all" || output.productType === selectedProduct;
      const matchesYear = outputDate.getFullYear().toString() === selectedYear;
      const matchesStartDate = !startDate || outputDate >= new Date(startDate);
      const matchesEndDate = !endDate || outputDate <= new Date(endDate);

      return matchesProduct && matchesYear && matchesStartDate && matchesEndDate;
    });
  }, [outputs, selectedProduct, selectedYear, startDate, endDate]);

  const filteredInputs = useMemo(() => {
    return coconutInputs.filter((input) => {
      const inputDate = new Date(input.date);
      const matchesYear = inputDate.getFullYear().toString() === selectedYear;
      const matchesStartDate = !startDate || inputDate >= new Date(startDate);
      const matchesEndDate = !endDate || inputDate <= new Date(endDate);
      return matchesYear && matchesStartDate && matchesEndDate;
    });
  }, [coconutInputs, selectedYear, startDate, endDate]);

  const filteredWages = useMemo(() => {
    return labourWages.filter((wage) => {
      const wageDate = new Date(wage.date);
      const matchesYear = wageDate.getFullYear().toString() === selectedYear;
      const matchesStartDate = !startDate || wageDate >= new Date(startDate);
      const matchesEndDate = !endDate || wageDate <= new Date(endDate);
      return matchesYear && matchesStartDate && matchesEndDate;
    });
  }, [labourWages, selectedYear, startDate, endDate]);

  const handleSaveSettings = () => {
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newCapital) {
      const capitalValue = parseFloat(newCapital);
      if (capitalValue >= 0) {
        setInitialCapital(capitalValue);
        localStorage.setItem("initialCapital", capitalValue.toString());
      }
    }

    if (newPassword) {
      localStorage.setItem("capitalPassword", newPassword);
      toast.success("Password updated!");
    }

    setNewCapital("");
    setNewPassword("");
    setConfirmPassword("");
    setIsSettingsOpen(false);
    toast.success("Settings saved!");
  };

  const handleReduceCoconutCount = () => {
    const countToReduce = parseInt(reduceCount) || 1;
    if (countToReduce <= 0) {
      toast.error("Please enter a valid number to reduce");
      return;
    }

    const currentTotal = filteredInputs.reduce((sum, input) => sum + input.count, 0);
    if (reducedCount + countToReduce > currentTotal) {
      toast.error(`Cannot reduce more than total bought. Current total: ${currentTotal}`);
      return;
    }

    setReducedCount(prev => prev + countToReduce);

    toast.success(`Coconut count reduced by ${countToReduce} successfully!`);
    setReduceCount("1"); // Reset to default
  };

  const getTotalCoconutBought = () => {
    return filteredInputs.reduce((sum, input) => sum + input.count, 0);
  };

  const totalRevenue = filteredOutputs.reduce((sum, output) => sum + output.totalPrice, 0);
  const totalCosts = filteredInputs.reduce((sum, input) => sum + input.totalPrice, 0) +
                     filteredWages.reduce((sum, wage) => sum + wage.totalWage, 0);
  const netProfit = totalRevenue - totalCosts;

  const productData = [
    {
      name: "Coconut",
      weight: filteredOutputs.filter(o => o.productType === "coconut").reduce((sum, o) => sum + (o.weight || 0), 0),
      revenue: filteredOutputs.filter(o => o.productType === "coconut").reduce((sum, o) => sum + o.totalPrice, 0),
      unit: "kg",
    },
    {
      name: "Husk",
      weight: filteredOutputs.filter(o => o.productType === "husk").reduce((sum, o) => sum + (o.loads || 0), 0),
      revenue: filteredOutputs.filter(o => o.productType === "husk").reduce((sum, o) => sum + o.totalPrice, 0),
      unit: "loads",
    },
    {
      name: "Shell",
      weight: filteredOutputs.filter(o => o.productType === "shell").reduce((sum, o) => sum + (o.weight || 0), 0),
      revenue: filteredOutputs.filter(o => o.productType === "shell").reduce((sum, o) => sum + o.totalPrice, 0),
      unit: "kg",
    },
  ];

  const pieData = [
    { name: "Revenue", value: totalRevenue, color: "hsl(var(--chart-1))" },
    { name: "Input Costs", value: filteredInputs.reduce((sum, input) => sum + input.totalPrice, 0), color: "hsl(var(--chart-2))" },
    { name: "Labour Costs", value: filteredWages.reduce((sum, wage) => sum + wage.totalWage, 0), color: "hsl(var(--chart-3))" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive business performance analysis</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = (new Date().getFullYear() - i).toString();
                      return (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product">Product Type</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="coconut">Coconut (Meat)</SelectItem>
                    <SelectItem value="husk">Husk</SelectItem>
                    <SelectItem value="shell">Shell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Initial Capital Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Starting Capital
              </CardTitle>
              {isCapitalUnlocked && (
                <div className="flex gap-2">
                  <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Capital Settings</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="newCapital">Initial Capital Amount ($)</Label>
                          <Input
                            id="newCapital"
                            type="number"
                            step="0.01"
                            placeholder={initialCapital.toString()}
                            value={newCapital}
                            onChange={(e) => setNewCapital(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password (leave empty to keep current)</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleSaveSettings} className="w-full">
                          Save Settings
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" onClick={handleLock}>
                    Lock
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!isCapitalUnlocked ? (
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password to view"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button onClick={handleUnlock}>Unlock</Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">Business Starting Capital</p>
                <p className="text-4xl font-bold text-primary">${initialCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-6 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Coconuts Bought</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Count"
                    value={reduceCount}
                    onChange={(e) => setReduceCount(e.target.value)}
                    className="w-16 h-6 text-xs"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReduceCoconutCount()}
                    className="h-6 w-6 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="text-2xl font-bold text-primary">
                {Math.max(0, filteredInputs.reduce((sum, input) => sum + input.count, 0) - reducedCount)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Total Coconut Bought</p>
              <p className="text-2xl font-bold text-primary">
                {getTotalCoconutBought()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-success">${totalRevenue.toFixed(2)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Total Costs</p>
              <p className="text-2xl font-bold text-destructive">${totalCosts.toFixed(2)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                ${netProfit.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Profit Margin</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--chart-1))" />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="weight" fill="hsl(var(--chart-1))" name="Weight (kg)" />
                  <Bar yAxisId="right" dataKey="revenue" fill="hsl(var(--chart-2))" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tables */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Outputs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredOutputs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No data for selected filters</p>
                ) : (
                  filteredOutputs.slice(0, 10).map((output) => (
                    <div key={output.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{output.productType}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(output.date).toLocaleDateString()} - {
                            output.productType === "husk" 
                              ? `${output.loads} load(s)`
                              : `${output.weight} kg`
                          }
                        </p>
                      </div>
                      <p className="font-bold text-primary">${output.totalPrice.toFixed(2)}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold">Coconut Input Costs</p>
                    <p className="font-bold text-primary">
                      ${filteredInputs.reduce((sum, input) => sum + input.totalPrice, 0).toFixed(2)}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {filteredInputs.reduce((sum, input) => sum + input.count, 0)} coconuts purchased
                  </p>
                </div>

                <div className="p-4 bg-secondary/5 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold">Labour Costs</p>
                    <p className="font-bold text-secondary">
                      ${filteredWages.reduce((sum, wage) => sum + wage.totalWage, 0).toFixed(2)}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {filteredWages.reduce((sum, wage) => sum + wage.days, 0).toFixed(1)} days worked
                  </p>
                </div>

                <div className="p-4 bg-accent/5 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">Total Operating Costs</p>
                    <p className="font-bold text-accent">${totalCosts.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
