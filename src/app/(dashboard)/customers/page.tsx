"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  MoreVertical,
  Phone,
  Mail,
  Eye,
  Star,
  Loader2,
} from "lucide-react";
import { Customer } from "@/types/database";

interface CustomerWithProducts extends Customer {
  products: { count: number }[];
}

function QualityStars({ score }: { score: number | null | undefined }) {
  const safeScore = score || 0;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= safeScore
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<CustomerWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const response = await fetch(`/api/customers?${params}`);
      const result = await response.json();

      if (result.data) {
        setCustomers(result.data);
        setTotalCount(result.count || result.data.length);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [fetchCustomers]);

  const getProductsCount = (customer: CustomerWithProducts) => {
    if (customer.products && Array.isArray(customer.products)) {
      return customer.products.length;
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">לקוחות</h1>
          <p className="text-muted-foreground">ניהול כל הלקוחות במערכת</p>
        </div>
        <Link href="/customers/new">
          <Button className="bg-brand-blue hover:bg-brand-blue/90">
            <Plus className="ml-2 h-4 w-4" />
            לקוח חדש
          </Button>
        </Link>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">חיפוש וסינון</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="חיפוש לפי שם, ת.ז., טלפון או אימייל..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>רשימת לקוחות</CardTitle>
              <CardDescription>
                סה&quot;כ {totalCount} לקוחות
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {search ? "לא נמצאו לקוחות התואמים לחיפוש" : "אין לקוחות במערכת. הוסף לקוח חדש!"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">שם מלא</TableHead>
                  <TableHead className="text-right">טלפון</TableHead>
                  <TableHead className="text-right">מוצרים</TableHead>
                  <TableHead className="text-right">ציון איכות</TableHead>
                  <TableHead className="text-right w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer hover:bg-accent/50"
                  >
                    <TableCell>
                      <Link
                        href={`/customers/${customer.id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue/10 font-medium text-brand-blue">
                          {customer.first_name.charAt(0)}
                          {customer.last_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">
                            {customer.first_name} {customer.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {customer.id_number}
                          </p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span dir="ltr">{customer.mobile || customer.phone || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getProductsCount(customer)} מוצרים
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <QualityStars score={customer.quality_score} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem asChild>
                            <Link href={`/customers/${customer.id}`}>
                              <Eye className="ml-2 h-4 w-4" />
                              צפייה בכרטיס
                            </Link>
                          </DropdownMenuItem>
                          {customer.mobile && (
                            <DropdownMenuItem asChild>
                              <a href={`tel:${customer.mobile}`}>
                                <Phone className="ml-2 h-4 w-4" />
                                התקשר
                              </a>
                            </DropdownMenuItem>
                          )}
                          {customer.email && (
                            <DropdownMenuItem asChild>
                              <a href={`mailto:${customer.email}`}>
                                <Mail className="ml-2 h-4 w-4" />
                                שלח אימייל
                              </a>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
