import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, FileEdit, ArrowRightLeft, Merge, Calendar, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  product_type: string;
  company: string;
  policy_number?: string;
  main_track?: string;
  source: string;
  status: string;
  employment_type?: string;
  accumulated_amount?: number;
  monthly_deposit?: number;
  management_fee_deposits?: number;
  management_fee_accumulated?: number;
  start_date?: string;
  seniority_years?: number;
  recommendation?: string;
  recommendation_notes?: string;
  coverage_amount?: number;
  premium?: number;
  notes?: string;
}

interface Props {
  clientId: string;
}

const productTypeLabels: Record<string, string> = {
  pension_fund: 'קרן פנסיה',
  provident_fund: 'קופת גמל',
  education_fund: 'קרן השתלמות',
  life_insurance: 'ביטוח חיים',
  health_insurance: 'ביטוח בריאות',
  disability: 'אובדן כושר עבודה',
  critical_illness: 'מחלות קשות',
  nursing: 'סיעודי',
  property: 'אלמנטר',
  group: 'קבוצתי',
  other: 'אחר'
};

const productTypeFilters = [
  { value: 'all', label: 'הצג הכל' },
  { value: 'pension_fund', label: 'קרן פנסיה' },
  { value: 'provident_fund', label: 'קופת גמל' },
  { value: 'education_fund', label: 'קרן השתלמות' },
  { value: 'life_insurance', label: 'פוליסה' },
  { value: 'property', label: 'אלמנטר' },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: 'פעיל', color: 'bg-green-100 text-green-800' },
  inactive: { label: 'לא פעיל', color: 'bg-gray-100 text-gray-800' },
  frozen: { label: 'מוקפא', color: 'bg-blue-100 text-blue-800' },
  cancelled: { label: 'מסולק', color: 'bg-red-100 text-red-800' },
};

const sourceLabels: Record<string, string> = {
  mislaka: 'מסלקה',
  har_habituach: 'הר הביטוח',
  manual: 'ידני'
};

const companies = [
  'כלל', 'מגדל', 'הפניקס', 'הראל', 'מנורה מבטחים',
  'איילון', 'הכשרה', 'פסגות', 'מיטב דש', 'אלטשולר שחם'
];

