import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { Trash2 } from "lucide-react";

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

const OutputManagement = () => {
  const [outputs, setOutputs] = useState<OutputProduct[]>(() => {
    const saved = localStorage.getItem("outputs");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [form, setForm] = useState({
    productType: "",
    weight: "",
    pricePerKg: "",
    loads: "",
    pricePerLoad: "",
  });

  const filteredOutputs = outputs.filter((output) => {
    const outputDate = new Date(output.date);
    const matchesYear = outputDate.getFullYear().toString() === selectedYear;
    const matchesStartDate = !startDate || outputDate >= new Date(startDate);
    const matchesEndDate = !endDate || outputDate <= new Date(endDate);
    return matchesYear && matchesStartDate && matchesEndDate;
  });

  const productLabels = {
    coconut: "Coconut (Meat)",
    husk: "Husk",
    shell: "Shell",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.productType) {
      toast.error("Please select a product type");
      return;
    }

    let newOutput: OutputProduct;

    if (form.productType === "husk") {
      const loads = parseFloat(form.loads);
      const pricePerLoad = parseFloat(form.pricePerLoad);
      
      if (!loads || !pricePerLoad || loads <= 0 || pricePerLoad <= 0) {
        toast.error("Please fill all fields with valid values");
        return;
      }

      newOutput = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        productType: "husk",
        loads,
        pricePerLoad,
        totalPrice: loads * pricePerLoad,
      };
    } else {
      const weight = parseFloat(form.weight);
      const pricePerKg = parseFloat(form.pricePerKg);
      
      if (!weight || !pricePerKg || weight <= 0 || pricePerKg <= 0) {
        toast.error("Please fill all fields with valid values");
        return;
      }

      newOutput = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        productType: form.productType as "coconut" | "shell",
        weight,
        pricePerKg,
        totalPrice: weight * pricePerKg,
      };
    }

    const updated = [newOutput, ...outputs];
    setOutputs(updated);
    localStorage.setItem("outputs", JSON.stringify(updated));
    
    setForm({ productType: "", weight: "", pricePerKg: "", loads: "", pricePerLoad: "" });
    toast.success("Output product recorded successfully!");
  };

  const handleDelete = (id: string) => {
    const updated = outputs.filter(output => output.id !== id);
    setOutputs(updated);
    localStorage.setItem("outputs", JSON.stringify(updated));
    toast.success("Output product deleted successfully!");
  };

  const getProductIcon = (type: string) => {
    switch (type) {
      case "coconut": return "🥥";
      case "husk": return "🌾";
      case "shell": return "🪵";
      default: return "📦";
    }
  };

  const productStats = {
    coconut: filteredOutputs.filter(o => o.productType === "coconut").reduce((sum, o) => sum + (o.weight || 0), 0),
    husk: filteredOutputs.filter(o => o.productType === "husk").reduce((sum, o) => sum + (o.loads || 0), 0),
    shell: filteredOutputs.filter(o => o.productType === "shell").reduce((sum, o) => sum + (o.weight || 0), 0),
  };

  const huskSquareFeet = productStats.husk * 630;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Output Management</h1>
          <p className="text-muted-foreground">Track processed products: coconut, husk, and shell</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
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

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Coconut</p>
                  <p className="text-2xl font-bold text-primary">{productStats.coconut.toFixed(2)} kg</p>
                </div>
                <div className="text-4xl">{getProductIcon("coconut")}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Husk</p>
                  <p className="text-2xl font-bold text-secondary">{productStats.husk} load(s)</p>
                  <p className="text-xs text-muted-foreground">{huskSquareFeet.toLocaleString()} sq ft</p>
                </div>
                <div className="text-4xl">{getProductIcon("husk")}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Shell</p>
                  <p className="text-2xl font-bold text-accent">{productStats.shell.toFixed(2)} kg</p>
                </div>
                <div className="text-4xl">{getProductIcon("shell")}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Output Product</CardTitle>
            <CardDescription>Record processed coconut products with weight and pricing</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productType">Product Type</Label>
                  <Select
                    value={form.productType}
                    onValueChange={(value) => setForm({ ...form, productType: value })}
                  >
                    <SelectTrigger id="productType">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coconut">🥥 Coconut (Meat)</SelectItem>
                      <SelectItem value="husk">🌾 Husk (Load)</SelectItem>
                      <SelectItem value="shell">🪵 Shell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {form.productType === "husk" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="loads">Number of Loads</Label>
                      <Input
                        id="loads"
                        type="number"
                        step="1"
                        placeholder="Enter loads (1 load = 630 sq ft)"
                        value={form.loads}
                        onChange={(e) => setForm({ ...form, loads: e.target.value })}
                        required
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pricePerLoad">Price per Load ($)</Label>
                      <Input
                        id="pricePerLoad"
                        type="number"
                        step="0.01"
                        placeholder="Enter price per load"
                        value={form.pricePerLoad}
                        onChange={(e) => setForm({ ...form, pricePerLoad: e.target.value })}
                        required
                        min="0.01"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        placeholder="Enter weight"
                        value={form.weight}
                        onChange={(e) => setForm({ ...form, weight: e.target.value })}
                        required
                        min="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pricePerKg">Price per kg ($)</Label>
                      <Input
                        id="pricePerKg"
                        type="number"
                        step="0.01"
                        placeholder="Enter price"
                        value={form.pricePerKg}
                        onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })}
                        required
                        min="0.01"
                      />
                    </div>
                  </>
                )}
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Add Output Product
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Output Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredOutputs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No output products recorded for selected filters</p>
              ) : (
                filteredOutputs.map((output) => (
                  <div key={output.id} className="flex justify-between items-center p-4 border rounded-lg hover:border-primary transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{getProductIcon(output.productType)}</div>
                      <div>
                        <p className="font-semibold">{productLabels[output.productType]}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(output.date).toLocaleDateString()} - {
                            output.productType === "husk" 
                              ? `${output.loads} load(s) at $${output.pricePerLoad?.toFixed(2)}/load`
                              : `${output.weight} kg at $${output.pricePerKg?.toFixed(2)}/kg`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-primary">${output.totalPrice.toFixed(2)}</p>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(output.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OutputManagement;
