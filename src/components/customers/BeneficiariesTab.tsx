"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, UserCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Beneficiary,
  Product,
  relationshipTypeLabels,
  productTypeLabels,
} from "@/types/database";

interface BeneficiariesTabProps {
  customerId: string;
  beneficiaries: (Beneficiary & { product?: { type: string; company?: string; policy_number?: string } })[];
  products: Product[];
  onUpdate: (beneficiaries: Beneficiary[]) => void;
}

const emptyBeneficiary: Partial<Beneficiary> = {
  first_name: "",
  last_name: "",
  id_number: "",
  relationship: "",
  percentage: undefined,
  phone: "",
  email: "",
  notes: "",
  product_id: undefined,
};

export default function BeneficiariesTab({
  customerId,
  beneficiaries,
  products,
  onUpdate,
}: BeneficiariesTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<Partial<Beneficiary> | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editingBeneficiary?.first_name || !editingBeneficiary?.last_name) {
      toast.error("יש להזין שם מלא");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/customers/${customerId}/beneficiaries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBeneficiary),
      });

      if (response.ok) {
        const result = await response.json();
        const isNew = !editingBeneficiary.id;
        if (isNew) {
          onUpdate([...beneficiaries, result.data]);
        } else {
          onUpdate(
            beneficiaries.map((b) =>
              b.id === editingBeneficiary.id ? result.data : b
            )
          );
        }
        setDialogOpen(false);
        setEditingBeneficiary(null);
        toast.success("מוטב נשמר בהצלחה");
      } else {
        toast.error("שגיאה בשמירת מוטב");
      }
    } catch {
      toast.error("שגיאה בשמירת מוטב");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("האם למחוק את המוטב?")) return;

    try {
      const response = await fetch(`/api/customers/${customerId}/beneficiaries`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        onUpdate(beneficiaries.filter((b) => b.id !== id));
        toast.success("מוטב נמחק");
      }
    } catch {
      toast.error("שגיאה במחיקה");
    }
  };

  const openDialog = (beneficiary?: Beneficiary) => {
    setEditingBeneficiary(beneficiary || { ...emptyBeneficiary });
    setDialogOpen(true);
  };

  // Group beneficiaries by product
  const groupedByProduct = beneficiaries.reduce((acc, b) => {
    const productId = b.product_id || "general";
    if (!acc[productId]) {
      acc[productId] = [];
    }
    acc[productId].push(b);
    return acc;
  }, {} as Record<string, typeof beneficiaries>);

  const generalBeneficiaries = groupedByProduct["general"] || [];
  const productBeneficiaries = Object.entries(groupedByProduct).filter(
    ([key]) => key !== "general"
  );

  return (
    <div className="space-y-6">
      {/* General Beneficiaries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            מוטבים כלליים
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => openDialog()}>
            <Plus className="h-4 w-4 ml-2" />
            הוסף מוטב
          </Button>
        </CardHeader>
        <CardContent>
          {generalBeneficiaries.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              לא הוזנו מוטבים כלליים
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>שם</TableHead>
                  <TableHead>ת.ז.</TableHead>
                  <TableHead>קרבה</TableHead>
                  <TableHead>אחוז</TableHead>
                  <TableHead>טלפון</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generalBeneficiaries.map((beneficiary) => (
                  <TableRow key={beneficiary.id}>
                    <TableCell className="font-medium">
                      {beneficiary.first_name} {beneficiary.last_name}
                    </TableCell>
                    <TableCell dir="ltr">{beneficiary.id_number || "-"}</TableCell>
                    <TableCell>
                      {beneficiary.relationship
                        ? relationshipTypeLabels[beneficiary.relationship as keyof typeof relationshipTypeLabels] ||
                          beneficiary.relationship
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {beneficiary.percentage ? `${beneficiary.percentage}%` : "-"}
                    </TableCell>
                    <TableCell dir="ltr">{beneficiary.phone || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(beneficiary)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          onClick={() => handleDelete(beneficiary.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Product-specific Beneficiaries */}
      {productBeneficiaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>מוטבים לפי מוצר</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {productBeneficiaries.map(([productId, productBenefs]) => {
              const product = products.find((p) => p.id === productId);
              return (
                <div key={productId} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">
                      {product ? productTypeLabels[product.type] : "מוצר לא ידוע"}
                    </Badge>
                    {product?.policy_number && (
                      <span className="text-sm text-muted-foreground" dir="ltr">
                        {product.policy_number}
                      </span>
                    )}
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>שם</TableHead>
                        <TableHead>קרבה</TableHead>
                        <TableHead>אחוז</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productBenefs.map((beneficiary) => (
                        <TableRow key={beneficiary.id}>
                          <TableCell>
                            {beneficiary.first_name} {beneficiary.last_name}
                          </TableCell>
                          <TableCell>
                            {beneficiary.relationship
                              ? relationshipTypeLabels[
                                  beneficiary.relationship as keyof typeof relationshipTypeLabels
                                ] || beneficiary.relationship
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {beneficiary.percentage ? `${beneficiary.percentage}%` : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDialog(beneficiary)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600"
                                onClick={() => handleDelete(beneficiary.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingBeneficiary?.id ? "עריכת מוטב" : "הוספת מוטב"}
            </DialogTitle>
            <DialogDescription>מלא את פרטי המוטב</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>שם פרטי *</Label>
                <Input
                  value={editingBeneficiary?.first_name || ""}
                  onChange={(e) =>
                    setEditingBeneficiary({
                      ...editingBeneficiary,
                      first_name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>שם משפחה *</Label>
                <Input
                  value={editingBeneficiary?.last_name || ""}
                  onChange={(e) =>
                    setEditingBeneficiary({
                      ...editingBeneficiary,
                      last_name: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ת.ז.</Label>
                <Input
                  value={editingBeneficiary?.id_number || ""}
                  onChange={(e) =>
                    setEditingBeneficiary({
                      ...editingBeneficiary,
                      id_number: e.target.value,
                    })
                  }
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>קרבה</Label>
                <Select
                  value={editingBeneficiary?.relationship || ""}
                  onValueChange={(value) =>
                    setEditingBeneficiary({
                      ...editingBeneficiary,
                      relationship: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(relationshipTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                    <SelectItem value="friend">חבר/ה</SelectItem>
                    <SelectItem value="business_partner">שותף עסקי</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>אחוז</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editingBeneficiary?.percentage || ""}
                  onChange={(e) =>
                    setEditingBeneficiary({
                      ...editingBeneficiary,
                      percentage: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>מוצר מקושר</Label>
                <Select
                  value={editingBeneficiary?.product_id || ""}
                  onValueChange={(value) =>
                    setEditingBeneficiary({
                      ...editingBeneficiary,
                      product_id: value || undefined,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="כללי (ללא מוצר)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">כללי (ללא מוצר)</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {productTypeLabels[product.type]}{" "}
                        {product.policy_number ? `(${product.policy_number})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>טלפון</Label>
                <Input
                  value={editingBeneficiary?.phone || ""}
                  onChange={(e) =>
                    setEditingBeneficiary({
                      ...editingBeneficiary,
                      phone: e.target.value,
                    })
                  }
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>דוא&quot;ל</Label>
                <Input
                  type="email"
                  value={editingBeneficiary?.email || ""}
                  onChange={(e) =>
                    setEditingBeneficiary({
                      ...editingBeneficiary,
                      email: e.target.value,
                    })
                  }
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>הערות</Label>
              <Textarea
                value={editingBeneficiary?.notes || ""}
                onChange={(e) =>
                  setEditingBeneficiary({
                    ...editingBeneficiary,
                    notes: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                ביטול
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-brand-blue hover:bg-brand-blue/90"
              >
                שמירה
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