const CustomerPortfolioSection = ({ clientId }: Props) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    product_type: 'pension_fund',
    status: 'active',
    source: 'manual'
  });

  useEffect(() => {
    fetchProducts();
  }, [clientId]);

  const fetchProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('customer_products')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('לא מחובר');

      if (editingProduct) {
        const { error } = await supabase
          .from('customer_products')
          .update(formData)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('customer_products')
          .insert({
            ...formData,
            client_id: clientId,
            agent_id: user.id
          });
        if (error) throw error;
      }

      toast({
        title: "נשמר בהצלחה",
        description: editingProduct ? "המוצר עודכן" : "מוצר נוסף"
      });

      setIsDialogOpen(false);
      setEditingProduct(null);
      setFormData({ product_type: 'pension_fund', status: 'active', source: 'manual' });
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "שגיאה בשמירה",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק את המוצר?')) return;

    try {
      const { error } = await supabase
        .from('customer_products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "נמחק בהצלחה" });
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "שגיאה במחיקה",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedProducts.length === 0) {
      toast({ title: "לא נבחרו מוצרים", variant: "destructive" });
      return;
    }

    toast({
      title: `פעולה: ${action}`,
      description: `${selectedProducts.length} מוצרים נבחרו`
    });
    setSelectedProducts([]);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    setFormData({ product_type: 'pension_fund', status: 'active', source: 'manual' });
    setIsDialogOpen(true);
  };

  const formatCurrency = (value?: number): string => {
    if (!value) return '-';
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(value);
  };

  const filteredProducts = products.filter(p => {
    if (activeFilter !== 'all' && p.product_type !== activeFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  const toggleProductSelection = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle>תיק לקוח</CardTitle>
          <div className="flex gap-2">
            {selectedProducts.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    פעולות ({selectedProducts.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleBulkAction('transfer')}>
                    <ArrowRightLeft className="h-4 w-4 ml-2" />
                    ניוד
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('consolidate')}>
                    <Merge className="h-4 w-4 ml-2" />
                    איחוד קופות
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('forms')}>
                    <FileEdit className="h-4 w-4 ml-2" />
                    המשך מילוי טפסים
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('delete')} className="text-destructive">
                    <Trash2 className="h-4 w-4 ml-2" />
                    מחיקה
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog} size="sm">
                  <Plus className="h-4 w-4 ml-2" />
                  הוספת מוצר
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" dir="rtl">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'עריכת מוצר' : 'הוספת מוצר'}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>סוג מוצר *</Label>
                    <Select
                      value={formData.product_type || 'pension_fund'}
                      onValueChange={(value) => setFormData({ ...formData, product_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(productTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>חברה *</Label>
                    <Select
                      value={formData.company || ''}
                      onValueChange={(value) => setFormData({ ...formData, company: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר חברה" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map(company => (
                          <SelectItem key={company} value={company}>{company}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>מספר פוליסה/עמית</Label>
                    <Input
                      value={formData.policy_number || ''}
                      onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
                      placeholder="מספר"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>מסלול ראשי</Label>
                    <Input
                      value={formData.main_track || ''}
                      onChange={(e) => setFormData({ ...formData, main_track: e.target.value })}
                      placeholder="שם מסלול"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>מקור</Label>
                    <Select
                      value={formData.source || 'manual'}
                      onValueChange={(value) => setFormData({ ...formData, source: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mislaka">מסלקה</SelectItem>
                        <SelectItem value="har_habituach">הר הביטוח</SelectItem>
                        <SelectItem value="manual">ידני</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>סטטוס</Label>
                    <Select
                      value={formData.status || 'active'}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">פעיל</SelectItem>
                        <SelectItem value="inactive">לא פעיל</SelectItem>
                        <SelectItem value="frozen">מוקפא</SelectItem>
                        <SelectItem value="cancelled">מסולק</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>צבירה</Label>
                    <Input
                      type="number"
                      value={formData.accumulated_amount || ''}
                      onChange={(e) => setFormData({ ...formData, accumulated_amount: parseFloat(e.target.value) || undefined })}
                      placeholder="סכום"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>הפקדה חודשית</Label>
                    <Input
                      type="number"
                      value={formData.monthly_deposit || ''}
                      onChange={(e) => setFormData({ ...formData, monthly_deposit: parseFloat(e.target.value) || undefined })}
                      placeholder="סכום"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>תאריך התחלה</Label>
                    <Input
                      type="date"
                      value={formData.start_date || ''}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>המלצה</Label>
                    <Select
                      value={formData.recommendation || ''}
                      onValueChange={(value) => setFormData({ ...formData, recommendation: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="keep">להשאיר</SelectItem>
                        <SelectItem value="replace">להחליף</SelectItem>
                        <SelectItem value="cancel">לבטל</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label>הערות</Label>
                    <Textarea
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="הערות..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    ביטול
                  </Button>
                  <Button onClick={handleSave}>
                    שמור
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Tabs value={activeFilter} onValueChange={setActiveFilter}>
            <TabsList className="h-8">
              {productTypeFilters.map(filter => (
                <TabsTrigger key={filter.value} value={filter.value} className="text-xs px-2 h-7">
                  {filter.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex gap-2 mr-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue placeholder="סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                <SelectItem value="active">פעיל</SelectItem>
                <SelectItem value="inactive">לא פעיל</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue placeholder="מיון" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">תאריך</SelectItem>
                <SelectItem value="seniority">וותק</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Table */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground">לא נמצאו מוצרים</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedProducts.length === filteredProducts.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-right">סוג</TableHead>
                  <TableHead className="text-right">חברה</TableHead>
                  <TableHead className="text-right">פוליסה/עמית</TableHead>
                  <TableHead className="text-right">מקור</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                  <TableHead className="text-right">צבירה</TableHead>
                  <TableHead className="text-right">הפקדה</TableHead>
                  <TableHead className="text-right">המלצה</TableHead>
                  <TableHead className="text-right">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => toggleProductSelection(product.id)}
                      />
                    </TableCell>
                    <TableCell onClick={() => openEditDialog(product)}>
                      {productTypeLabels[product.product_type] || product.product_type}
                    </TableCell>
                    <TableCell onClick={() => openEditDialog(product)}>{product.company}</TableCell>
                    <TableCell onClick={() => openEditDialog(product)}>{product.policy_number || '-'}</TableCell>
                    <TableCell onClick={() => openEditDialog(product)}>
                      {sourceLabels[product.source] || product.source}
                    </TableCell>
                    <TableCell onClick={() => openEditDialog(product)}>
                      <Badge className={statusLabels[product.status]?.color || ''}>
                        {statusLabels[product.status]?.label || product.status}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={() => openEditDialog(product)}>
                      {formatCurrency(product.accumulated_amount)}
                    </TableCell>
                    <TableCell onClick={() => openEditDialog(product)}>
                      {formatCurrency(product.monthly_deposit)}
                    </TableCell>
                    <TableCell onClick={() => openEditDialog(product)}>
                      {product.recommendation === 'keep' ? '✓ להשאיר' :
                       product.recommendation === 'replace' ? '↔ להחליף' :
                       product.recommendation === 'cancel' ? '✗ לבטל' : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">סה״כ צבירה:</span>
            <span className="font-bold mr-2">
              {formatCurrency(filteredProducts.reduce((sum, p) => sum + (p.accumulated_amount || 0), 0))}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">סה״כ הפקדה:</span>
            <span className="font-bold mr-2">
              {formatCurrency(filteredProducts.reduce((sum, p) => sum + (p.monthly_deposit || 0), 0))}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">מוצרים:</span>
            <span className="font-bold mr-2">{filteredProducts.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerPortfolioSection;
