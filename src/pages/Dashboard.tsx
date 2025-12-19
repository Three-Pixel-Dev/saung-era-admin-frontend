import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, HelpCircle, TrendingUp, TrendingDown, Eye, LayoutDashboard, ShoppingBag, Package, Grid3x3, Users, BarChart3, Megaphone, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const summaryCards = [
  {
    title: "Total Sales",
    value: "$12,450.00",
    change: "+5.4%",
    trend: "up",
    period: "vs. last month",
    icon: "$",
    iconBg: "bg-blue-100",
  },
  {
    title: "New Orders",
    value: "154",
    change: "+12%",
    trend: "up",
    period: "vs. last month",
    icon: "🛒",
    iconBg: "bg-blue-100",
  },
  {
    title: "Active Users",
    value: "1,203",
    change: "+2.1%",
    trend: "up",
    period: "vs. last month",
    icon: "👤",
    iconBg: "bg-blue-100",
  },
  {
    title: "Avg Order Value",
    value: "$85.20",
    change: "-0.5%",
    trend: "down",
    period: "vs. last month",
    icon: "📄",
    iconBg: "bg-blue-100",
  },
];

const salesData = [
  { date: "Aug 01", revenue: 2400 },
  { date: "Aug 05", revenue: 3200 },
  { date: "Aug 10", revenue: 2800 },
  { date: "Aug 15", revenue: 4000 },
  { date: "Aug 20", revenue: 3600 },
  { date: "Aug 25", revenue: 4200 },
  { date: "Aug 30", revenue: 3800 },
];

const topProducts = [
  {
    name: "Nike Air Max 270",
    price: "$120.00",
    sold: "324 Sold",
    status: "In Stock",
    statusColor: "success",
    image: "👟",
  },
  {
    name: "Chanel No. 5",
    price: "$210.00",
    sold: "198 Sold",
    status: "In Stock",
    statusColor: "success",
    image: "🧴",
  },
  {
    name: "Sony WH-1000X...",
    price: "$348.00",
    sold: "156 Sold",
    status: "Low Stock",
    statusColor: "warning",
    image: "🎧",
  },
  {
    name: "Ray-Ban Aviator",
    price: "$160.00",
    sold: "98 Sold",
    status: "In Stock",
    statusColor: "success",
    image: "🕶️",
  },
];

const recentOrders = [
  {
    id: "#ORD-0035",
    customer: { name: "Alex Morgan", email: "alex@example.com" },
    date: "Oct 24, 2023",
    status: "Completed",
    statusColor: "success",
    total: "$320.00",
  },
  {
    id: "#ORD-0034",
    customer: { name: "Sarah Smith", email: "sarah@example.com" },
    date: "Oct 24, 2023",
    status: "Pending",
    statusColor: "warning",
    total: "$145.50",
  },
  {
    id: "#ORD-0033",
    customer: { name: "James Doe", email: "james@example.com" },
    date: "Oct 23, 2023",
    status: "Processing",
    statusColor: "info",
    total: "$890.00",
  },
];

const navigationItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Orders", href: "/orders", icon: ShoppingBag },
  { name: "Products", href: "/products", icon: Package },
  { name: "Categories", href: "/categories", icon: Grid3x3 },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Marketing", href: "/marketing", icon: Megaphone },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Dashboard() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="p-8">
      {/* Command Palette */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.name}
                onSelect={() => {
                  navigate(item.href);
                  setOpen(false);
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Quick Actions">
            <CommandItem>
              <Search className="mr-2 h-4 w-4" />
              <span>Search Orders</span>
            </CommandItem>
            <CommandItem>
              <Package className="mr-2 h-4 w-4" />
              <span>Add Product</span>
            </CommandItem>
            <CommandItem>
              <Users className="mr-2 h-4 w-4" />
              <span>View Customers</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="relative h-9 w-[240px] justify-start text-sm text-muted-foreground sm:pr-12"
            onClick={() => setOpen(true)}
            title="Search (Ctrl+K or Cmd+K)"
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search...</span>
            <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`h-10 w-10 rounded-full ${card.iconBg} flex items-center justify-center text-lg`}>
                {card.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center gap-1 text-xs">
                {card.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={card.trend === "up" ? "text-green-600" : "text-red-600"}>
                  {card.change}
                </span>
                <span className="text-gray-500">{card.period}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Top Products */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales Revenue Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sales Revenue</CardTitle>
                <CardDescription>Last 30 Days</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="default" size="sm">Daily</Button>
                <Button variant="outline" size="sm">Weekly</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.name} className="flex items-center gap-4">
                  <div className="text-2xl">{product.image}</div>
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {product.price} • {product.sold}
                    </p>
                  </div>
                  <Badge variant={product.statusColor as any}>
                    {product.status}
                  </Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                View All Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Monitor your latest transactions</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Search className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ORDER ID</TableHead>
                <TableHead>CUSTOMER</TableHead>
                <TableHead>DATE</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>TOTAL</TableHead>
                <TableHead>ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback className="bg-gray-200">
                          {order.customer.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{order.customer.name}</p>
                        <p className="text-sm text-gray-500">{order.customer.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          order.statusColor === "success"
                            ? "bg-green-500"
                            : order.statusColor === "warning"
                            ? "bg-orange-500"
                            : "bg-blue-500"
                        }`}
                      />
                      <span>{order.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{order.total}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

